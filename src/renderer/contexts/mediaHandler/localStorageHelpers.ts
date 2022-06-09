import type { UsePlaylistsActions } from "./usePlaylists";
import type { StateCreator, State } from "zustand";
import type { CurrentPlaying } from "./useCurrentPlaying";
import type { PlayOptions } from "./usePlayOptions";

import { keys, setLocalStorage } from "@utils/localStorage";
import { areObjectKeysEqual } from "@utils/object";

export const setCurrentPlayingLocalStorage: LoggerImpl<CurrentPlaying> =
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	(f, _name) =>
		(set, get, store) => {
			const newSet: typeof set = (
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

			store.setState = newSet;

			return f(newSet, get, store);
		};

export const setPlayOptionsLocalStorage: LoggerImpl<PlayOptions> =
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	(f, _name) =>
		(set, get, store) => {
			const newSet: typeof set = (
				newPlayOptions: Partial<PlayOptions>,
				replace,
			) => {
				const previousState = get();
				const areStatesEqual = areObjectKeysEqual(
					previousState,
					newPlayOptions,
				);

				set(newPlayOptions, replace);

				if (!areStatesEqual) setLocalStorage(keys.playOptions, get());
			};

			store.setState = newSet;

			return f(newSet, get, store);
		};

const allowedToBeSaved = Object.freeze(["favorites", "history"] as const);

export const setPlaylistsLocalStorage: LoggerImpl<UsePlaylistsActions> =
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	(f, _name) =>
		(set, get, store) => {
			const newSet: typeof set = (
				args: ArgsToSave, // This is actually of type UsePlaylistsActions, but we don't want to save the whole object
				replace: boolean,
			) => {
				allowedToBeSaved.forEach(key => {
					if (Object.prototype.hasOwnProperty.call(args, key))
						// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
						setLocalStorage(keys[key], args[key]!);
				});

				set(args, replace);
			};

			store.setState = newSet;

			return f(newSet, get, store);
		};

type ArgsToSave = Partial<
	Pick<UsePlaylistsActions, typeof allowedToBeSaved[number]>
>;

// Types from 'https://github.com/pmndrs/zustand/blob/main/docs/typescript.md'
// Not sure why they're needed, haven't thought about it much.
type PopArgument<T extends (...a: never[]) => unknown> = T extends
	(...a: [...infer A, infer _]) => infer R ? (...a: A) => R : never;

type LoggerImpl<T extends State> = (
	f: PopArgument<StateCreator<T, [], []>>,
	name?: string,
) => PopArgument<StateCreator<T, [], []>>;
