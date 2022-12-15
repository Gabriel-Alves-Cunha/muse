import type { ValuesOf } from "@common/@types/utils";
import type {
	DateAsNumber,
	Media,
	Path,
	ID,
} from "@common/@types/generalTypes";

import { subscribeWithSelector } from "zustand/middleware";
import create from "zustand";

import { setCurrentPlayingOnLocalStorage } from "./localStorageHelpers";
import { getRandomInt, time } from "@utils/utils";
import { warn, error, info, log } from "@utils/log";
import { getPlayOptions } from "./usePlayOptions";
import { playlistList } from "@common/enums";
import { emptyString } from "@common/empty";
import { getFirstKey } from "@utils/map-set";
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
	id: emptyString,
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
	id: ID,
	listType: ValuesOf<typeof playlistList> = playlistList.mainList,
): void => setCurrentPlaying({ id, currentTime: 0, listType });

////////////////////////////////////////////////

export function togglePlayPause(): void {
	const audio = document.getElementById("audio") as HTMLAudioElement | null;
	if (!audio) return;

	audio.paused ? play(audio) : pause(audio);
}

////////////////////////////////////////////////

export function play(audio?: HTMLAudioElement): void {
	audio
		? audio.play().then()
		: (document.getElementById("audio") as HTMLAudioElement).play().then();
}

////////////////////////////////////////////////

export function pause(audio?: HTMLAudioElement): void {
	if (!audio) audio = document.getElementById("audio") as HTMLAudioElement;

	audio.pause();
	const currentTime = audio.currentTime;

	if (currentTime > 60 /* seconds */) setCurrentPlaying({ currentTime });
}

////////////////////////////////////////////////

function sortHistoryByDate() {
	const unsortedList: [Path, DateAsNumber][] = [];

	for (const [id, dates] of getPlaylist(playlistList.history) as History)
		for (const date of dates) unsortedList.push([id, date]);

	const mainList = getMainList();

	const listAsArrayOfMap: [ID, Media, DateAsNumber][] = unsortedList
		.sort((a, b) => b[1] - a[1]) // sorted by date
		.map(([id, date]) => [id, mainList.get(id)!, date]);

	return listAsArrayOfMap;
}

export function playPreviousMedia(): void {
	time(() => {
		const { id, listType } = getCurrentPlaying();

		if (!id)
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
		const { id, listType } = getCurrentPlaying();

		if (!id)
			return info(
				"A media needs to be currently selected to play a next media!",
			);

		// We don't play next media if it's the history list, tho I'm not entirely sure this is needed:
		const correctListType =
			listType === playlistList.history ? playlistList.mainList : listType;

		// Get the correct list:
		const list = getPlaylist(correctListType) as ReadonlySet<ID> | MainList;

		let nextMediaID = emptyString;
		const ids = list.keys();

		if (getPlayOptions().isRandom) {
			const randomIndex = getRandomInt(0, list.size);
			let index = 0;

			for (const newID of ids) {
				if (index === randomIndex) {
					nextMediaID = newID;
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

				if (newID === id) found = true;
			}

			// In case the currently playing is the last media, get the first:
			if (!nextMediaID) nextMediaID = getFirstKey(list) as ID;
		}

		if (!nextMediaID)
			return warn("There should be a nextMediaPath, but there isn't!", {
				currentPlaying: getCurrentPlaying(),
				nextMediaID,
				list,
			});

		setCurrentPlaying({
			listType: correctListType,
			id: nextMediaID,
			currentTime: 0,
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
	(state) => state.id,
	// Update history and set audio source:
	(newID, prevID) => {
		if (!newID) return;

		addToHistory(newID);

		setAudioSource(newID, prevID);
	},
);

////////////////////////////////////////////////
// Handle what happens when the `currentPlaying.path` changes:

// A timeout for in case the user changes media too fast:
// we don't load the media until the timeout ends.
let prevTimerToSetMedia: NodeJS.Timeout | undefined;

function setAudioSource(newID: ID, prevID: ID) {
	clearTimeout(prevTimerToSetMedia);

	const media = getMedia(newID);
	if (!media) return;

	const mediaPathSuitableForElectron = `atom:///${media.path}`;

	const timerToSetMedia = setTimeout(() => {
		(document.getElementById("audio") as HTMLAudioElement).src =
			mediaPathSuitableForElectron;

		changeMediaSessionMetadata(media);

		time(() => handleDecorateMediaRow(newID, prevID), "handleDecorateMediaRow");
	}, 150);

	prevTimerToSetMedia = timerToSetMedia;
}

////////////////////////////////////////////////

const playingClass = "playing";

/**
 * Decorate the rows of current playing medias
 * and undecorate previous playing ones.
 */
function handleDecorateMediaRow(newID: ID, prevID: ID) {
	const prevElements = prevID
		? document.querySelectorAll(`[data-id="${prevID}"]`)
		: null;
	const newElements = document.querySelectorAll(`[data-id="${newID}"]`);

	if (!prevElements) info(`No previous media row found for "${prevID}!"`);
	if (!newElements) return info(`No media row found for "${newID}"!`);

	// Undecorate previous playing media row:
	if (prevID && prevElements)
		for (const element of prevElements) element.classList.remove(playingClass);

	// Decorate new playing media row:
	for (const element of newElements) element.classList.add(playingClass);
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
	currentTime: number;
	id: ID;
};
