import { proxy, subscribe } from "valtio";

import { localStorageKeys } from "@utils/localStorage";
import { getAudio } from "./currentPlaying";
import { error } from "@common/log";

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Pre work:

const storagedPlayOptionsString = localStorage.getItem(
	localStorageKeys.playOptions,
);

let playOptionsToApply: PlayOptions = {
	loopThisMedia: false,
	isRandom: false,
};

try {
	if (storagedPlayOptionsString)
		playOptionsToApply = JSON.parse(storagedPlayOptionsString);
} catch (err) {
	error(
		"Error parsing JSON.parse(storagedPlayOptionsString). Applying default settings.",
		err,
	);
}

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Main function:

export const playOptions = proxy<PlayOptions>(playOptionsToApply);

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Listeners:

let setToLocalStorageTimer: NodeJS.Timer | undefined;

subscribe(playOptions, () => {
	clearTimeout(setToLocalStorageTimer);

	setToLocalStorageTimer = setTimeout(
		() =>
			localStorage.setItem(
				localStorageKeys.playOptions,
				JSON.stringify(playOptions),
			),
		200,
	);
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
