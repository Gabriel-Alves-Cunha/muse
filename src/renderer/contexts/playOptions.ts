import { proxy, subscribe } from "valtio";

import { localStorageKeys, setLocalStorage } from "@utils/localStorage";
import { getAudio } from "./currentPlaying";

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Main:

let storagedPlayOptions: PlayOptions | undefined;
const storagedPlayOptionsString = localStorage.getItem(
	localStorageKeys.playOptions,
);
if (storagedPlayOptionsString)
	storagedPlayOptions = JSON.parse(storagedPlayOptionsString);

export const playOptions = proxy<PlayOptions>(
	storagedPlayOptions ?? {
		loopThisMedia: false,
		isRandom: false,
	},
);

subscribe(playOptions, () => {
	setLocalStorage(localStorageKeys.playOptions, playOptions);
});

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Helper functions:

export function toggleLoopMedia(): void {
	const audio = getAudio();
	if (!audio) return;

	const loopThisMedia = !playOptions.loopThisMedia;

	playOptions.loopThisMedia = loopThisMedia;
	audio.loop = loopThisMedia;
}

////////////////////////////////////////////////

export const toggleRandom = () =>
	(playOptions.isRandom = !playOptions.isRandom);

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Types:

export type PlayOptions = { isRandom: boolean; loopThisMedia: boolean };
