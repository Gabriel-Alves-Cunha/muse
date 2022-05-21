import type { Path } from "@common/@types/generalTypes";

import { persist, subscribeWithSelector } from "zustand/middleware";
import create from "zustand";

import { playOptions } from "./usePlayOptions";
import { getRandomInt } from "@utils/utils";
import { keyPrefix } from "@utils/app";
import { dbg } from "@common/utils";
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

const currentPlayingKey = `${keyPrefix}current_playing` as const;

const defaultCurrentPlaying: CurrentPlaying = Object.freeze({
	listType: PlaylistList.MAIN_LIST,
	path: undefined,
	currentTime: 0,
});

export const useCurrentPlaying = create<CurrentPlaying>()(
	subscribeWithSelector(
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		persist((_set, _get) => defaultCurrentPlaying, {
			name: currentPlayingKey,
		})
	)
);

export const { getState: currentPlaying, setState: setCurrentPlaying } =
	useCurrentPlaying;

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////

export function playThisMedia(mediaPath: Path, listType: PlaylistList): void {
	dbg("playThisMedia()", { mediaPath, listType });

	// We need to update history:
	setPlaylists({
		whatToDo: PlaylistActions.ADD_ONE_MEDIA,
		type: WhatToDo.UPDATE_HISTORY,
		path: mediaPath,
	});

	setCurrentPlaying({
		path: mediaPath,
		currentTime: 0,
		listType,
	});
}

export function playPreviousMedia() {
	const { path, listType } = currentPlaying();

	if (!path) {
		console.error(
			"A media needs to be currently selected to play a previous media!"
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
			"Media not found on CurrentPlayingEnum.PLAY_PREVIOUS_FROM_PLAYLIST!"
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

		setCurrentPlaying({
			path: prevMediaPath,
			currentTime: 0,
		});
	}
}

export function togglePlayPause(): void {
	const audio = document.getElementById("audio") as HTMLAudioElement;

	if (audio.paused) (async () => await audio.play())();
	else {
		audio.pause();

		setCurrentPlaying({
			currentTime: audio.currentTime,
		});
	}
}

export function play(): void {
	(async () =>
		await (document.getElementById("audio") as HTMLAudioElement).play())();
}

export function pause() {
	const audio = document.getElementById("audio") as HTMLAudioElement;

	audio.pause();

	setCurrentPlaying({
		currentTime: audio.currentTime,
	});
}

export function playNextMedia(): void {
	const { path, listType } = currentPlaying();

	if (!path) {
		console.warn(
			"A media needs to be currently selected to play a next media!"
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
				{ randomMediaPath, listAsArray }
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
		setCurrentPlaying({
			path: randomMediaPath,
			currentTime: 0,
		});
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

			setCurrentPlaying({
				path: firstMediaFromTheSameList,
				currentTime: 0,
			});

			return;
		}

		// We need to update history:
		setPlaylists({
			whatToDo: PlaylistActions.ADD_ONE_MEDIA,
			path: nextMediaFromTheSameList,
			type: WhatToDo.UPDATE_HISTORY,
		});

		setCurrentPlaying({
			path: nextMediaFromTheSameList,
			currentTime: 0,
		});
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
				150
			);

			prevMediaTimer = mediaTimer;
		}
	);

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////

export type CurrentPlaying = Readonly<{
	listType: PlaylistList;
	path: Path | undefined;
	currentTime: number;
}>;
