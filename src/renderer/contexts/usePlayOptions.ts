import { createEffect, createSignal } from "solid-js";

import { keys, setLocalStorage } from "@utils/localStorage";
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
	dbg("Saving playOptions on LocalStorage.");

	setLocalStorage(keys.playOptions, getPlayOptions());
});

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Helper functions:

export const toggleLoopMedia = (): void => {
	if (!window.audio) return;

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
