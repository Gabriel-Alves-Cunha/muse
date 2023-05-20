import type { DateAsNumber, Path } from "@common/@types/GeneralTypes";
import type { CurrentPlaying } from "@contexts/currentPlaying";
import type { PlayOptions } from "@contexts/playOptions";

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
	itemToStore: ItemToStore,
	waitTime = 500,
): void {
	let possiblyTransformedItemToStore = itemToStore;

	if (itemToStore instanceof Set || itemToStore instanceof Map)
		possiblyTransformedItemToStore = [...itemToStore];

	try {
		const json = JSON.stringify(possiblyTransformedItemToStore);

		dbgPlaylists({ key, json });

		setTimeout(() => localStorage.setItem(key, json), waitTime);
	} catch (err) {
		error("Error on JSON.stringify(value) at setLocalStorage().", {
			possiblyTransformedItemToStore,
			err,
			key,
		});
	}
}

////////////////////////////////////////////////

const EMPTY_ARRAY_STRING = "[]";

export function getFromLocalStorage(
	key: Exclude<LocalStorageKeys, "@muse:settings">,
): ItemToStore {
	try {
		const value = localStorage.getItem(key) || EMPTY_ARRAY_STRING;
		const item: unknown = JSON.parse(value);

		dbgPlaylists(`getFromLocalStorage("${key}")`, { item, value });

		if (item === EMPTY_ARRAY_STRING) return [];

		return item as ItemToStore;
	} catch (err) {
		error(err);

		return [];
	}
}

//////////////////////////////////////////
//////////////////////////////////////////
//////////////////////////////////////////
// Types:

type LocalStorageKeys = typeof localStorageKeys[keyof typeof localStorageKeys];

//////////////////////////////////////////

type ItemToStore =
	| readonly [Path, DateAsNumber][]
	| ReadonlySet<Path>
	| readonly Path[]
	| CurrentPlaying
	| PlayOptions;
