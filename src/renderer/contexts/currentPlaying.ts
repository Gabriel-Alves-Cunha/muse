import type { DateAsNumber, Media, Path } from "@common/@types/generalTypes";
import type { ValuesOf } from "@common/@types/utils";

import { batch, createEffect, on } from "solid-js";
import { createStore } from "solid-js/store";

import { keys, setLocalStorage } from "@utils/localStorage";
import { getRandomInt, time } from "@utils/utils";
import { warn, error, info } from "@utils/log";
import { playOptions } from "./playOptions";
import { dbg, dbgTests } from "@common/debug";
import { playlistList } from "@common/enums";
import { emptyString } from "@common/empty";
import { getFirstKey } from "@utils/map-set";
import {
	type MainList,
	addToHistory,
	getPlaylist,
	playlists,
	History,
} from "./playlists";

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Constants:

export const defaultCurrentPlaying: CurrentPlaying = Object.freeze({
	listType: playlistList.mainList,
	path: emptyString,
	currentTime: 0,
});

export const [currentPlaying, setCurrentPlaying] = createStore<CurrentPlaying>(
	defaultCurrentPlaying,
);

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Helper functions:
export const playThisMedia = (
	path: Path,
	listType: ValuesOf<typeof playlistList> = playlistList.mainList,
): void =>
	setCurrentPlaying({ path, currentTime: 0, listType }) as unknown as void;

////////////////////////////////////////////////

export const togglePlayPause = (): void =>
	(document.getElementById("audio") as HTMLAudioElement | null)?.pause();

////////////////////////////////////////////////

export const play = (): void =>
	(document.getElementById("audio") as HTMLAudioElement | null)
		?.play()
		.then() as void;

////////////////////////////////////////////////

export const pause = (): void => {
	const audio = document.getElementById("audio") as HTMLAudioElement | null;
	if (!audio) return;

	audio.pause();
	const { currentTime } = audio;

	if (currentTime > 60 /* seconds */) setCurrentPlaying({ currentTime });
};

////////////////////////////////////////////////

const sortHistoryByDate = (): [Path, Media, DateAsNumber][] => {
	const unsortedList: [Path, DateAsNumber][] = [];

	for (const [path, dates] of playlists.history)
		for (const date of dates) unsortedList.push([path, date]);

	const mainList = playlists.sortedByNameAndMainList;

	return unsortedList
		.sort((a, b) => b[1] - a[1]) // sorted by date
		.map(([path, date]) => [path, mainList.get(path)!, date]);
};

export const playPreviousMedia = (): void =>
	time(() => {
		const { path, listType } = currentPlaying;

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
		// @ts-ignore => I garanteed above that a second media is present.
		const [_firstMedia, [previousMediaPath]] = history;

		playThisMedia(previousMediaPath, correctListType);
	}, "playPreviousMedia");

////////////////////////////////////////////////

export const playNextMedia = (): void =>
	time(() => {
		const { path, listType } = currentPlaying;

		if (!path)
			return info(
				"A media needs to be currently selected to play a next media!",
			);

		// We don't play next media if it's the history list, tho I'm not entirely sure this is needed:
		const correctListType =
			listType === playlistList.history ? playlistList.mainList : listType;

		// Get the correct list:
		const list = getPlaylist(correctListType) as Set<string> | MainList;

		let nextMediaPath = emptyString;

		if (playOptions.isRandom) {
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
			if (!nextMediaPath) nextMediaPath = getFirstKey(list) as Path;
		}

		if (!nextMediaPath)
			return warn("There should be a nextMediaPath, but there isn't!", {
				currentPlaying,
				nextMediaPath,
				list,
			});

		setCurrentPlaying({
			listType: correctListType,
			path: nextMediaPath,
			currentTime: 0,
		});
	}, "playNextMedia");

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Register functions to window mediaSession:

if (navigator?.mediaSession?.setActionHandler) {
	navigator.mediaSession.setActionHandler("previoustrack", playPreviousMedia);
	navigator.mediaSession.setActionHandler("nexttrack", playNextMedia);
	navigator.mediaSession.setActionHandler("pause", pause);
	navigator.mediaSession.setActionHandler("play", play);
}

////////////////////////////////////////////////
// Handle what happens when the `currentPlaying.path` changes:

// A timeout for in case the user changes media too fast:
// we don't load the media until the timeout ends.
let prevTimerToSetMedia: NodeJS.Timeout | undefined;

const setAudioSource = (path: Path, prevPath: Path): void => {
	clearTimeout(prevTimerToSetMedia);

	const mediaPathSuitableForElectron = `atom:///${path}`;

	const timerToSetMedia = setTimeout(() => {
		const audio = document.getElementById("audio") as HTMLAudioElement | null;
		if (!audio) return;

		audio.src = mediaPathSuitableForElectron;

		changeMediaSessionMetadata(path);

		time(
			() => handleDecorateMediaRow(path, prevPath),
			"handleDecorateMediaRow",
		);
	}, 150);

	prevTimerToSetMedia = timerToSetMedia;
};

////////////////////////////////////////////////

const playingClass = "playing";

/**
 * Decorate the rows of current playing medias
 * and undecorate previous playing ones.
 */
const handleDecorateMediaRow = (path: Path, prevPath: Path): void => {
	const prevElements = document.querySelectorAll(`[data-path="${prevPath}"]`);
	const newElements = document.querySelectorAll(`[data-path="${path}"]`);

	if (!prevElements) info(`No previous media row found for "${prevPath}!"`);
	if (!newElements) return info(`No media row found for "${path}"!`);

	// Undecorate previous playing media row:
	for (const element of prevElements) element.classList.remove(playingClass);

	// Decorate new playing media row:
	for (const element of newElements) element.classList.add(playingClass);
};

////////////////////////////////////////////////

const changeMediaSessionMetadata = (path: Path): void => {
	if (!navigator?.mediaSession) return;

	const media = playlists.sortedByNameAndMainList.get(path);

	if (!media) return;

	navigator.mediaSession.metadata = new MediaMetadata({
		artwork: [{ src: media.image }],
		artist: media.artist,
		title: media.title,
		album: media.album,
	});
};

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////

let prevCurrentPlaying: CurrentPlaying = defaultCurrentPlaying;

// Update history and set AudioSource:
createEffect(
	() => {
		dbg(
			"Added to history:",
			currentPlaying.path,
			console.count(
				"'useCurrentPlaying.ts' createEffect -> batch -> added to history",
			),
		);
		addToHistory(currentPlaying.path);

		setAudioSource(currentPlaying.path, prevCurrentPlaying.path);

		// Set current playing on LocalStorage:
		setLocalStorage(keys.currentPlaying, currentPlaying);
		prevCurrentPlaying = currentPlaying;
	},
	{ defer: true },
);

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Types:

export type CurrentPlaying = {
	listType: ValuesOf<typeof playlistList>;
	currentTime: number;
	path: Path;
};
