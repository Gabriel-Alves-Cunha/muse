import type { CurrentPlaying } from "@contexts/useCurrentPlaying";
import type { Path, Media } from "@common/@types/generalTypes";
import type { PlayOptions } from "@contexts/usePlayOptions";
import type { TypeOfMap } from "@common/@types/utils";
import type { History } from "@contexts/usePlaylists";

import { dbgPlaylists } from "@common/debug";

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Constants:

export const localStorageKeys = {
	currentPlaying: "@muse:currentPlaying",
	favorites: "@muse:playlists:favorites",
	history: "@muse:playlists:history",
	playOptions: "@muse:playOptions",
} as const;

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////

let setToLocalStorageTimer: NodeJS.Timer | undefined;

export function setLocalStorage(key: LocalStorageKeys, value: Values): void {
	clearTimeout(setToLocalStorageTimer);

	setToLocalStorageTimer = setTimeout(() => {
		if (value instanceof Map || value instanceof Set) value = [...value];

		const json = JSON.stringify(value);

		dbgPlaylists({ key, json, value });

		localStorage.setItem(key, json);
	}, 500);
}

////////////////////////////////////////////////

const emptyArrayString = "[]";

export function getFromLocalStorage(key: LocalStorageKeys): Values | undefined {
	const value = localStorage.getItem(key) ?? emptyArrayString;
	const item: unknown = JSON.parse(value);

	dbgPlaylists(`getFromLocalStorage("${key}")`, { item, value });

	if (item === emptyArrayString && !value) return undefined;

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
	| readonly [Path, Media][]
	| ReadonlySet<Path>
	| CurrentPlaying
	| PlayOptions
	| History;

//////////////////////////////////////////

type HistoryShape = TypeOfMap<History>;
