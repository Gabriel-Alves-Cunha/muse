import { createEffect, createSignal } from "solid-js";

import { keys, setLocalStorage } from "@utils/localStorage";
import { info } from "@utils/log";
import { dbg } from "@common/debug";

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Main:

export const [getPlayOptions, setPlayOptions] = createSignal<PlayOptions>({
	isRandom: false,
	loop: false,
});

createEffect(() => {
	// dbg("Saving playOptions on LocalStorage.");

	setLocalStorage(keys.playOptions, getPlayOptions());
});

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Helper functions:

export const toggleLoopMedia = (): void => {
	if (!window.audio)
		return info("There is no window.audio to toggleLoopMedia!");

	const loop = !getPlayOptions().loop;

	window.audio.loop = loop;

	setPlayOptions((prev) => ({ ...prev, loop }));
};

////////////////////////////////////////////////

export const toggleRandom = () =>
	setPlayOptions((prev) => ({ ...prev, isRandom: !getPlayOptions().isRandom }));

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Types:

export type PlayOptions = { isRandom: boolean; loop: boolean };
