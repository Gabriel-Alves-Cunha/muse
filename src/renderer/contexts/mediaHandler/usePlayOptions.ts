import { persist } from "zustand/middleware";
import create from "zustand";

import { keyPrefix } from "@utils/app";

const playOptionsKey = `${keyPrefix}play_options` as const;

export const usePlayOptions = create<PlayOptions>()(
	persist(
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		(_set, _get) => ({
			loopThisMedia: false,
			isRandom: false,
		}),
		{
			name: playOptionsKey,
		}
	)
);

export const { getState: playOptions, setState: setPlayOptions } =
	usePlayOptions;

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////

export function toggleLoopMedia() {
	const newValue = !playOptions().loopThisMedia;

	setPlayOptions({ loopThisMedia: newValue });

	(document.getElementById("audio") as HTMLAudioElement).loop = newValue;
}

export function toggleRandom() {
	setPlayOptions({ isRandom: !playOptions().isRandom });
}

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////

export type PlayOptions = Readonly<{
	loopThisMedia: boolean;
	isRandom: boolean;
}>;
