import { getMedia, refreshMedia, usePlaylists } from "@contexts/usePlaylists";
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

export const idSelector = (
	state: ReturnType<typeof useCurrentPlaying.getState>,
) => state.id;

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

export function handleLoadedData({ target: audio }: AudioEvent): void {
	const { lastStoppedTime, id: oldId } = getCurrentPlaying();
	const formatedDuration = formatDuration(audio.duration);
	const media = getMedia(oldId)!;

	// Updating the duration of media:
	if (formatedDuration !== media.duration) {
		const newID = crypto.randomUUID();

		refreshMedia(oldId, newID, {
			...media,
			duration: formatedDuration,
		}).then();
	}

	// Maybe set audio.currentTime to last stopped time:
	if (lastStoppedTime > 30 /* seconds */) audio.currentTime = lastStoppedTime;
}

/////////////////////////////////////////
/////////////////////////////////////////

export function handleEnded({ target: audio }: AudioEvent): void {
	dbg(
		`Audio ended, playing ${
			audio.loop ? "again because it's on loop." : "next media."
		}`,
	);

	if (!audio.loop) playNextMedia();
}

/////////////////////////////////////////
/////////////////////////////////////////

export function handleAudioCanPlay({ target: audio }: AudioEvent): void {
	dbg("Audio can play.");
	audio.play().then();
}

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Types:

interface AudioEvent extends Event {
	target: HTMLAudioElement;
}
