import type { UsePlaylistsActions } from "./usePlaylists";
import type { CurrentPlaying } from "./useCurrentPlaying";
import type { StateCreator } from "zustand";
import type { PlayOptions } from "./usePlayOptions";

import { keys, setLocalStorage } from "@utils/localStorage";
import { areObjectKeysEqual } from "@utils/object";

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

export const setCurrentPlayingOnLocalStorage: Plugin<CurrentPlaying> =
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	(f, _name) =>
		(set, get, store) => {
			const newSetter: typeof set = (
				newCurrentPlaying: Partial<CurrentPlaying>,
				replace,
			) => {
				const previousState = get();
				const areStatesEqual = areObjectKeysEqual(
					newCurrentPlaying,
					previousState,
				);

				set(newCurrentPlaying, replace);

				if (!areStatesEqual) setLocalStorage(keys.currentPlaying, get());
			};

			store.setState = newSetter;

			return f(newSetter, get, store);
		};

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

export const setPlayOptionsOnLocalStorage: Plugin<PlayOptions> =
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	(f, _name) =>
		(set, get, store) => {
			const newSetter: typeof set = (
				newPlayOptions: Partial<PlayOptions>,
				replace,
			) => {
				const previousState = get();
				const areStatesEqual = areObjectKeysEqual(
					newPlayOptions,
					previousState,
				);

				set(newPlayOptions, replace);

				if (!areStatesEqual) setLocalStorage(keys.playOptions, get());
			};

			store.setState = newSetter;

			return f(newSetter, get, store);
		};

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

export const setPlaylistsOnLocalStorage: Plugin<UsePlaylistsActions> =
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	(f, _name) =>
		(set, get, store) => {
			const newSetter: typeof set = (
				args: ArgsToSave, // This is actually of type UsePlaylistsActions, but we don't want to save the whole object
				replace: boolean,
			) => {
				(["favorites", "history"] as const).forEach(key => {
					if (Object.hasOwn(args, key))
						// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
						setLocalStorage(keys[key], args[key]!);
				});

				set(args, replace);
			};

			store.setState = newSetter;

			return f(newSetter, get, store);
		};

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Types:

type ArgsToSave = Partial<Pick<UsePlaylistsActions, "favorites" | "history">>;

/////////////////////////////////////////

// Types from 'https://github.com/pmndrs/zustand/blob/main/docs/typescript.md'
// Not sure why they're needed, haven't thought about it much.
type PopArgument<T extends (...a: never[]) => unknown> = T extends
	(...a: [...infer A, infer _]) => infer R ? (...a: A) => R : never;

/////////////////////////////////////////

type Plugin<T extends object> = (
	f: PopArgument<StateCreator<T, [], []>>,
	name?: string,
) => PopArgument<StateCreator<T, [], []>>;
