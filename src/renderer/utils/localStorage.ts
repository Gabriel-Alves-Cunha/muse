import type { CurrentPlaying } from "@contexts/currentPlaying";
import type { PlayOptions } from "@contexts/playOptions";
import type { Path } from "@common/@types/GeneralTypes";

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

export function getFromLocalStorage(
	key: Exclude<LocalStorageKeys, "settings">,
): Values {
	try {
		const value = localStorage.getItem(key) || emptyArrayString;
		const item: unknown = JSON.parse(value);

		dbgPlaylists(`getFromLocalStorage("${key}")`, { item, value });

		if (item === emptyArrayString) return [];

		return item as Values;
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

type Values = ReadonlySet<Path> | CurrentPlaying | PlayOptions | Path[];
