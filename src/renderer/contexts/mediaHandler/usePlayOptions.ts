import { persist } from "zustand/middleware";
import create from "zustand";
import merge from "deepmerge";

import { assertUnreachable } from "@utils/utils";
import { keyPrefix } from "@utils/app";
import { immer } from "@common/utils";

const playOptionsKey = keyPrefix + "play_options";

type PlayOptionsActions = {
	setPlayOptions(action: PlayOptionsAction): void;
	playOptions: PlayOptions;
};

export const usePlayOptions = create<PlayOptionsActions>(
	persist(
		immer(set => ({
			playOptions: {
				loopThisMedia: false,
				loopAllMedia: true,
				isRandom: false,
			},
			setPlayOptions: (action: PlayOptionsAction) => {
				switch (action.type) {
					case PlayOptionsType.LOOP_THIS_MEDIA: {
						(document.getElementById("audio") as HTMLAudioElement).loop =
							action.value;

						set(state => (state.playOptions.loopThisMedia = action.value));
						break;
					}

					case PlayOptionsType.LOOP_ALL_MEDIA: {
						set(state => (state.playOptions.loopAllMedia = action.value));
						break;
					}

					case PlayOptionsType.IS_RANDOM: {
						set(state => (state.playOptions.isRandom = action.value));
						break;
					}

					default: {
						assertUnreachable(action);
						break;
					}
				}
			},
		})),
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

export type PlayOptionsAction =
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
