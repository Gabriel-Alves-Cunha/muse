import { persist } from "zustand/middleware";
import create from "zustand";
import merge from "deepmerge";

import { assertUnreachable } from "@utils/utils";
import { keyPrefix } from "@utils/app";

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
					case PlayOptionsType.LOOP_THIS_MEDIA: {
						const playOptions: PlayOptions = {
							...previousPlayOptions,
							loopThisMedia: action.value,
						};

						(document.getElementById("audio") as HTMLAudioElement).loop =
							action.value;

						set({ playOptions });
						break;
					}

					case PlayOptionsType.LOOP_ALL_MEDIA: {
						const playOptions: PlayOptions = {
							...previousPlayOptions,
							loopAllMedia: action.value,
						};

						set({ playOptions });
						break;
					}

					case PlayOptionsType.IS_RANDOM: {
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
			serialize: state => JSON.stringify(state.state.playOptions),
			deserialize: state => JSON.parse(state),
			partialize: state => ({ playOptions: state.playOptions }),
			merge: (persistedState, currentState) =>
				merge(persistedState, currentState),
		},
	),
);

export type PlayOptions_Action =
	| Readonly<{
			type: PlayOptionsType.LOOP_ALL_MEDIA;
			value: PlayOptions["loopAllMedia"];
	  }>
	| Readonly<{
			type: PlayOptionsType.IS_RANDOM;
			value: PlayOptions["isRandom"];
	  }>
	| Readonly<{
			value: PlayOptions["loopThisMedia"];
			type: PlayOptionsType.LOOP_THIS_MEDIA;
	  }>;

export type PlayOptions = Readonly<{
	loopThisMedia: boolean;
	loopAllMedia: boolean;
	isRandom: boolean;
}>;

export enum PlayOptionsType {
	LOOP_THIS_MEDIA,
	LOOP_ALL_MEDIA,
	IS_RANDOM,
}
