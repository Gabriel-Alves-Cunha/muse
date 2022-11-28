import type { DateAsNumber, Media, Path } from "@common/@types/generalTypes";
import type { ValuesOf } from "@common/@types/utils";

import { subscribeWithSelector } from "zustand/middleware";
import create from "zustand";

import { setCurrentPlayingOnLocalStorage } from "./localStorageHelpers";
import { getRandomInt, time } from "@utils/utils";
import { getPlayOptions } from "./usePlayOptions";
import { playlistList } from "@common/enums";
import { emptyString } from "@common/empty";
import { getFirstKey } from "@utils/map-set";
import {
	type MainList,
	addToHistory,
	getPlaylist,
	getMainList,
	History,
} from "./usePlaylists";

const { log, warn, error, info } = console;

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Constants:

export const defaultCurrentPlaying: CurrentPlaying = {
	listType: playlistList.mainList,
	path: emptyString,
	currentTime: 0,
};

export const useCurrentPlaying = create<CurrentPlaying>()(
	subscribeWithSelector(
		setCurrentPlayingOnLocalStorage(
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
): void => setCurrentPlaying({ path, currentTime: 0, listType });

////////////////////////////////////////////////

export async function togglePlayPause(): Promise<void> {
	const audio = document.getElementById("audio") as HTMLAudioElement;

	audio.paused ? await play(audio) : pause(audio);
}

////////////////////////////////////////////////

export async function play(audio?: HTMLAudioElement): Promise<void> {
	audio !== undefined
		? await audio.play()
		: await (document.getElementById("audio") as HTMLAudioElement).play();
}

////////////////////////////////////////////////

export function pause(audio?: HTMLAudioElement): void {
	if (audio === undefined)
		audio = document.getElementById("audio") as HTMLAudioElement;

	audio.pause();
	const currentTime = audio.currentTime;

	if (currentTime > 60 /* seconds */) setCurrentPlaying({ currentTime });
}

////////////////////////////////////////////////

function sortHistoryByDate() {
	const unsortedList: [Path, DateAsNumber][] = [];

	for (const [path, dates] of getPlaylist(playlistList.history) as History)
		for (const date of dates) unsortedList.push([path, date]);

	const mainList = getMainList();

	const listAsArrayOfMap: [Path, Media, DateAsNumber][] = unsortedList
		.sort((a, b) => b[1] - a[1]) // sorted by date
		.map(([path, date]) => [path, mainList.get(path)!, date]);

	return listAsArrayOfMap;
}

export function playPreviousMedia(): void {
	time(() => {
		const { path, listType } = getCurrentPlaying();

		if (path.length === 0)
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
	time(() => {
		const { path, listType } = getCurrentPlaying();

		if (path.length === 0)
			return info(
				"A media needs to be currently selected to play a next media!",
			);

		// We don't play next media if it's the history list, tho I'm not entirely sure this is needed:
		const correctListType =
			listType === playlistList.history ? playlistList.mainList : listType;

		// Get the correct list:
		const list = getPlaylist(correctListType) as Set<string> | MainList;

		let nextMediaPath = emptyString;

		if (getPlayOptions().random) {
			const randomIndex = getRandomInt(0, list.size);

			let index = 0;
			for (const newPath of list.keys()) {
				if (index === randomIndex) {
					nextMediaPath = newPath;
					break;
				}
				++index;
			}
		} else {
			let found = false;

			for (const newPath of list.keys()) {
				if (found) {
					nextMediaPath = newPath;
					break;
				}

				if (newPath === path) found = true;
			}

			// In case the currently playing is the last media, get the first:
			if (nextMediaPath.length === 0) nextMediaPath = getFirstKey(list) as Path;
		}

		if (nextMediaPath.length === 0)
			return warn("There should be a nextMediaPath, but there isn't!", {
				currentPlaying: getCurrentPlaying(),
				nextMediaPath,
				list,
			});

		setCurrentPlaying({ path: nextMediaPath, currentTime: 0 });
	}, "playNextMedia");
}

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Register functions to window mediaSession:

navigator?.mediaSession?.setActionHandler?.("previoustrack", playPreviousMedia);
navigator?.mediaSession?.setActionHandler?.("play", async () => await play());
navigator?.mediaSession?.setActionHandler?.("nexttrack", playNextMedia);
navigator?.mediaSession?.setActionHandler?.("pause", () => pause());

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////

useCurrentPlaying.subscribe(
	(state) => state.path,
	function updateHistoryAndSetAudioSource(newPath, prevPath) {
		if (newPath.length === 0) return;

		addToHistory(newPath);

		setAudioSource(newPath, prevPath);
	},
);

////////////////////////////////////////////////
// Handle what happens when the `currentPlaying.path` changes:

// A timeout for in case the user changes media too fast:
// we don't load the media until the timeout ends.
let prevTimerToSetMedia: NodeJS.Timeout | undefined;

function setAudioSource(path: Path, prevPath: Path) {
	clearTimeout(prevTimerToSetMedia);

	const mediaPathSuitableForElectron = `atom:///${path}`;

	const timerToSetMedia = setTimeout(() => {
		(document.getElementById("audio") as HTMLAudioElement).src =
			mediaPathSuitableForElectron;

		changeMediaSessionMetadata(path);

		time(
			() => handleDecorateMediaRow(path, prevPath),
			"handleDecorateMediaRow",
		);
	}, 150);

	prevTimerToSetMedia = timerToSetMedia;
}

////////////////////////////////////////////////

const playingClass = "playing";

/**
 * Decorate the rows of current playing medias
 * and undecorate previous playing ones.
 */
function handleDecorateMediaRow(path: Path, previousPath: Path) {
	const prevElements =
		previousPath.length > 0
			? document.querySelectorAll(`[data-path="${previousPath}"]`)
			: null;
	const newElements = document.querySelectorAll(`[data-path="${path}"]`);

	if (prevElements === null)
		info(`No previous media row found for "${previousPath}!"`);
	if (newElements === null) return info(`No media row found for "${path}"!`);

	// Undecorate previous playing media row:
	if (previousPath.length !== 0 && prevElements !== null)
		for (const element of prevElements) element.classList.remove(playingClass);

	// Decorate new playing media row:
	for (const element of newElements) element.classList.add(playingClass);
}

////////////////////////////////////////////////

function changeMediaSessionMetadata(path: Path): void {
	if (navigator?.mediaSession === undefined) return;

	const media = getMainList().get(path);

	if (media === undefined) return;

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

export type CurrentPlaying = Readonly<{
	listType: ValuesOf<typeof playlistList>;
	currentTime: number;
	path: Path;
}>;
