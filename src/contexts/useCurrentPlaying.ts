import type { DateAsNumber, Media, Path } from "@renderer/common/@types/generalTypes";
import type { ValuesOf } from "@renderer/common/@types/utils";

import { subscribeWithSelector } from "zustand/middleware";
import { create } from "zustand";

import { setCurrentPlayingOnLocalStorage } from "./localStorageHelpers";
import { getRandomInt, time } from "@utils/utils";
import { warn, error, info } from "@renderer/common/log";
import { getPlayOptions } from "./usePlayOptions";
import { playlistList } from "@renderer/common/enums";
import { getFirstKey } from "@utils/map-set";
import { data_path } from "./useAllSelectedMedias";
import {
	type MainList,
	addToHistory,
	getPlaylist,
	getMainList,
	getMedia,
	History,
} from "./usePlaylists";

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Constants:

export const defaultCurrentPlaying: CurrentPlaying = {
	listType: playlistList.mainList,
	lastStoppedTime: 0,
	path: "",
};

export const useCurrentPlaying = create<CurrentPlaying>()(
	subscribeWithSelector(
		setCurrentPlayingOnLocalStorage(
			(_set, _get, _api) => defaultCurrentPlaying,
			"currentPlaying",
		),
	),
);

export const { getState: getCurrentPlaying, setState: setCurrentPlaying } =
	useCurrentPlaying;

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Helper functions:

export const playThisMedia = (
	path: Path,
	listType: ValuesOf<typeof playlistList> = playlistList.mainList,
): void => setCurrentPlaying({ path, lastStoppedTime: 0, listType });

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
		setCurrentPlaying({ lastStoppedTime });
}

////////////////////////////////////////////////

function sortHistoryByDate() {
	const unsortedList: [Path, DateAsNumber][] = [];

	for (const [path, dates] of getPlaylist(playlistList.history) as History)
		for (const date of dates) unsortedList.push([path, date]);

	const mainList = getMainList();

	const listAsArrayOfMap: [Path, Media, DateAsNumber][] = unsortedList
		.sort((a, b) => b[1] - a[1]) // sorted by date
		.map(([id, date]) => [id, mainList.get(id)!, date]);

	return listAsArrayOfMap;
}

////////////////////////////////////////////////

export function playPreviousMedia(): void {
	time(() => {
		const { path, listType } = getCurrentPlaying();

		if (!path)
			return warn(
				"A media needs to be currently selected to play a previous media!",
			);

		// We don't play previous media if it's the history list:
		const correctListType =
			listType === playlistList.history ? playlistList.mainList : listType;

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
		const { path, listType } = getCurrentPlaying();

		if (!path)
			return info(
				"A media needs to be currently selected to play a next media!",
			);

		// We don't play next media if it's the history list, tho I'm not entirely sure this is needed:
		const correctListType =
			listType === playlistList.history ? playlistList.mainList : listType;

		// Get the correct list:
		const list = getPlaylist(correctListType) as ReadonlySet<Path> | MainList;

		const ids = list.keys();
		let nextMediaID = "";

		if (getPlayOptions().isRandom) {
			const randomIndex = getRandomInt(0, list.size);
			let index = 0;
			let curr;

			while (!(curr = ids.next()).done) {
				if (index === randomIndex) {
					nextMediaID = curr.value;
					break;
				}

				++index;
			}
		} else {
			let found = false;

			for (const newID of ids) {
				if (found) {
					nextMediaID = newID;
					break;
				}

				if (newID === path) found = true;
			}

			// In case the currently playing is the last media, get the first:
			if (!nextMediaID) nextMediaID = getFirstKey(list)!;
		}

		if (!nextMediaID)
			return warn("There should be a nextMediaPath, but there isn't!", {
				currentPlaying: getCurrentPlaying(),
				nextMediaID,
				list,
			});

		setCurrentPlaying({
			listType: correctListType,
			lastStoppedTime: 0,
			path: nextMediaID,
		});
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

useCurrentPlaying.subscribe(
	(state) => state.path,
	// Update history and set audio source:
	(newPath, prevPath) => {
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
	listType: ValuesOf<typeof playlistList>;
	lastStoppedTime: number;
	path: Path;
};
