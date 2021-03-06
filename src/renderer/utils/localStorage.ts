import type { Media, Path, TypeOfMap } from "@common/@types/generalTypes";
import type { CurrentPlaying } from "@contexts/mediaHandler/useCurrentPlaying";
import type { PlayOptions } from "@contexts/mediaHandler/usePlayOptions";
import type { History } from "@contexts/mediaHandler/usePlaylists";

import { stringifyAsync } from "js-coroutines";

import { assertUnreachable, time } from "./utils";
import { dbgPlaylists } from "@common/utils";

const { assert, error } = console;

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Constants:

export const keyPrefix = "@muse:";

export const keys = Object.freeze(
	{
		sortedByDate: `${keyPrefix}playlist:sortedByDate`,
		currentPlaying: `${keyPrefix}currentPlaying`,
		favorites: `${keyPrefix}playlist:favorites`,
		history: `${keyPrefix}playlist:history`,
		playOptions: `${keyPrefix}playOptions`,
	} as const,
);

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////

export function setLocalStorage(key: Readonly<Keys>, value: Values): void {
	setTimeout(() =>
		time(async () => {
			if (value instanceof Map || value instanceof Set)
				value = [...value];

			const serializedValue = await stringifyAsync(value).catch(error);

			dbgPlaylists({ key, serializedValue, value });

			// @ts-ignore => It doesn't matter that `serializedValue`,
			// is of type `String` or `string`, they both work:
			localStorage.setItem(key, serializedValue);
		}, `setLocalStorage(${key})`)
	);
}

////////////////////////////////////////////////

export function getFromLocalStorage(key: Readonly<Keys>): Values | undefined {
	return time(() => {
		try {
			const value = localStorage.getItem(key);
			// @ts-ignore => ^ `?? "";` does not work :|
			const item: unknown = JSON.parse(value);

			dbgPlaylists(`getFromLocalStorage(${key})`, { item, value });

			if (!item || !value) return undefined;

			switch (key) {
				case keys.favorites: {
					assert(
						Array.isArray(item),
						"favorites from storage must be an array:",
						item,
					);

					const newFavorites = new Set(item as Path[]);

					dbgPlaylists("getFromLocalStorage: newFavorites =", newFavorites);

					return newFavorites;
				}

				case keys.history: {
					assert(
						Array.isArray(item),
						"history from storage must be an array:",
						item,
					);

					const newHistory: History = new Map(item as HistoryShape);

					dbgPlaylists("getFromLocalStorage: newHistory =", newHistory);

					return newHistory;
				}

				case keys.sortedByDate: {
					assert(
						Array.isArray(item),
						"sortedByDate from storage must be an array:",
						item,
					);

					const newSortedByDate = new Set(item as Path[]);

					dbgPlaylists(
						"getFromLocalStorage: newSortedByDate =",
						newSortedByDate,
					);

					return newSortedByDate;
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

					dbgPlaylists("getFromLocalStorage: newPlayOptions =", newPlayOptions);

					return newPlayOptions;
				}

				default:
					return assertUnreachable(key);
			}
		} catch (error) {
			console.error(error);
			return undefined;
		}
	}, `getFromLocalStorage(${key})`);
}

//////////////////////////////////////////
//////////////////////////////////////////
//////////////////////////////////////////
// Types:

type Keys = typeof keys[keyof typeof keys];

//////////////////////////////////////////

type Values =
	| readonly [Path, Media][]
	| ReadonlySet<Path>
	| CurrentPlaying
	| PlayOptions
	| History;

//////////////////////////////////////////

type HistoryShape = TypeOfMap<History>;
