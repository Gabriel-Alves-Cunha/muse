import type { CurrentPlaying } from "@contexts/currentPlaying";
import type { PlayOptions } from "@contexts/playOptions";
import type { TypeOfMap } from "@common/@types/utils";
import type { History } from "@contexts/playlists";
import type { Path } from "@common/@types/generalTypes";

import { ReactiveMap } from "@solid-primitives/map";
import { ReactiveSet } from "@solid-primitives/set";

import { dbgPlaylists } from "@common/debug";

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Constants:

export const keys = {
	currentPlaying: "@muse:currentPlaying",
	favorites: "@muse:playlists:favorites",
	history: "@muse:playlists:history",
	playOptions: "@muse:playOptions",
} as const;

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////

export const setLocalStorage = (
	key: Keys,
	value: AllowedToSetOnLocalStorage,
): void =>
	setTimeout(() => {
		if (value instanceof Map || value instanceof Set) value = [...value];

		const json = JSON.stringify(value);

		dbgPlaylists({ key, json, value });

		localStorage.setItem(key, json);
	}) as unknown as void;

////////////////////////////////////////////////

export const getFromLocalStorage = (key: Keys): ReturnFromLocalStorage => {
	const value = localStorage.getItem(key) || "[]";
	const item: unknown = JSON.parse(value);

	dbgPlaylists(`getFromLocalStorage("${key}")`, { item, value });

	if (item === "[]") return undefined;

	if (key === keys.favorites) {
		const newFavorites = new ReactiveSet(item as Path[]);

		dbgPlaylists("getFromLocalStorage: newFavorites =", newFavorites);

		return newFavorites;
	}

	if (key === keys.history) {
		const newHistory: History = new ReactiveMap(item as HistoryShape);

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
};

//////////////////////////////////////////
//////////////////////////////////////////
//////////////////////////////////////////
// Types:

type Keys = typeof keys[keyof typeof keys];

//////////////////////////////////////////

type AllowedToSetOnLocalStorage =
	| (string | [string, number[]])[]
	| ReactiveSet<Path>
	| CurrentPlaying
	| PlayOptions
	| History;

//////////////////////////////////////////

type ReturnFromLocalStorage =
	| ReactiveSet<Path>
	| CurrentPlaying
	| PlayOptions
	| undefined
	| History;

//////////////////////////////////////////

type HistoryShape = TypeOfMap<History>;
