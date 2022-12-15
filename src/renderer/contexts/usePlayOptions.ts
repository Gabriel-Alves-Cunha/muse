import create from "zustand";

import { setPlayOptionsOnLocalStorage } from "./localStorageHelpers";

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

export const toggleLoopMedia = (): void => {
	const loopThisMedia = !getPlayOptions().loopThisMedia;

	(document.getElementById("audio") as HTMLAudioElement).loop = loopThisMedia;

	setPlayOptions({ loopThisMedia });
};

////////////////////////////////////////////////

export const toggleRandom = () =>
	setPlayOptions({ isRandom: !getPlayOptions().isRandom });

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Types:

export type PlayOptions = { isRandom: boolean; loopThisMedia: boolean };
