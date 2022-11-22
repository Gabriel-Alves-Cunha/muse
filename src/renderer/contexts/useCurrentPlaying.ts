import type { Path } from "@common/@types/generalTypes";

import { persistObservable } from "@legendapp/state/persist";
import { observable, observe } from "@legendapp/state";

import { getFirstKey, getLastKey } from "@utils/map-set";
import { getRandomInt, time } from "@utils/utils";
import { getPlayOptions } from "./usePlayOptions";
import { emptyString } from "@common/empty";
import { keys } from "@utils/localStorage";
import { dbg } from "@common/debug";
import {
	type MainList,
	PlaylistActions,
	PlaylistList,
	setPlaylists,
	getPlaylist,
	getMainList,
	WhatToDo,
} from "./usePlaylists";

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Main :

const defaultCurrentPlaying: CurrentPlaying = Object.freeze({
	listType: PlaylistList.MAIN_LIST,
	path: emptyString,
	currentTime: 0,
});

export const currentPlaying = observable<CurrentPlaying>({
	...defaultCurrentPlaying,
});

// Persist this observable
persistObservable(currentPlaying, {
	local: keys.currentPlaying, // Unique name
});

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

	currentPlaying.set({ path, currentTime: 0, listType });
}

////////////////////////////////////////////////

export function togglePlayPause(): void {
	const audio = document.getElementById("audio") as HTMLAudioElement;

	audio.paused ? play(audio) : pause(audio);
}

////////////////////////////////////////////////

export async function play(audio?: HTMLAudioElement): Promise<void> {
	audio === undefined
		? await (document.getElementById("audio") as HTMLAudioElement).play()
		: await audio.play();
}

////////////////////////////////////////////////

export function pause(audio?: HTMLAudioElement): void {
	if (audio === undefined)
		audio = document.getElementById("audio") as HTMLAudioElement;

	audio.pause();
	const currentTime = audio.currentTime;

	if (currentTime > 60 /* seconds */)
		currentPlaying.currentTime.set(currentTime);
}

////////////////////////////////////////////////

export function playPreviousMedia(): void {
	time(() => {
		const { path, listType } = currentPlaying.peek();

		if (path.length === 0)
			return console.warn(
				"A media needs to be currently selected to play a previous media!",
			);

		// We don't play previous media if it's the history list:
		const correctListType =
			listType === PlaylistList.HISTORY ? PlaylistList.MAIN_LIST : listType;

		// Get the correct list:
		const list = getPlaylist(correctListType) as Set<string> | MainList;

		const [firstMediaPath] = list;
		let prevMediaPath: Path = emptyString;

		if (firstMediaPath === path) prevMediaPath = getLastKey(list) as Path;
		else {
			let prevPath = emptyString;

			for (const newPath of list.keys()) {
				if (path === newPath) {
					prevMediaPath = prevPath;
					break;
				}

				prevPath = newPath;
			}
		}

		if (prevMediaPath.length === 0)
			return console.error(
				"There should be a prevMediaPath, but there isn't!",
				{ prevMediaPath, listType, list },
			);

		// We need to update history:
		setPlaylists({
			whatToDo: PlaylistActions.ADD_ONE_MEDIA,
			type: WhatToDo.UPDATE_HISTORY,
			path: prevMediaPath,
		});

		currentPlaying.set({
			listType: correctListType,
			path: prevMediaPath,
			currentTime: 0,
		});
	}, "playPreviousMedia");
}

////////////////////////////////////////////////

export function playNextMedia(): void {
	time(() => {
		const { path, listType } = currentPlaying.peek();

		if (path.length === 0)
			return console.info(
				"A media needs to be currently selected to play a next media!",
			);

		// We don't play next media if it's the history list:
		const correctListType =
			listType === PlaylistList.HISTORY ? PlaylistList.MAIN_LIST : listType;

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

			if (nextMediaPath.length === 0) nextMediaPath = getFirstKey(list) as Path;
		}

		if (nextMediaPath.length === 0)
			return console.warn("There should be a nextMediaPath, but there isn't!", {
				nextMediaPath,
				list,
			});

		// We need to update history:
		setPlaylists({
			whatToDo: PlaylistActions.ADD_ONE_MEDIA,
			type: WhatToDo.UPDATE_HISTORY,
			path: nextMediaPath,
		});

		currentPlaying.set({
			listType: correctListType,
			path: nextMediaPath,
			currentTime: 0,
		});
	}, "playNextMedia");
}

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Register functions to window mediaSession:

navigator?.mediaSession?.setActionHandler?.("previoustrack", () =>
	playPreviousMedia(),
);
navigator?.mediaSession?.setActionHandler?.("nexttrack", () => playNextMedia());
navigator?.mediaSession?.setActionHandler?.("play", async () => await play());
navigator?.mediaSession?.setActionHandler?.("pause", () => pause());

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Handle what happens when the `currentPlaying.path` changes:

// A timeout for in case the user changes media too fast:
// we don't load the media until the timeout ends.
let prevTimerToSetMedia: NodeJS.Timeout | undefined;

if (import.meta.vitest === undefined)
	observe<typeof currentPlaying>(function runSubscribedFunctions({
		previous,
	}): void {
		const path = currentPlaying.path.peek();

		if (path.length === 0) return;

		const prevPath = previous?.path.peek() ?? "";

		// Run functions:
		setAudioSource(path, prevPath);

		changeMediaSessionMetadata(path);
	});

////////////////////////////////////////////////

function setAudioSource(path: Path, prevPath: Path) {
	clearTimeout(prevTimerToSetMedia);

	const mediaPathSuitableForElectron = `atom:///${path}`;

	const timerToSetMedia = setTimeout(() => {
		(document.getElementById("audio") as HTMLAudioElement).src =
			mediaPathSuitableForElectron;

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
function handleDecorateMediaRow(path: Path, previousPath: Path): void {
	const newElements = document.querySelectorAll(`[data-path="${path}"]`);
	const prevElements =
		previousPath.length > 0
			? document.querySelectorAll(`[data-path="${previousPath}"]`)
			: null;

	if (!prevElements) dbg(`No previous media row found for "${previousPath}!"`);
	if (newElements.length === 0) return dbg(`No media row found for "${path}"!`);

	// Undecorate previous playing media row:
	if (previousPath.length !== 0 && prevElements !== null)
		for (const element of prevElements) element.classList.remove(playingClass);

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
	listType: PlaylistList;
	currentTime: number;
	path: Path;
}>;
