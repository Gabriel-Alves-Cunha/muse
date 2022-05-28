import create from "zustand";

import { setPlayOptionsLocalStorage } from "./localStorageHelpers";

export const usePlayOptions = create<PlayOptions>()(
	setPlayOptionsLocalStorage(() => ({
		random: false,
		loop: false,
	})),
);

export const { getState: playOptions, setState: setPlayOptions } =
	usePlayOptions;

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////

export const toggleLoopMedia = () => {
	const loop = !playOptions().loop;

	(document.getElementById("audio") as HTMLAudioElement).loop = loop;

	setPlayOptions({ loop });
};

export const toggleRandom = () =>
	setPlayOptions({ random: !playOptions().random });

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////

export type PlayOptions = Readonly<{
	random: boolean;
	loop: boolean;
}>;
