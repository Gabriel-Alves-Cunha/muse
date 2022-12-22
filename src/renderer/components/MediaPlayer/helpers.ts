import type { ID, Media } from "@common/@types/generalTypes";

import create from "zustand";

import { refreshMedia, usePlaylists } from "@contexts/usePlaylists";
import { formatDuration } from "@common/utils";
import { error } from "@common/log";
import { dbg } from "@common/debug";
import {
	getCurrentPlaying,
	useCurrentPlaying,
	playNextMedia,
} from "@contexts/useCurrentPlaying";

///////////////////////////////////////
///////////////////////////////////////
///////////////////////////////////////
// Helper constants:

export const useProgress = create<Progress>(() => ({
	currentTime: 0,
	percentage: 0,
}));

const { setState: setProgress } = useProgress;

///////////////////////////////////////
///////////////////////////////////////

export const idSelector = ({
	id,
}: ReturnType<typeof useCurrentPlaying.getState>) => id;

///////////////////////////////////////
///////////////////////////////////////

export const mainListSelector = (
	state: ReturnType<typeof usePlaylists.getState>,
) => state.sortedByTitleAndMainList;

///////////////////////////////////////
///////////////////////////////////////
///////////////////////////////////////

export const logInvalid = (e: Event): void => dbg("Audio is invalid.", e);
export const logAbort = (): void => dbg("Audio was aborted.");
export const logClose = (): void => dbg("Audio was closed.");
export const logSecurityPolicyViolation = (e: Event): void =>
	error("Audio has a security policy violation:", e);
export const logError = (e: string | Event): void => error("Audio error:", e);
export const logStalled = (e: Event): void =>
	dbg(
		"Audio is stalled (Fires when the browser is trying to get media data, but it is not available):",
		e,
	);

/////////////////////////////////////////
/////////////////////////////////////////

export function handleLoadedData(
	audio: HTMLAudioElement,
	oldID: ID,
	media: Media,
): void {
	const formatedDuration = formatDuration(audio.duration);

	// Updating the duration of media:
	if (formatedDuration !== media.duration) {
		const newID = crypto.randomUUID();

		refreshMedia(oldID, newID, { ...media, duration: formatedDuration }).then();
	}

	// Maybe set audio.currentTime to last stopped time:
	const lastTime = getCurrentPlaying().currentTime;
	if (lastTime > 30 /* seconds */) audio.currentTime = lastTime;
}

/////////////////////////////////////////
/////////////////////////////////////////

export function handleEnded(e: Event, audio: HTMLAudioElement): void {
	console.log("Audio event:", e);

	dbg(
		`Audio ended, playing ${
			audio.loop ? "again because it's on loop." : "next media."
		}`,
	);

	if (!audio.loop) playNextMedia();
}

/////////////////////////////////////////
/////////////////////////////////////////

export function handleAudioCanPlay(audio: HTMLAudioElement): void {
	dbg("Audio can play.");
	audio.play().then();
}

/////////////////////////////////////////
/////////////////////////////////////////

export function handleProgress(
	audio: HTMLAudioElement,
	isSeeking: boolean,
): void {
	const { duration, currentTime } = audio;

	// If is seeking, set just the currentTime:
	isSeeking
		? setProgress({ currentTime })
		: setProgress({ percentage: (currentTime / duration) * 100, currentTime });
}

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Types:

type Progress = Readonly<{ currentTime: number; percentage: number }>;
