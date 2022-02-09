import { persist } from "zustand/middleware";
import create from "zustand";

import { assertUnreachable } from "@renderer/utils/utils";
import { keyPrefix } from "@renderer/utils/app";

const playOptionsKey = keyPrefix + "play_options";

type PlayOptionsActions = {
	setPlayOptions(action: PlayOptions_Action): void;
	playOptions: PlayOptions;
};

export const usePlayOptions = create<PlayOptionsActions>(
	persist(
		(set, get) => ({
			playOptions: {
				loopThisMedia: false,
				loopAllMedia: true,
				isRandom: false,
			},
			setPlayOptions: (action: PlayOptions_Action) => {
				const previousPlayOptions = get().playOptions;

				switch (action.type) {
					case Type.LOOP_THIS_MEDIA: {
						const playOptions: PlayOptions = {
							...previousPlayOptions,
							loopThisMedia: action.value,
						};

						(document.getElementById("audio") as HTMLAudioElement).loop =
							action.value;

						set({ playOptions });
						break;
					}

					case Type.LOOP_ALL_MEDIA: {
						const playOptions: PlayOptions = {
							...previousPlayOptions,
							loopAllMedia: action.value,
						};

						set({ playOptions });
						break;
					}

					case Type.IS_RANDOM: {
						const playOptions: PlayOptions = {
							...previousPlayOptions,
							isRandom: action.value,
						};

						set({ playOptions });
						break;
					}

					default: {
						assertUnreachable(action);
						break;
					}
				}
			},
		}),
		{
			name: playOptionsKey,
		},
	),
);

export type PlayOptions_Action =
	| Readonly<{ type: Type.LOOP_ALL_MEDIA; value: PlayOptions["loopAllMedia"] }>
	| Readonly<{ type: Type.IS_RANDOM; value: PlayOptions["isRandom"] }>
	| Readonly<{
			value: PlayOptions["loopThisMedia"];
			type: Type.LOOP_THIS_MEDIA;
	  }>;

export type PlayOptions = Readonly<{
	loopThisMedia: boolean;
	loopAllMedia: boolean;
	isRandom: boolean;
}>;

export enum Type {
	LOOP_THIS_MEDIA,
	LOOP_ALL_MEDIA,
	IS_RANDOM,
}
