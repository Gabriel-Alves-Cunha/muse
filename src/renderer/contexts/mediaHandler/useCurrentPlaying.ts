import type { Path } from "@common/@types/generalTypes";

import { subscribeWithSelector } from "zustand/middleware";
import create from "zustand";

import { keys, setLocalStorage } from "@utils/localStorage";
import { getRandomInt } from "@utils/utils";
import { playOptions } from "./usePlayOptions";
import {
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

	const newCurrentPlaying = Object.freeze({
		path: mediaPath,
		currentTime: 0,
		listType,
	});

	setCurrentPlaying(newCurrentPlaying);
	setLocalStorage(keys.currentPlaying, newCurrentPlaying);
}

export function playPreviousMedia() {
	const { path, listType } = currentPlaying();

	if (!path) {
		console.error(
			"A media needs to be currently selected to play a previous media!",
		);
		return;
	}

	const list = getPlaylist(listType);
	let listAsArray: Path[] | undefined;

	if (Array.isArray(list)) listAsArray = list;
	else if (list instanceof Set) listAsArray = Array.from(list);
	else if (list instanceof Map) listAsArray = Array.from(list.keys());

	if (!listAsArray) {
		console.error("`listAsArray` should be an array!", {
			listAsArray,
			list,
		});
		return;
	}

	const currMediaPathIndex = listAsArray.findIndex(p => p === path);

	if (currMediaPathIndex === -1) {
		console.error(
			"Media not found on CurrentPlayingEnum.PLAY_PREVIOUS_FROM_PLAYLIST!",
		);
		return;
	}

	const prevMediaPath =
		listAsArray.at(currMediaPathIndex - 1) ?? listAsArray[0];

	if (prevMediaPath) {
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
	}
}

export function togglePlayPause(): void {
	const audio = document.getElementById("audio") as HTMLAudioElement;

	audio.paused ? play(audio) : pause(audio);
}

export function play(audio?: HTMLAudioElement): void {
	(async () => {
		if (audio) await audio.play();
		else await (document.getElementById("audio") as HTMLAudioElement).play();
	})();
}

export function pause(audio?: HTMLAudioElement): void {
	if (!audio) audio = document.getElementById("audio") as HTMLAudioElement;

	audio.pause();

	setCurrentPlaying({
		currentTime: audio.currentTime,
	});
	setLocalStorage(keys.currentPlaying, currentPlaying());
}

export function playNextMedia(): void {
	const { path, listType } = currentPlaying();

	if (!path) {
		console.warn(
			"A media needs to be currently selected to play a next media!",
		);

		return;
	}

	const list = getPlaylist(listType);
	let listAsArray: Path[] | undefined;

	if (Array.isArray(list)) listAsArray = list;
	else if (list instanceof Set) listAsArray = Array.from(list);
	else if (list instanceof Map) listAsArray = Array.from(list.keys());

	if (!listAsArray) {
		console.error("`listAsArray` should be an array!", {
			listAsArray,
			list,
		});

		return;
	}

	if (playOptions().isRandom) {
		const randomMediaPath = listAsArray[getRandomInt(0, listAsArray.length)];

		if (!randomMediaPath) {
			console.error(
				"There should be a random media selected, but there isn't!",
				{ randomMediaPath, listAsArray },
			);

			return;
		}

		// We need to update history:
		setPlaylists({
			whatToDo: PlaylistActions.ADD_ONE_MEDIA,
			type: WhatToDo.UPDATE_HISTORY,
			path: randomMediaPath,
		});

		// Setting the current playing media:
		const newCurrentPlaying = Object.freeze({
			path: randomMediaPath,
			currentTime: 0,
			listType,
		});

		setCurrentPlaying(newCurrentPlaying);
		setLocalStorage(keys.currentPlaying, newCurrentPlaying);
	} else {
		const prevMediaPathIndex = listAsArray.findIndex(p => p === path);

		const nextMediaFromTheSameList = listAsArray[prevMediaPathIndex + 1];

		if (!nextMediaFromTheSameList) {
			// ^ In case it is in the final of the listAsArray (it would receive undefined):
			const firstMediaFromTheSameList = listAsArray[0];

			if (!firstMediaFromTheSameList) return;

			// We need to update history:
			setPlaylists({
				whatToDo: PlaylistActions.ADD_ONE_MEDIA,
				path: firstMediaFromTheSameList,
				type: WhatToDo.UPDATE_HISTORY,
			});

			const newCurrentPlaying = Object.freeze({
				path: firstMediaFromTheSameList,
				currentTime: 0,
				listType,
			});

			setCurrentPlaying(newCurrentPlaying);
			setLocalStorage(keys.currentPlaying, newCurrentPlaying);

			return;
		}

		// We need to update history:
		setPlaylists({
			whatToDo: PlaylistActions.ADD_ONE_MEDIA,
			path: nextMediaFromTheSameList,
			type: WhatToDo.UPDATE_HISTORY,
		});

		const newCurrentPlaying = Object.freeze({
			path: nextMediaFromTheSameList,
			currentTime: 0,
			listType,
		});

		setCurrentPlaying(newCurrentPlaying);
		setLocalStorage(keys.currentPlaying, newCurrentPlaying);
	}
}

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////

let prevMediaTimer: NodeJS.Timeout | undefined = undefined;

if (globalThis.window)
	useCurrentPlaying.subscribe(
		({ path }) => path,
		function setAudioSource() {
			// @ts-ignore It will just return undefined if `prevMediaTimer` is undefined.
			clearTimeout(prevMediaTimer);

			const { path } = currentPlaying();
			if (!path) return;

			const pathForElectron = "atom:///" + path;

			const mediaTimer = setTimeout(
				async () =>
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
