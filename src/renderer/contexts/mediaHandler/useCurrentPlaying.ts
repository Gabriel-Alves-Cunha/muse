import type { Path } from "@common/@types/generalTypes";

import { subscribeWithSelector } from "zustand/middleware";
import create from "zustand";

import { keys, setLocalStorage } from "@utils/localStorage";
import { getRandomInt, time } from "@utils/utils";
import { playOptions } from "./usePlayOptions";
import { getFirstKey, getLastKey } from "@utils/map";
import {
	type MainList,
	PlaylistActions,
	PlaylistList,
	setPlaylists,
	getPlaylist,
	WhatToDo,
} from "./usePlaylists";

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////

const defaultCurrentPlaying: CurrentPlaying = Object.freeze({
	listType: PlaylistList.MAIN_LIST,
	path: undefined,
	currentTime: 0,
});

export const useCurrentPlaying = create<CurrentPlaying>()(
	subscribeWithSelector(() => defaultCurrentPlaying),
);

export const { getState: currentPlaying, setState: setCurrentPlaying } =
	useCurrentPlaying;

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////

export function playThisMedia(mediaPath: Path, listType: PlaylistList): void {
	// We need to update history:
	setPlaylists({
		whatToDo: PlaylistActions.ADD_ONE_MEDIA,
		type: WhatToDo.UPDATE_HISTORY,
		path: mediaPath,
	});

	const newCurrentPlaying: CurrentPlaying = {
		path: mediaPath,
		currentTime: 0,
		listType,
	};

	setCurrentPlaying(newCurrentPlaying);
	setLocalStorage(keys.currentPlaying, newCurrentPlaying);
}

export function togglePlayPause(): void {
	const audio = document.getElementById("audio") as HTMLAudioElement;

	audio.paused ? play(audio) : pause(audio);
}

export function play(audio?: HTMLAudioElement): void {
	(async () => {
		audio
			? await audio.play()
			: await (document.getElementById("audio") as HTMLAudioElement).play();
	})();
}

export function pause(audio?: HTMLAudioElement): void {
	if (!audio) audio = document.getElementById("audio") as HTMLAudioElement;

	audio.pause();

	setCurrentPlaying({ currentTime: audio.currentTime });
	setLocalStorage(keys.currentPlaying, currentPlaying());
}

export function playPreviousMedia() {
	time(() => {
		const { path, listType } = currentPlaying();

		if (!path)
			return console.error(
				"A media needs to be currently selected to play a previous media!",
			);

		const correctListType =
			listType === PlaylistList.HISTORY ? PlaylistList.MAIN_LIST : listType;

		const list = getPlaylist(correctListType) as Set<string> | MainList;

		if (!list)
			return console.error("`list` should not be nullish!", {
				list,
			});

		let prevMediaPath: Path | undefined;

		let found = false;
		let prevPath = "";

		for (const newPath of list.keys()) {
			if (found) {
				if (newPath === path) {
					// The previous media is the current media.
					// So we are at the beginning of the list.
					// So we need to play the last media.
					prevMediaPath = getLastKey(list) as Path;
					break;
				}

				prevMediaPath = prevPath;
			}

			if (newPath === path) found = true;

			prevPath = newPath;
		}

		// Set newMediaPath as the first path from the list:
		if (!prevMediaPath) prevMediaPath = getFirstKey(list);

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

		const newCurrentPlaying = Object.freeze({
			path: prevMediaPath,
			currentTime: 0,
			listType,
		});

		setCurrentPlaying(newCurrentPlaying);
		setLocalStorage(keys.currentPlaying, newCurrentPlaying);
	}, "playPreviousMedia");
}

export function playNextMedia(): void {
	time(() => {
		const { path, listType } = currentPlaying();

		if (!path)
			return console.warn(
				"A media needs to be currently selected to play a next media!",
			);

		const correctListType =
			listType === PlaylistList.HISTORY ? PlaylistList.MAIN_LIST : listType;

		const list = getPlaylist(correctListType) as Set<string> | MainList;

		if (!list)
			return console.error("`list` should not be nullish!", {
				list,
			});

		let nextMediaPath: Path | undefined;

		if (playOptions().isRandom) {
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

			// Set newMediaPath as the first path from the list:
			if (!nextMediaPath) nextMediaPath = getFirstKey(list);
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

		const newCurrentPlaying: CurrentPlaying = {
			path: nextMediaPath,
			currentTime: 0,
			listType,
		};

		setCurrentPlaying(newCurrentPlaying);
		setLocalStorage(keys.currentPlaying, newCurrentPlaying);
	}, "playNextMedia");
}

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////

let prevMediaTimer: NodeJS.Timeout | undefined;

if (globalThis.window)
	useCurrentPlaying.subscribe(
		({ path }) => path,
		function setAudioSource() {
			clearTimeout(prevMediaTimer);

			const { path } = currentPlaying();
			if (!path) return;

			const pathForElectron = "atom:///" + path;

			const mediaTimer = setTimeout(
				() =>
					((document.getElementById("audio") as HTMLAudioElement).src =
						pathForElectron),
				150,
			);

			prevMediaTimer = mediaTimer;
		},
	);

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////

export type CurrentPlaying = Readonly<{
	listType: PlaylistList;
	path: Path | undefined;
	currentTime: number;
}>;
