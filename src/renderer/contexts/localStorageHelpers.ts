import type { UsePlaylistsStatesAndActions } from "./usePlaylists";
import type { CurrentPlaying } from "./useCurrentPlaying";
import type { StateCreator } from "zustand";
import type { PlayOptions } from "./usePlayOptions";

import { keys, setLocalStorage } from "@utils/localStorage";
import { areObjectKeysEqual } from "@utils/object";

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

export const setCurrentPlayingOnLocalStorage: SetLocalStoragePlugin<
	CurrentPlaying
> = (fn) => (set, get, store) => {
	const newSetter: typeof set = (
		newCurrentPlaying: Partial<CurrentPlaying>,
		replace,
	) => {
		const previousState = get();
		const areStatesEqual = areObjectKeysEqual(newCurrentPlaying, previousState);

		set(newCurrentPlaying, replace);

		if (!areStatesEqual) setLocalStorage(keys.currentPlaying, get());
	};

	store.setState = newSetter;

	return fn(newSetter, get, store);
};

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

export const setPlayOptionsOnLocalStorage: SetLocalStoragePlugin<PlayOptions> =
	(fn) => (set, get, store) => {
		const newSetter: typeof set = (
			newPlayOptions: Partial<PlayOptions>,
			replace,
		) => {
			const previousState = get();
			const areStatesEqual = areObjectKeysEqual(newPlayOptions, previousState);

			set(newPlayOptions, replace);

			if (!areStatesEqual) setLocalStorage(keys.playOptions, get());
		};

		store.setState = newSetter;

		return fn(newSetter, get, store);
	};

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

export const setPlaylistsOnLocalStorage: SetLocalStoragePlugin<
	UsePlaylistsStatesAndActions
> = (fn) => (set, get, store) => {
	const newSetter: typeof set = (
		args: PlaylistsToSave, // This is actually of type UsePlaylistsActions, but we don't want to save the whole object
		replace: boolean,
	) => {
		for (const key of ["favorites", "history"] as const)
			args[key] && setLocalStorage(keys[key], args[key]!);

		set(args, replace);
	};

	store.setState = newSetter;

	return fn(newSetter, get, store);
};

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Types:

type PlaylistsToSave = Partial<
	Pick<UsePlaylistsStatesAndActions, "favorites" | "history">
>;

/////////////////////////////////////////

type SetLocalStoragePlugin<T> = (
	fn: StateCreator<T, [], []>,
	name?: string,
) => StateCreator<T, [], []>;
