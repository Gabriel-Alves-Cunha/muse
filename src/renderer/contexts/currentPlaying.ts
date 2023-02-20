import type { DateAsNumber, Media, Path } from "@common/@types/generalTypes";
import type { ValuesOf } from "@common/@types/utils";

import { subscribeKey } from "valtio/utils";
import { proxy } from "valtio";

import { localStorageKeys, setLocalStorage } from "@utils/localStorage";
import { getRandomInt, time } from "@utils/utils";
import { warn, error, info } from "@common/log";
import { PlaylistListEnum } from "@common/enums";
import { playOptions } from "./playOptions";
import { getFirstKey } from "@utils/map-set";
import { data_path } from "./allSelectedMedias";
import {
	type MainList,
	type History,
	addToHistory,
	getPlaylist,
	playlists,
	getMedia,
} from "./playlists";

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Constants:

let storagedCurrentPlaying: CurrentPlaying | undefined;
const storagedCurrentPlayingString = localStorage.getItem(
	localStorageKeys.currentPlaying,
);
if (storagedCurrentPlayingString)
	storagedCurrentPlaying = JSON.parse(storagedCurrentPlayingString);

export const currentPlaying = proxy<CurrentPlaying>(
	storagedCurrentPlaying ?? {
		listType: PlaylistListEnum.mainList,
		lastStoppedTime: 0,
		path: "",
	},
);

export function setDefaultCurrentPlaying() {
	currentPlaying.listType = PlaylistListEnum.mainList;
	currentPlaying.lastStoppedTime = 0;
	currentPlaying.path = "";
}

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Helper functions:

export function playThisMedia(
	path: Path,
	listType: ValuesOf<typeof PlaylistListEnum> = PlaylistListEnum.mainList,
): void {
	currentPlaying.lastStoppedTime = 0;
	currentPlaying.listType = listType;
	currentPlaying.path = path;
}

////////////////////////////////////////////////

export const getAudio = () =>
	document.getElementById("audio") as HTMLAudioElement | null;

////////////////////////////////////////////////

export function togglePlayPause() {
	const audio = getAudio();
	if (!audio?.src) return;

	audio?.paused ? play() : pause();
}

////////////////////////////////////////////////

export const play = () => getAudio()?.play().then();

////////////////////////////////////////////////

export function pause(): void {
	const audio = getAudio();
	if (!audio?.src) return;

	audio.pause();
	const lastStoppedTime = audio.currentTime;

	if (lastStoppedTime > 60 /* seconds */)
		currentPlaying.lastStoppedTime = lastStoppedTime;
}

////////////////////////////////////////////////

function sortHistoryByDate() {
	const unsortedList: [Path, DateAsNumber][] = [];

	for (const [path, dates] of getPlaylist(PlaylistListEnum.history) as History)
		for (const date of dates) unsortedList.push([path, date]);

	const mainList = playlists.sortedByTitleAndMainList;

	const listAsArrayOfMap: [Path, Media, DateAsNumber][] = unsortedList
		.sort((a, b) => b[1] - a[1]) // sorted by date
		.map(([id, date]) => [id, mainList.get(id)!, date]);

	return listAsArrayOfMap;
}

////////////////////////////////////////////////

export function playPreviousMedia(): void {
	time(() => {
		const { path, listType } = currentPlaying;

		if (!path)
			return warn(
				"A media needs to be currently selected to play a previous media!",
			);

		// We don't play previous media if it's the history list:
		const correctListType =
			listType === PlaylistListEnum.history
				? PlaylistListEnum.mainList
				: listType;

		const history = sortHistoryByDate();

		if (history.length < 2)
			return error(
				"There should be at least 2 medias on history to be able to play a previous media, but there isn't!",
				history,
			);

		// In the history list, the first is the newest.
		// @ts-ignore => I garanteed above that a second media is present:
		const [_firstMedia, [previousMediaPath]] = history;

		playThisMedia(previousMediaPath, correctListType);
	}, "playPreviousMedia");
}

////////////////////////////////////////////////

export function playNextMedia(): void {
	// If this ever becomes too slow, maybe make an array of ids === mainList.keys().
	time(() => {
		const { path, listType } = currentPlaying;

		if (!path)
			return info(
				"A media needs to be currently selected to play a next media!",
			);

		// We don't play next media if it's the history list, tho I'm not entirely sure this is needed:
		const correctListType =
			listType === PlaylistListEnum.history
				? PlaylistListEnum.mainList
				: listType;

		// Get the correct list:
		const list = getPlaylist(correctListType) as ReadonlySet<Path> | MainList;

		const paths = list.keys();
		let nextMediaPath = "";

		if (playOptions.isRandom) {
			const randomIndex = getRandomInt(0, list.size);
			let index = 0;
			let curr;

			while (!(curr = paths.next()).done) {
				if (index === randomIndex) {
					nextMediaPath = curr.value;
					break;
				}

				++index;
			}
		} else {
			let found = false;

			for (const newID of paths) {
				if (found) {
					nextMediaPath = newID;
					break;
				}

				if (newID === path) found = true;
			}

			// In case the currently playing is the last media, get the first:
			if (!nextMediaPath) nextMediaPath = getFirstKey(list)!;
		}

		if (!nextMediaPath)
			return warn("There should be a nextMediaPath, but there isn't!", {
				currentPlaying: currentPlaying,
				nextMediaPath,
				list,
			});

		currentPlaying.listType = correctListType;
		currentPlaying.lastStoppedTime = 0;
		currentPlaying.path = nextMediaPath;
	}, "playNextMedia");
}

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Register functions to window mediaSession:

navigator?.mediaSession?.setActionHandler?.("previoustrack", playPreviousMedia);
navigator?.mediaSession?.setActionHandler?.("nexttrack", playNextMedia);
navigator?.mediaSession?.setActionHandler?.("pause", () => pause());
navigator?.mediaSession?.setActionHandler?.("play", () => play());

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////

let prevPath = "";

subscribeKey(
	currentPlaying,
	"path",
	// Update history and set audio source:
	(newPath) => {
		if (!newPath) return;

		addToHistory(newPath);

		setAudioSource(newPath, prevPath);
	},
);

////////////////////////////////////////////////
// Handle what happens when the `currentPlaying.path` changes:

// A timeout for in case the user changes media too fast:
// we don't load the media until the timeout ends.
let prevTimerToSetMedia: NodeJS.Timeout | undefined;

function setAudioSource(newPath: Path, prevPath: Path) {
	clearTimeout(prevTimerToSetMedia);

	const media = getMedia(newPath);
	if (!media) return;

	const mediaPathSuitableForElectron = `atom:///${newPath}`;

	const timerToSetMedia = setTimeout(() => {
		const audio = getAudio();
		if (!audio) return;

		audio.src = mediaPathSuitableForElectron;

		setLocalStorage(localStorageKeys.currentPlaying, currentPlaying);

		changeMediaSessionMetadata(media);

		time(
			() => handleDecorateMediaRow(newPath, prevPath),
			"handleDecorateMediaRow",
		);
	}, 150);

	prevTimerToSetMedia = timerToSetMedia;
}

////////////////////////////////////////////////

const isPlayingRowDatalistString = "isPlayingRow";

/**
 * Decorate the rows of current playing medias
 * and undecorate previous playing ones.
 */
function handleDecorateMediaRow(newPath: Path, prevPath: Path) {
	const prevElements = prevPath
		? document.querySelectorAll(data_path(prevPath))
		: null;
	const newElements = document.querySelectorAll(data_path(newPath));

	if (!prevElements) info(`No previous media row found for "${prevPath}!"`);
	if (!newElements) return info(`No media row found for "${newPath}"!`);

	if (prevPath && prevElements)
		// Undecorate previous playing media row:
		for (const element of prevElements as NodeListOf<HTMLElement>)
			element.dataset[isPlayingRowDatalistString] = "false";

	// Decorate new playing media row:
	for (const element of newElements as NodeListOf<HTMLElement>)
		element.dataset[isPlayingRowDatalistString] = "true";
}

////////////////////////////////////////////////

function changeMediaSessionMetadata(media: Media): void {
	if (!navigator?.mediaSession) return;

	navigator.mediaSession.metadata = new MediaMetadata({
		artwork: [{ src: media.image }],
		artist: media.artist,
		title: media.title,
		album: media.album,
	});
}

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Types:

export type CurrentPlaying = {
	listType: ValuesOf<typeof PlaylistListEnum>;
	lastStoppedTime: number;
	path: Path;
};
