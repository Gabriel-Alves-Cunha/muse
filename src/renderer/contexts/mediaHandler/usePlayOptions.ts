import create from "zustand";

import { keys, setLocalStorage } from "@utils/localStorage";

export const usePlayOptions = create<PlayOptions>(() => ({
	loopThisMedia: false,
	isRandom: false,
}));

export const { getState: playOptions, setState: setPlayOptions } =
	usePlayOptions;

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////

export function toggleLoopMedia() {
	const newValue = !playOptions().loopThisMedia;

	(document.getElementById("audio") as HTMLAudioElement).loop = newValue;

	setPlayOptions({ loopThisMedia: newValue });
	setLocalStorage(keys.playOptions, playOptions());
}

export function toggleRandom() {
	setPlayOptions({ isRandom: !playOptions().isRandom });
	setLocalStorage(keys.playOptions, playOptions());
}

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////

export type PlayOptions = Readonly<{
	loopThisMedia: boolean;
	isRandom: boolean;
}>;
