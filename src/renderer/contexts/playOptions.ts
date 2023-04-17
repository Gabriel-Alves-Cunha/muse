import { create } from "zustand";

import { localStorageKeys } from "@utils/localStorage";
import { getAudio } from "./currentPlaying";
import { error } from "@common/log";

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Main function:

export const usePlayOptions = create<PlayOptions>(() => {
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

	return playOptionsToApply;
});

export const { getState: getPlayOptions, setState: setPlayOptions } =
	usePlayOptions;

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Listeners:

let setToLocalStorageTimer: NodeJS.Timer | undefined;

usePlayOptions.subscribe((playOptions) => {
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

	const loopThisMedia = !getPlayOptions().loopThisMedia;

	setPlayOptions({ loopThisMedia });

	if (audio) audio.loop = loopThisMedia;
}

////////////////////////////////////////////////

export const toggleRandom = (): void =>
	setPlayOptions((prev) => ({ isRandom: !prev.isRandom }));

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Types:

export type PlayOptions = Readonly<{
	loopThisMedia: boolean;
	isRandom: boolean;
}>;
