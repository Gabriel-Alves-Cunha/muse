import type { CurrentPlaying } from "@contexts/useCurrentPlaying";
import type { PlayOptions } from "@contexts/usePlayOptions";
import type { ID, Media } from "@common/@types/generalTypes";
import type { TypeOfMap } from "@common/@types/utils";
import type { History } from "@contexts/usePlaylists";

import { dbgPlaylists } from "@common/debug";

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Constants:

export const keys = {
	currentPlaying: "@muse:currentPlaying",
	favorites: "@muse:playlist:favorites",
	history: "@muse:playlist:history",
	playOptions: "@muse:playOptions",
} as const;

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////

export const setLocalStorage = (key: Keys, value: Values): void =>
	setTimeout(() => {
		if (value instanceof Map || value instanceof Set) value = [...value];

		const json = JSON.stringify(value);

		dbgPlaylists({ key, json, value });

		localStorage.setItem(key, json);
	}) as unknown as void;

////////////////////////////////////////////////

const emptyArrayString = "[]";

export function getFromLocalStorage(key: Keys): Values | undefined {
	const value = localStorage.getItem(key) ?? emptyArrayString;
	const item: unknown = JSON.parse(value);

	dbgPlaylists(`getFromLocalStorage("${key}")`, { item, value });

	if (item === emptyArrayString && !value) return undefined;

	if (key === keys.favorites) {
		const newFavorites = new Set(item as ID[]);

		dbgPlaylists("getFromLocalStorage: newFavorites =", newFavorites);

		return newFavorites;
	}

	if (key === keys.history) {
		const newHistory: History = new Map(item as HistoryShape);

		dbgPlaylists("getFromLocalStorage: newHistory =", newHistory);

		return newHistory;
	}

	if (key === keys.currentPlaying) {
		const newCurrentPlaying = item as CurrentPlaying;

		dbgPlaylists("getFromLocalStorage: newCurrentPlaying =", newCurrentPlaying);

		return newCurrentPlaying;
	}

	if (key === keys.playOptions) {
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

type Keys = typeof keys[keyof typeof keys];

//////////////////////////////////////////

type Values =
	| readonly [ID, Media][]
	| ReadonlySet<ID>
	| CurrentPlaying
	| PlayOptions
	| History;

//////////////////////////////////////////

type HistoryShape = TypeOfMap<History>;
