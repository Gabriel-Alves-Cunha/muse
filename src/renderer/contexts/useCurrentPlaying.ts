import type { Path } from "@common/@types/generalTypes";

import { subscribeWithSelector } from "zustand/middleware";
import create from "zustand";

import { setCurrentPlayingOnLocalStorage } from "./localStorageHelpers";
import { getFirstKey, getLastKey } from "@utils/map-set";
import { getRandomInt, time } from "@utils/utils";
import { playOptions } from "./usePlayOptions";
import {
	type MainList,
	PlaylistActions,
	PlaylistList,
	setPlaylists,
	getPlaylist,
	WhatToDo,
	mainList,
} from "./usePlaylists";

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Constants:

const defaultCurrentPlaying: CurrentPlaying = Object.freeze({
	listType: PlaylistList.MAIN_LIST,
	currentTime: 0,
	path: "",
});

export const useCurrentPlaying = create<CurrentPlaying>()(
	subscribeWithSelector(setCurrentPlayingOnLocalStorage(
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		(_set, _get, _api) => defaultCurrentPlaying,
		"currentPlaying",
	)),
);

export const { getState: currentPlaying, setState: setCurrentPlaying } =
	useCurrentPlaying;

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Helper functions:

export function playThisMedia(
	path: Path,
	listType: PlaylistList = PlaylistList.MAIN_LIST,
): void {
	// We need to update history:
	setPlaylists({
		whatToDo: PlaylistActions.ADD_ONE_MEDIA,
		type: WhatToDo.UPDATE_HISTORY,
		path,
	});

	setCurrentPlaying({ path, currentTime: 0, listType });
}

////////////////////////////////////////////////

export function togglePlayPause(): void {
	const audio = document.getElementById("audio") as HTMLAudioElement;

	audio.paused ? play(audio) : pause(audio);
}

////////////////////////////////////////////////

export function play(audio?: HTMLAudioElement): void {
	(async () => {
		audio !== undefined ?
			await audio.play() :
			await (document.getElementById("audio") as HTMLAudioElement).play();
	})();
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

export function playPreviousMedia(): void {
	time(() => {
		const { path, listType } = currentPlaying();

		if (!path)
			return console.error(
				"A media needs to be currently selected to play a previous media!",
			);

		// We don't play previous media if it's the history list:
		const correctListType = listType === PlaylistList.HISTORY ?
			PlaylistList.MAIN_LIST :
			listType;

		// Get the correct list:
		const list = getPlaylist(correctListType) as Set<string> | MainList;

		const firstMediaPath = getFirstKey(list);
		let prevMediaPath: Path = "";

		if (firstMediaPath === path) prevMediaPath = getLastKey(list) as Path;
		else {
			let prevPath = "";

			for (const newPath of list.keys()) {
				if (path === newPath) {
					prevMediaPath = prevPath;
					break;
				}

				prevPath = newPath;
			}
		}

		if (!prevMediaPath)
			return console.error(
				"There should be a prevMediaPath, but there isn't!",
				{ prevMediaPath, list },
			);

		// We need to update history:
		setPlaylists({
			whatToDo: PlaylistActions.ADD_ONE_MEDIA,
			type: WhatToDo.UPDATE_HISTORY,
			path: prevMediaPath,
		});

		setCurrentPlaying({ path: prevMediaPath, currentTime: 0 });
	}, "playPreviousMedia");
}

////////////////////////////////////////////////

export function playNextMedia(): void {
	time(() => {
		const { path, listType } = currentPlaying();

		if (!path)
			return console.warn(
				"A media needs to be currently selected to play a next media!",
			);

		// We don't play next media if it's the history list:
		const correctListType = listType === PlaylistList.HISTORY ?
			PlaylistList.MAIN_LIST :
			listType;

		// Get the correct list:
		const list = getPlaylist(correctListType) as Set<string> | MainList;

		let nextMediaPath = "";

		if (playOptions().random) {
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

			if (!nextMediaPath) nextMediaPath = getFirstKey(list) as Path;
		}

		if (!nextMediaPath)
			return console.error(
				"There should be a nextMediaPath, but there isn't!",
				{ nextMediaPath, list },
			);

		// We need to update history:
		setPlaylists({
			whatToDo: PlaylistActions.ADD_ONE_MEDIA,
			type: WhatToDo.UPDATE_HISTORY,
			path: nextMediaPath,
		});

		setCurrentPlaying({ path: nextMediaPath, currentTime: 0 });
	}, "playNextMedia");
}

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Register functions to window mediaSession:

if (import.meta.vitest === undefined) {
	navigator.mediaSession.setActionHandler(
		"previoustrack",
		() => playPreviousMedia(),
	);
	navigator.mediaSession.setActionHandler("nexttrack", () => playNextMedia());
	navigator.mediaSession.setActionHandler("pause", () => pause());
	navigator.mediaSession.setActionHandler("play", () => play());
}

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Handle what happens when the `currentPlaying.path` changes:

// A timeout for in case the user changes media too fast:
// we don't load the media until the timeout ends.
let prevMediaTimer: NodeJS.Timeout | undefined;

if (import.meta.vitest === undefined)
	useCurrentPlaying.subscribe(
		state => state.path,
		function runSubscribedFunctions(path, prevPath) {
			if (!path) return;

			// Run functions:
			setAudioSource(path, prevPath);

			changeMediaSessionMetadata(path);
		},
	);

////////////////////////////////////////////////

function setAudioSource(path: Path, prevPath: Path) {
	clearTimeout(prevMediaTimer);

	const pathForElectron = `atom:///${path}`;

	const mediaTimer = setTimeout(() => {
		(document.getElementById("audio") as HTMLAudioElement).src =
			pathForElectron;

		handleDecorateMediaRow(path, prevPath);
	}, 150);

	prevMediaTimer = mediaTimer;
}

////////////////////////////////////////////////

const playingClass = "playing";

function handleDecorateMediaRow(path: Path, previousPath: Path) {
	const prevElement = document.querySelector(`[data-path="${previousPath}"]`);
	const newElement = document.querySelector(`[data-path="${path}"]`);

	if (prevElement === null)
		console.info(`No previous media row found for "${path}!"`);
	if (newElement === null)
		return console.info(`No media row found for "${path}"!`);

	if (previousPath.length !== 0 && prevElement !== null)
		// de-decorate previous playing media row:
		prevElement.classList.remove(playingClass);

	newElement.classList.add(playingClass);
}

////////////////////////////////////////////////

function changeMediaSessionMetadata(path: Path): void {
	const media = mainList().get(path);

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

export type CurrentPlaying = Readonly<
	{ listType: PlaylistList; path: Path; currentTime: number; }
>;
