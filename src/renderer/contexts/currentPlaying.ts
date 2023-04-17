import type { Media, Path } from "@common/@types/GeneralTypes";
import type { ValuesOf } from "@common/@types/Utils";
import type { Audio } from "@components/MediaPlayer/ControlsAndSeeker/Controls";

import { create } from "zustand";

import { getPlaylists, setPlaylists, getPlaylist, getMedia } from "./playlists";
import { localStorageKeys, setLocalStorage } from "@utils/localStorage";
import { warn, error, info, assert } from "@common/log";
import { getRandomInt, time } from "@utils/utils";
import { PlaylistListEnum } from "@common/enums";
import { getPlayOptions } from "./playOptions";
import { selectDataPath } from "./allSelectedMedias";
import { infoToast } from "@components/toasts";

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Constants:

export const defaultCurrentPlaying: CurrentPlaying = {
	listType: PlaylistListEnum.mainList,
	lastStoppedTimeInSeconds: 0,
	path: "",
} as const;

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Main function:

export const useCurrentPlaying = create<CurrentPlaying>(() => {
	const storagedCurrentPlayingString = localStorage.getItem(
		localStorageKeys.currentPlaying,
	);

	let storagedCurrentPlaying = defaultCurrentPlaying;

	try {
		if (storagedCurrentPlayingString)
			storagedCurrentPlaying = JSON.parse(storagedCurrentPlayingString);
	} catch (err) {
		error(
			"Error parsing JSON.parse(storagedCurrentPlayingString). Applying default settings.",
			err,
		);
	}

	return storagedCurrentPlaying;
});

export const { getState: getCurrentPlaying, setState: setCurrentPlaying } =
	useCurrentPlaying;

export const selectPath = (): CurrentPlaying["path"] =>
	getCurrentPlaying().path;

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Helper functions:

export const setDefaultCurrentPlaying = (): void =>
	setCurrentPlaying(defaultCurrentPlaying);

////////////////////////////////////////////////

export const getAudio = (): Audio => document.getElementById("audio") as Audio;

////////////////////////////////////////////////

export function togglePlayPause(): void {
	const audio = getAudio();
	if (!audio?.src) return;

	audio?.paused ? play() : pause();
}

////////////////////////////////////////////////

export const play = (): Promise<void> | undefined => getAudio()?.play();

////////////////////////////////////////////////

export function pause(): void {
	const audio = getAudio();
	if (!audio?.src) return;

	audio.pause();
	const lastStoppedTimeInSeconds = audio.currentTime;

	if (lastStoppedTimeInSeconds > 60)
		useCurrentPlaying.setState({ lastStoppedTimeInSeconds });
}

////////////////////////////////////////////////

export function playPreviousMedia(): void {
	time(() => {
		const { history } = getPlaylists();

		if (history.length < 2) {
			warn(
				"There should be at least 2 medias on history to be able to play a previous media, but there isn't!",
				history,
			);

			return;
		}

		const { path, listType } = getCurrentPlaying();

		let prevIndex = -2;
		let prevPath = history.at(prevIndex);

		while (path === prevPath) {
			warn("Found same media to play as previous. Skipping...", history);

			--prevIndex;

			prevPath = history.at(prevIndex);
		}

		if (!prevPath) {
			info("No previous media found.", {
				prevIndex,
				listType,
				prevPath,
				path,
			});

			return;
		}

		playThisMedia(prevPath, listType);
	}, "playPreviousMedia");
}

////////////////////////////////////////////////

export function playNextMedia(): void {
	// If this ever becomes too slow, maybe make an array of ids === mainList.keys().
	time(() => {
		const { path, listType } = getCurrentPlaying();

		if (!path) {
			warn("A media needs to be currently selected to play a next media!");

			return;
		}

		const isRandom = getPlayOptions().isRandom;
		const list = getPlaylist(listType);
		const isArray = list instanceof Array;
		const paths = isArray ? list.values() : list.keys();
		let nextMediaPath = "";

		outer: if (isRandom) {
			const length = isArray ? list.length : list.size;
			const randomIndex = getRandomInt(0, length);

			let index = 0;

			for (const path of paths) {
				if (index === randomIndex) {
					nextMediaPath = path;
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

				if (!firstMedia) break outer;

				if (typeof firstMedia === "string") nextMediaPath = firstMedia;
				else nextMediaPath = firstMedia[0];
			}
		}

		if (!nextMediaPath) {
			error("There should be a nextMediaPath, but there isn't!", {
				currentPlaying: useCurrentPlaying,
				nextMediaPath,
				list,
			});

			return;
		}

		playThisMedia(nextMediaPath, listType);
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

export function playThisMedia(
	newPath: Path,
	listType: ValuesOf<typeof PlaylistListEnum> = PlaylistListEnum.mainList,
): void {
	const prevPath = getCurrentPlaying().path;

	if (!newPath || newPath === prevPath) return;

	const mainList = getPlaylists().sortedByTitleAndMainList;

	if (!mainList.has(newPath)) {
		infoToast(`Media "${newPath}" not found!`);

		return;
	}

	const newMainList = new Map(mainList);
	const newMedia = newMainList.get(newPath) as Media;
	const lastPlayedAt = Date.now();

	newMedia.lastPlayedAt = lastPlayedAt;

	setPlaylists({ sortedByTitleAndMainList: newMainList });

	assert(
		getPlaylists().sortedByTitleAndMainList.get(newPath)?.lastPlayedAt ===
			lastPlayedAt,
		`Media "${newPath}" lastPlayedAt was not modified!`,
	);

	const newHistory = getPlaylists().history.concat(newPath);

	setPlaylists({ history: newHistory });

	setCurrentPlaying({
		lastStoppedTimeInSeconds: 0,
		path: newPath,
		listType,
	});

	setAudioSource(newPath);
}

////////////////////////////////////////////////
// Handle what happens when the `currentPlaying.path` changes:

// A timeout for in case the user changes media too fast:
// we don't load the media until the timeout ends.
let prevTimerToSetMedia: NodeJS.Timeout | undefined;

function setAudioSource(newPath: Path): void {
	clearTimeout(prevTimerToSetMedia);

	const mediaPathSuitableForElectron = `atom:///${newPath}`;

	const timerToSetMedia = setTimeout(() => {
		const audio = getAudio();

		if (!audio) return;

		audio.src = mediaPathSuitableForElectron;

		setLocalStorage(localStorageKeys.currentPlaying, getCurrentPlaying());

		changeMediaSessionMetadata(getMedia(newPath) as Media);

		time(() => handleDecorateMediaRow(newPath), "handleDecorateMediaRow");
	}, 150);

	prevTimerToSetMedia = timerToSetMedia;
}

////////////////////////////////////////////////

const isPlayingRowDatalistString = "isPlayingRow";

/**
 * Decorate the rows of current playing medias
 * and undecorate previous playing ones.
 */
function handleDecorateMediaRow(newPath: Path): void {
	const prevPath = getCurrentPlaying().path;

	const prevElements = prevPath
		? document.querySelectorAll(selectDataPath(prevPath))
		: null;
	const newElements = document.querySelectorAll(selectDataPath(newPath));

	if (!prevElements) info(`No previous media row found for "${prevPath}!"`);
	if (!newElements) {
		info(`No media row found for "${newPath}"!`);

		return;
	}

	// Undecorate previous playing media row:
	if (prevPath && prevElements)
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

export type CurrentPlaying = Readonly<{
	listType: ValuesOf<typeof PlaylistListEnum>;
	lastStoppedTimeInSeconds: number;
	path: Path;
}>;
