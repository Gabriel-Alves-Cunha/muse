import { persist } from "zustand/middleware";
import create from "zustand";
import merge from "deepmerge";

import { assertUnreachable } from "@utils/utils";
import { keyPrefix } from "@utils/app";

const playOptionsKey = `${keyPrefix}play_options` as const;

type PlayOptionsActions = Readonly<{
	setPlayOptions(action: PlayOptionsAction): void;
	playOptions: PlayOptions;
}>;

export const usePlayOptions = create<PlayOptionsActions>(
	persist(
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		(set, _get) => ({
			playOptions: {
				loopThisMedia: false,
				isRandom: false,
			},
			setPlayOptions: (action: PlayOptionsAction) => {
				switch (action.type) {
					case PlayOptionsType.LOOP_THIS_MEDIA: {
						(document.getElementById("audio") as HTMLAudioElement).loop =
							action.value;

						set(state => ({
							playOptions: {
								...state.playOptions,
								loopThisMedia: action.value,
							},
						}));
						break;
					}

					case PlayOptionsType.IS_RANDOM: {
						set(state => ({
							playOptions: {
								...state.playOptions,
								isRandom: action.value,
							},
						}));
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
			serialize: ({ state }) => JSON.stringify(state.playOptions),
			deserialize: playOptions => JSON.parse(playOptions),
			partialize: ({ playOptions }) => ({ playOptions }),
			merge: (persistedState, currentState) =>
				merge(persistedState, currentState),
		},
	),
);

export type PlayOptionsAction =
	| Readonly<{
			type: PlayOptionsType.LOOP_THIS_MEDIA;
			value: PlayOptions["loopThisMedia"];
	  }>
	| Readonly<{
			type: PlayOptionsType.IS_RANDOM;
			value: PlayOptions["isRandom"];
	  }>;

export type PlayOptions = Readonly<{
	loopThisMedia: boolean;
	isRandom: boolean;
}>;

export enum PlayOptionsType {
	LOOP_THIS_MEDIA,
	IS_RANDOM,
}
