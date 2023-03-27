import type { Media, Path } from "@common/@types/GeneralTypes";
import type { ValuesOf } from "@common/@types/Utils";
import type { Audio } from "@components/MediaPlayer/ControlsAndSeeker/Controls";

import { subscribeKey } from "valtio/utils";
import { proxy } from "valtio";

import { localStorageKeys, setLocalStorage } from "@utils/localStorage";
import { getRandomInt, time } from "@utils/utils";
import { warn, error, info } from "@common/log";
import { PlaylistListEnum } from "@common/enums";
import { playOptions } from "./playOptions";
import { selectPath } from "./allSelectedMedias";
import {
	type MainList,
	IS_PROXY_MAP_OR_SET,
	addToHistory,
	getPlaylist,
	playlists,
	getMedia,
} from "./playlists";

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Pre work:

const storagedCurrentPlayingString = localStorage.getItem(
	localStorageKeys.currentPlaying,
);
export const defaultCurrentPlaying: CurrentPlaying = {
	listType: PlaylistListEnum.mainList,
	lastStoppedTimeInSeconds: 0,
	path: "",
} as const;

let storagedCurrentPlaying: CurrentPlaying | undefined;

try {
	if (storagedCurrentPlayingString)
		storagedCurrentPlaying = JSON.parse(storagedCurrentPlayingString);
} catch (err) {
	error(
		"Error parsing JSON.parse(storagedCurrentPlayingString). Applying default settings.",
		err,
	);

	storagedCurrentPlaying = { ...defaultCurrentPlaying };
}

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Main function:

export const currentPlaying = proxy<CurrentPlaying>(storagedCurrentPlaying);

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Helper functions:

export function setDefaultCurrentPlaying() {
	Object.assign(currentPlaying, defaultCurrentPlaying);
}

////////////////////////////////////////////////

export function playThisMedia(
	path: Path,
	listType: ValuesOf<typeof PlaylistListEnum> = PlaylistListEnum.mainList,
): void {
	currentPlaying.lastStoppedTimeInSeconds = 0;
	currentPlaying.listType = listType;
	currentPlaying.path = path;

	addToHistory(path);
}

////////////////////////////////////////////////

export const getAudio = (): Audio => document.getElementById("audio") as Audio;

////////////////////////////////////////////////

export function togglePlayPause(): void {
	const audio = getAudio();
	if (!audio?.src) return;

	audio?.paused ? play() : pause();
}

////////////////////////////////////////////////

export const play = () => getAudio()?.play();

////////////////////////////////////////////////

export function pause(): void {
	const audio = getAudio();
	if (!audio?.src) return;

	audio.pause();
	const lastStoppedTimeInSeconds = audio.currentTime;

	if (lastStoppedTimeInSeconds > 60)
		currentPlaying.lastStoppedTimeInSeconds = lastStoppedTimeInSeconds;
}

////////////////////////////////////////////////

export function playPreviousMedia(): void {
	time(() => {
		const { path, listType } = currentPlaying;

		if (!path)
			return warn(
				"A media needs to be currently selected to play a previous media!",
			);

		// We don't play previous media if it's the history list itself:
		const correctListType =
			listType === PlaylistListEnum.history
				? PlaylistListEnum.mainList
				: listType;

		const previousMediaPath = playlists.history.at(-2);

		if (!previousMediaPath || path === previousMediaPath)
			return error(
				"There should be at least 2 medias on history to be able to play a previous media, but there isn't!",
				history,
			);

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
		const list = getPlaylist(correctListType) as
			| ReadonlySet<Path>
			| Readonly<MainList>;

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

			for (const newPath of paths) {
				if (found) {
					nextMediaPath = newPath;
					break;
				}

				if (newPath === path) found = true;
			}

			// In case the currently playing is the last media, get the first:
			if (!nextMediaPath) {
				const [firstMedia] = list;

				if (typeof firstMedia === "string") nextMediaPath = firstMedia;
				else {
					// @ts-ignore => Checking later.
					const [firstMediaPath] = firstMedia;

					nextMediaPath = firstMediaPath ?? "";
				}
			}
		}

		if (!nextMediaPath)
			return warn("There should be a nextMediaPath, but there isn't!", {
				currentPlaying: currentPlaying,
				nextMediaPath,
				list,
			});

		playThisMedia(nextMediaPath, correctListType);
	}, "playNextMedia");
}

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Register functions to window mediaSession:

navigator?.mediaSession?.setActionHandler?.("previoustrack", playPreviousMedia);
navigator?.mediaSession?.setActionHandler?.("nexttrack", playNextMedia);
navigator?.mediaSession?.setActionHandler?.("pause", pause);
navigator?.mediaSession?.setActionHandler?.("play", play);

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////

let prevPath = currentPlaying.path;

// Update history and set audio source:
subscribeKey(currentPlaying, "path", () => {
	const newPath = currentPlaying.path;

	if (!newPath || newPath === prevPath) return;

	addToHistory(newPath);

	setAudioSource(newPath, prevPath);

	prevPath = newPath;
});

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

		setLocalStorage(
			localStorageKeys.currentPlaying,
			currentPlaying,
			!IS_PROXY_MAP_OR_SET,
		);

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
		? document.querySelectorAll(selectPath(prevPath))
		: null;
	const newElements = document.querySelectorAll(selectPath(newPath));

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
	lastStoppedTimeInSeconds: number;
	path: Path;
};
