import { useReducer } from "react";

import { assertUnreachable } from "@renderer/utils/utils";
import { useLocalStorage } from "@hooks";
import { keyPrefix } from "@renderer/utils/app";

const playOptionsKey = keyPrefix + "play_options";

export function usePlayOptions() {
	const [cachedPlayOptions, setCachedPlayOptions] =
		useLocalStorage<PlayOptions>(playOptionsKey, {
			loopThisMedia: false,
			repeatAllMedia: true,
			isRandom: false,
			isPaused: true,
			muted: false,
		});

	const [playOptions, dispatchPlayOptions] = useReducer(
		playOptionsReducer,
		cachedPlayOptions
	);

	function playOptionsReducer(
		previousPlayOptions: PlayOptions,
		action: PlayOptions_Action
	): PlayOptions {
		const { type } = action;

		switch (type) {
			case "loop this media": {
				const newPlayOptions: PlayOptions = {
					...previousPlayOptions,
					loopThisMedia: action.value,
				};

				(document.getElementById("audio") as HTMLAudioElement).loop =
					action.value;

				setCachedPlayOptions(newPlayOptions);

				return newPlayOptions;
				break;
			}

			case "repeat all media": {
				const newPlayOptions: PlayOptions = {
					...previousPlayOptions,
					repeatAllMedia: action.value,
				};

				setCachedPlayOptions(newPlayOptions);

				return newPlayOptions;
				break;
			}

			case "muted": {
				const newPlayOptions: PlayOptions = {
					...previousPlayOptions,
					muted: action.value,
				};

				console.time("doc get audio");
				(document.getElementById("audio") as HTMLAudioElement).muted =
					action.value;
				console.timeEnd("doc get audio");

				return newPlayOptions;
				break;
			}

			case "is paused": {
				const newPlayOptions: PlayOptions = {
					...previousPlayOptions,
					isPaused: action.value,
				};

				return newPlayOptions;
				break;
			}

			case "is random": {
				const newPlayOptions: PlayOptions = {
					...previousPlayOptions,
					isRandom: action.value,
				};

				setCachedPlayOptions(newPlayOptions);

				return newPlayOptions;
				break;
			}

			default:
				return assertUnreachable(type);
		}
	}

	return [playOptions, dispatchPlayOptions] as const;
}

usePlayOptions.whyDidYouRender = {
	customName: "usePlayOptions",
	logOnDifferentValues: false,
};

export type PlayOptions = Readonly<{
	repeatAllMedia: boolean;
	loopThisMedia: boolean;
	isRandom: boolean;
	isPaused: boolean;
	muted: boolean;
}>;

export type PlayOptions_Action =
	| Readonly<{ type: "repeat all media"; value: PlayOptions["repeatAllMedia"] }>
	| Readonly<{ type: "loop this media"; value: PlayOptions["loopThisMedia"] }>
	| Readonly<{ type: "is random"; value: PlayOptions["isRandom"] }>
	| Readonly<{ type: "is paused"; value: PlayOptions["isPaused"] }>
	| Readonly<{ type: "muted"; value: PlayOptions["muted"] }>;
