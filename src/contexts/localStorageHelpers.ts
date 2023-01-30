import type { UsePlaylistsStatesAndActions } from "./usePlaylists";
import type { CurrentPlaying } from "./useCurrentPlaying";
import type { StateCreator } from "zustand";
import type { PlayOptions } from "./usePlayOptions";

import { localStorageKeys, setLocalStorage } from "@utils/localStorage";

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

export const setCurrentPlayingOnLocalStorage: SetLocalStoragePlugin<
	CurrentPlaying
> = (fn) => (set, get, store) => {
	const newSetStateFunction: typeof set = (
		newCurrentPlaying: Partial<CurrentPlaying>,
		replace,
	) => {
		set(newCurrentPlaying, replace);
		setLocalStorage(localStorageKeys.currentPlaying, get());
	};

	store.setState = newSetStateFunction;

	return fn(newSetStateFunction, get, store);
};

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

export const setPlayOptionsOnLocalStorage: SetLocalStoragePlugin<PlayOptions> =
	(fn) => (set, get, store) => {
		const newSetStateFunction: typeof set = (
			newPlayOptions: Partial<PlayOptions>,
			replace,
		) => {
			set(newPlayOptions, replace);
			setLocalStorage(localStorageKeys.playOptions, get());
		};

		store.setState = newSetStateFunction;

		return fn(newSetStateFunction, get, store);
	};

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

export const setPlaylistsOnLocalStorage: SetLocalStoragePlugin<
	UsePlaylistsStatesAndActions
> = (fn) => (set, get, store) => {
	const newSetStateFunction: typeof set = (
		args: PlaylistsToSave, // This is actually of type UsePlaylistsActions, but we don't want to save the whole object
		replace: boolean,
	) => {
		set(args, replace);

		args.favorites &&
			setLocalStorage(localStorageKeys.favorites, args.favorites);
		args.history && setLocalStorage(localStorageKeys.history, args.history);
	};

	store.setState = newSetStateFunction;

	return fn(newSetStateFunction, get, store);
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
