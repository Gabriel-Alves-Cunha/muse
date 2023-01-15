import { create } from "zustand";

import { setPlayOptionsOnLocalStorage } from "./localStorageHelpers";
import { getAudio } from "./useCurrentPlaying";

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Main:

export const usePlayOptions = create<PlayOptions>()(
	setPlayOptionsOnLocalStorage(() => ({
		loopThisMedia: false,
		isRandom: false,
	})),
);

export const { getState: getPlayOptions, setState: setPlayOptions } =
	usePlayOptions;

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Helper functions:

export function toggleLoopMedia(): void {
	const audio = getAudio();
	if (!audio) return;

	const loopThisMedia = !getPlayOptions().loopThisMedia;

	audio.loop = loopThisMedia;

	setPlayOptions({ loopThisMedia });
}

////////////////////////////////////////////////

export const toggleRandom = () =>
	setPlayOptions({ isRandom: !getPlayOptions().isRandom });

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Types:

export type PlayOptions = { isRandom: boolean; loopThisMedia: boolean };
