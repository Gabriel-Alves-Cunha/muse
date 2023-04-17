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
	item: ItemToStore,
	waitTime = 500,
): void {
	if (item instanceof Set || item instanceof Map) item = [...item];

	try {
		const json = JSON.stringify(item);

		dbgPlaylists({ key, json });

		setTimeout(() => localStorage.setItem(key, json), waitTime);
	} catch (err) {
		error("Error on JSON.stringify(value) at setLocalStorage().", {
			item,
			err,
			key,
		});
	}
}

////////////////////////////////////////////////

const emptyArrayString = "[]";

export function getFromLocalStorage(
	key: Exclude<LocalStorageKeys, "settings">,
): ItemToStore {
	try {
		const value = localStorage.getItem(key) || emptyArrayString;
		const item: unknown = JSON.parse(value);

		dbgPlaylists(`getFromLocalStorage("${key}")`, { item, value });

		if (item === emptyArrayString) return [];

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
