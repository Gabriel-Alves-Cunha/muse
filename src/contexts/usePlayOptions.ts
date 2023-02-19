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

export const toggleLoopMedia = (): void =>
	setPlayOptions((prev) => {
		const loopThisMedia = !prev.loopThisMedia;

		const audio = getAudio();
		if (audio) audio.loop = loopThisMedia;

		return { loopThisMedia };
	});

////////////////////////////////////////////////

export const toggleIsRandom = () =>
	setPlayOptions((prev) => ({ isRandom: !prev.isRandom }));

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Types:

export type PlayOptions = { isRandom: boolean; loopThisMedia: boolean };
