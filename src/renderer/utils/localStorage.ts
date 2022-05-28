import type { CurrentPlaying } from "@contexts/mediaHandler/useCurrentPlaying";
import type { Media, Path } from "@common/@types/generalTypes";
import type { PlayOptions } from "@contexts/mediaHandler/usePlayOptions";

import { stringifyAsync } from "js-coroutines";

import { assertUnreachable, time } from "./utils";
import { dbgPlaylists } from "@common/utils";

const { assert } = console;

export const keyPrefix = "@muse:";

export const keys = Object.freeze({
	sortedByName: `${keyPrefix}playlist:sortedByName`,
	sortedByDate: `${keyPrefix}playlist:sortedByDate`,
	currentPlaying: `${keyPrefix}current_playing`,
	favorites: `${keyPrefix}playlist:favorites`,
	playOptions: `${keyPrefix}play_options`,
	history: `${keyPrefix}playlist:history`,
} as const);

type Keys = typeof keys[keyof typeof keys];
type Values =
	| Readonly<Path[]>
	| [Path, Media][]
	| CurrentPlaying
	| PlayOptions
	| Set<Path>
	| Path[];

export function setLocalStorage(key: Readonly<Keys>, value: Values): void {
	setTimeout(() => {
		time(async () => {
			try {
				if (value instanceof Map || value instanceof Set)
					//@ts-ignore - This conversion will work:
					value = Array.from(value);

				const serializedValue = await stringifyAsync(value);

				dbgPlaylists({ key, serializedValue, value });

				// @ts-ignore => It doesn't matter that `serializedValue`,
				// is of type String or string, they both work:
				localStorage.setItem(key, serializedValue);
			} catch (error) {
				console.error(error);
			}
		}, `setLocalStorage(${key})`);
	});
}

export function getFromLocalStorage(key: Keys) {
	return time(() => {
		try {
			{
				const value = localStorage.getItem(key);
				// @ts-ignore this is the only that it works:
				const item: unknown = JSON.parse(value);

				dbgPlaylists(`getFromLocalStorage(${key})`, item);

				if (!item) return undefined;

				switch (key) {
					case keys.favorites: {
						assert(
							Array.isArray(item),
							"favorites from storage must be an array:" + item,
						);

						const newFavorites = new Set(item as Path[]);

						dbgPlaylists("getFromLocalStorage: newFavorites =", newFavorites);

						return newFavorites;
					}

					case keys.history: {
						assert(
							Array.isArray(item),
							"history from storage must be an array:" + item,
						);

						const newHistory = Array.from(item as Path[]);

						dbgPlaylists("getFromLocalStorage: newHistory =", newHistory);

						return newHistory;
					}

					case keys.sortedByDate: {
						assert(
							Array.isArray(item),
							"sortedByDate from storage must be an array:" + item,
						);

						const newSortedByDate = item as Path[];

						dbgPlaylists(
							"getFromLocalStorage: newSortedByDate =",
							newSortedByDate,
						);

						return newSortedByDate;
					}

					case keys.sortedByName: {
						assert(
							Array.isArray(item),
							"sortedByName from storage must be an array:" + item,
						);

						const newSortedByName = new Set(item as Path[]);

						dbgPlaylists(
							"getFromLocalStorage: newSortedByName =",
							newSortedByName,
						);

						return newSortedByName;
					}

					case keys.currentPlaying: {
						const newCurrentPlaying = item as CurrentPlaying;

						dbgPlaylists(
							"getFromLocalStorage: newCurrentPlaying =",
							newCurrentPlaying,
						);

						return newCurrentPlaying;
					}

					case keys.playOptions: {
						const newPlayOptions = item as PlayOptions;

						dbgPlaylists(
							"getFromLocalStorage: newPlayOptions =",
							newPlayOptions,
						);

						return newPlayOptions;
					}

					default: {
						return assertUnreachable(key);
					}
				}
			}
		} catch (error) {
			console.error(error);
			return undefined;
		}
	}, `getFromLocalStorage(${key})`);
}
