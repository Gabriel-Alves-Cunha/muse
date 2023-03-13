import type { CurrentPlaying } from "@contexts/currentPlaying";
import type { Path, Media } from "@common/@types/GeneralTypes";
import type { PlayOptions } from "@contexts/playOptions";
import type { TypeOfMap } from "@common/@types/Utils";
import type { History } from "@contexts/playlists";

import { dbgPlaylists } from "@common/debug";
import { error } from "@common/log";

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Constants:

export const localStorageKeys = {
	currentPlaying: "@muse:currentPlaying",
	favorites: "@muse:playlists:favorites",
	history: "@muse:playlists:history",
	playOptions: "@muse:playOptions",
	settings: "@muse:settings",
} as const;

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////

export function setLocalStorage(
	key: LocalStorageKeys,
	value: Values,
	isProxyMapOrSet: boolean,
	waitTime = 500,
): void {
	if (isProxyMapOrSet) {
		// @ts-ignore => value is of type Map<Path, Media> | Set<Path>
		value = [...value];
	}

	try {
		const json = JSON.stringify(value);

		dbgPlaylists({ key, json });

		setTimeout(() => localStorage.setItem(key, json), waitTime);
	} catch (err) {
		error("Error on JSON.stringify(value) at setLocalStorage().", {
			isProxyMapOrSet,
			value,
			err,
			key,
		});
	}
}

////////////////////////////////////////////////

const emptyArrayString = "[]";

export function getFromLocalStorage(key: LocalStorageKeys): Values | undefined {
	const value = localStorage.getItem(key) ?? emptyArrayString;
	const item: unknown = JSON.parse(value);

	dbgPlaylists(`getFromLocalStorage("${key}")`, { item, value });

	if (item === emptyArrayString && !value) return;

	if (key === localStorageKeys.favorites) {
		const newFavorites = new Set(item as Path[]);

		dbgPlaylists("getFromLocalStorage: newFavorites =", newFavorites);

		return newFavorites;
	}

	if (key === localStorageKeys.history) {
		const newHistory: History = new Map(item as HistoryShape);

		dbgPlaylists("getFromLocalStorage: newHistory =", newHistory);

		return newHistory;
	}

	if (key === localStorageKeys.currentPlaying) {
		const newCurrentPlaying = item as CurrentPlaying;

		dbgPlaylists("getFromLocalStorage: newCurrentPlaying =", newCurrentPlaying);

		return newCurrentPlaying;
	}

	if (key === localStorageKeys.playOptions) {
		const newPlayOptions = item as PlayOptions;

		dbgPlaylists("getFromLocalStorage: newPlayOptions =", newPlayOptions);

		return newPlayOptions;
	}

	return undefined;
}

//////////////////////////////////////////
//////////////////////////////////////////
//////////////////////////////////////////
// Types:

type LocalStorageKeys = typeof localStorageKeys[keyof typeof localStorageKeys];

//////////////////////////////////////////

type Values =
	| ReadonlySet<Path>
	| [Path, Media][]
	| CurrentPlaying
	| PlayOptions
	| History
	| Path[];

//////////////////////////////////////////

type HistoryShape = TypeOfMap<History>;
