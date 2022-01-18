import { useReducer } from "react";

import { assertUnreachable } from "@renderer/utils/utils";
import { useLocalStorage } from "@hooks";
import { keyPrefix } from "@renderer/utils/app";

const playOptionsKey = keyPrefix + "play_options";

export function usePlayOptions() {
	const [cachedPlayOptions, setCachedPlayOptions] =
		useLocalStorage<PlayOptions>(playOptionsKey, {
			loopThisMedia: false,
			loopAllMedia: true,
			isRandom: false,
		});

	const [playOptions, dispatchPlayOptions] = useReducer(
		playOptionsReducer,
		cachedPlayOptions,
	);

	function playOptionsReducer(
		previousPlayOptions: PlayOptions,
		action: PlayOptions_Action,
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

			case "loop all media": {
				const newPlayOptions: PlayOptions = {
					...previousPlayOptions,
					loopAllMedia: action.value,
				};

				setCachedPlayOptions(newPlayOptions);

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
	loopThisMedia: boolean;
	loopAllMedia: boolean;
	isRandom: boolean;
}>;

export type PlayOptions_Action =
	| Readonly<{ type: "loop this media"; value: PlayOptions["loopThisMedia"] }>
	| Readonly<{ type: "loop all media"; value: PlayOptions["loopAllMedia"] }>
	| Readonly<{ type: "is random"; value: PlayOptions["isRandom"] }>;
