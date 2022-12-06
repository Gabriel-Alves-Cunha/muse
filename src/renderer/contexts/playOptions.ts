import { createEffect } from "solid-js";
import { createStore } from "solid-js/store";

import { keys, setLocalStorage } from "@utils/localStorage";
import { info } from "@utils/log";
import { dbg } from "@common/debug";

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Main:

export const [playOptions, setPlayOptions] = createStore<PlayOptions>({
	isRandom: false,
	loop: false,
});

createEffect(() => {
	dbg("Saving playOptions on LocalStorage.");

	setLocalStorage(keys.playOptions, playOptions);
});

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Helper functions:

export const toggleLoopMedia = (): void => {
	const audio = document.getElementById("audio") as HTMLAudioElement | null;
	if (!audio) return info("There is no window.audio to toggleLoopMedia!");

	const loop = !playOptions.loop;

	audio.loop = loop;

	setPlayOptions({ loop });
};

////////////////////////////////////////////////

export const toggleRandom = () =>
	setPlayOptions({ isRandom: !playOptions.isRandom });

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Types:

export type PlayOptions = { isRandom: boolean; loop: boolean };
