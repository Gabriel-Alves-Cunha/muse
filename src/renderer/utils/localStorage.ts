import type { CurrentPlaying } from "@contexts/useCurrentPlaying";
import type { Media, Path } from "@common/@types/generalTypes";
import type { PlayOptions } from "@contexts/usePlayOptions";
import type { TypeOfMap } from "@common/@types/utils";
import type { History } from "@contexts/usePlaylists";


import { assertUnreachable } from "./utils";
import { dbgPlaylists } from "@common/debug";
import { error } from "@utils/log";


////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Constants:

export const keys = {
	sortedByDate: "@muse:playlist:sortedByDate",
	currentPlaying: "@muse:currentPlaying",
	favorites: "@muse:playlist:favorites",
	history: "@muse:playlist:history",
	playOptions: "@muse:playOptions",
} as const;

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////

export function setLocalStorage(key: Readonly<Keys>, value: Values): void {
	setTimeout(() => {
		if (value instanceof Map || value instanceof Set) value = [...value];

		const json = JSON.stringify(value);

		dbgPlaylists({ key, json, value });

		// @ts-ignore => It doesn't matter that `serializedValue`,
		// is of type `String` or `string`, they both work:
		localStorage.setItem(key, json);
	});
}

////////////////////////////////////////////////

export function getFromLocalStorage(key: Readonly<Keys>): Values | undefined {
	try {
		const value = localStorage.getItem(key);
		// @ts-ignore => ^ `?? "";` does not work :|
		const item: unknown = JSON.parse(value);

		dbgPlaylists(`getFromLocalStorage(${key})`, { item, value });

		if (!(item && value)) return undefined;

		switch (key) {
			case keys.favorites: {
				const newFavorites = new Set(item as Path[]);

				dbgPlaylists("getFromLocalStorage: newFavorites =", newFavorites);

				return newFavorites;
			}

			case keys.history: {
				const newHistory: History = new Map(item as HistoryShape);

				dbgPlaylists("getFromLocalStorage: newHistory =", newHistory);

				return newHistory;
			}

			case keys.sortedByDate: {
				const newSortedByDate = new Set(item as Path[]);

				dbgPlaylists("getFromLocalStorage: newSortedByDate =", newSortedByDate);

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
	} catch (err) {
		error(err);
		return undefined;
	}
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
