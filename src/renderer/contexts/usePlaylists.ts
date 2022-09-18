import type { DateAsNumber, Media, Path } from "@common/@types/generalTypes";

import { subscribeWithSelector } from "zustand/middleware";
import create from "zustand";

import { setPlaylistsOnLocalStorage } from "./localStorageHelpers";
import { getFromLocalStorage, keys } from "@utils/localStorage";
import { assertUnreachable, time } from "@utils/utils";
import { emptyMap, emptySet } from "@common/empty";
import { stringifyJson } from "@common/utils";
import { dbgPlaylists } from "@common/debug";
import { getSettings } from "@contexts/settings";
import { getFirstKey } from "@utils/map-set";
import {
	searchDirectoryResult,
	getAllowedMedias,
	sortByDate,
	sortByName,
} from "./usePlaylistsHelper";

const { transformPathsToMedias } = electron.media;

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Type for the main function:

export type UsePlaylistsActions = Readonly<
	{
		setPlaylists: (action: Readonly<PlaylistsReducer_Action>) => void;

		isLoadingMedias: boolean;

		sortedByDate: ReadonlySet<Path>;
		favorites: ReadonlySet<Path>;
		sortedByName: MainList;
		history: History;
	}
>;

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Main function:

export const usePlaylists = create<UsePlaylistsActions>()(
	subscribeWithSelector(setPlaylistsOnLocalStorage((set, get) => ({
		isLoadingMedias: false,

		sortedByDate: (getFromLocalStorage(keys.sortedByDate) as Set<Path>) ??
			new Set(),
		favorites: (getFromLocalStorage(keys.favorites) as Set<Path>) ?? new Set(),
		history: (getFromLocalStorage(keys.history) as History) ?? new Map(),
		sortedByName: new Map(),

		////////////////////////////////////////////////

		setPlaylists: (action: PlaylistsReducer_Action) =>
			time(() => {
				switch (action.type) {
					////////////////////////////////////////////////

					case WhatToDo.UPDATE_HISTORY: {
						time(() => {
							switch (action.whatToDo) {
								////////////////////////////////////////////////

								case PlaylistActions.ADD_ONE_MEDIA: {
									const { maxSizeOfHistory } = getSettings();
									const { history } = get();
									const { path } = action;

									const dates: DateAsNumber[] = [];

									// Add to history if there isn't one yet:
									const historyOfDates = history.get(path);
									historyOfDates === undefined ?
										dates.unshift(Date.now()) :
										dates.unshift(...historyOfDates, Date.now());

									const newHistory = new Map(history).set(path, dates);

									// history has a max size of `maxSizeOfHistory`:
									if (newHistory.size > maxSizeOfHistory) {
										// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
										const firstPath = getFirstKey(newHistory)!;
										// remove the first element:
										newHistory.delete(firstPath);
									}

									newHistory.forEach(dates => {
										if (dates.length > maxSizeOfHistory)
											dates.length = maxSizeOfHistory;
									});

									set({ history: newHistory });

									dbgPlaylists(
										"setPlaylists on 'UPDATE_HISTORY'\u279D'ADD_ONE_MEDIA'. newHistory =",
										get().history,
									);
									break;
								}

								////////////////////////////////////////////////

								case PlaylistActions.CLEAN: {
									set({ history: emptyMap });
									break;
								}

								////////////////////////////////////////////////

								default:
									assertUnreachable(action);
							}
						}, `setPlaylists on 'UPDATE_HISTORY'\u279D'${action.whatToDo}'`);
						break;
					}

					////////////////////////////////////////////////

					case WhatToDo.UPDATE_FAVORITES: {
						time(() => {
							switch (action.whatToDo) {
								case PlaylistActions.TOGGLE_ONE_MEDIA: {
									////////////////////////////////////////////////

									const newFavorites = new Set(get().favorites);

									// map.delete() returns true if an element in the Map
									// object existed and has been removed, or false if
									// the element does not exist.
									if (!newFavorites.delete(action.path))
										newFavorites.add(action.path);

									set({ favorites: newFavorites });

									dbgPlaylists(
										"setPlaylists on 'UPDATE_FAVORITES'\u279D'TOGGLE_ONE_MEDIA'. new favorites =",
										get().favorites,
									);
									break;
								}

								////////////////////////////////////////////////

								case PlaylistActions.ADD_ONE_MEDIA: {
									const newFavorites = new Set(get().favorites).add(
										action.path,
									);

									set({ favorites: newFavorites });

									dbgPlaylists(
										"setPlaylists on 'UPDATE_FAVORITES'\u279D'ADD_ONE_MEDIA'. new favorites =",
										get().favorites,
									);
									break;
								}

								////////////////////////////////////////////////

								case PlaylistActions.REMOVE_ONE_MEDIA_BY_PATH: {
									const { favorites } = get();

									if (!favorites.has(action.path)) {
										console.error("Media not found in favorites");
										break;
									}

									const newFavorites = new Set(favorites);
									newFavorites.delete(action.path);

									set({ favorites: newFavorites });

									dbgPlaylists(
										"setPlaylists on 'UPDATE_FAVORITES'\u279D'REMOVE_ONE_MEDIA'. new favorites =",
										get().favorites,
									);
									break;
								}

								////////////////////////////////////////////////

								case PlaylistActions.CLEAN: {
									set({ favorites: emptySet });
									break;
								}

								////////////////////////////////////////////////

								default:
									assertUnreachable(action);
							}
						}, `setPlaylists on 'UPDATE_FAVORITES'\u279D'${action.whatToDo}'`);
						break;
					}

					////////////////////////////////////////////////

					case WhatToDo.UPDATE_MAIN_LIST: {
						time(() => {
							////////////////////////////////////////////////

							const updateAndSortSortedAndMainLists = (
								newMainList: MainList,
							): void =>
								set({
									sortedByDate: sortByDate(newMainList),
									sortedByName: sortByName(newMainList),
								});

							////////////////////////////////////////////////

							switch (action.whatToDo) {
								////////////////////////////////////////////////

								case PlaylistActions.ADD_ONE_MEDIA: {
									const mainList = get().sortedByName;

									if (!mainList.has(action.path)) {
										console.warn(
											`A media with path "${action.path}" already exists. Therefore, I'm not gonna add it. If you want to update it, call this function with type = PlaylistActions.REFRESH_ONE_MEDIA_BY_PATH`,
										);
										break;
									}

									const newMainList = new Map(mainList);

									updateAndSortSortedAndMainLists(
										newMainList.set(action.path, action.newMedia),
									);

									dbgPlaylists(
										"setPlaylists on 'UPDATE_MEDIA_LIST'\u279D'ADD_ONE_MEDIA' (yet to be sorted). newMainList =",
										get().sortedByName,
									);
									break;
								}

								////////////////////////////////////////////////

								case PlaylistActions.REMOVE_ONE_MEDIA_BY_PATH: {
									const {
										sortedByName: mainList,
										sortedByDate,
										favorites,
										history,
									} = get();

									const newSortedByDate = new Set(sortedByDate);
									const newFavorites = new Set(favorites);
									const newMainList = new Map(mainList);
									const newHistory = new Map(history);

									if (!newMainList.delete(action.path)) {
										console.error(
											`A media with path "${action.path}" does not exist at sortedByName.`,
										);
										break;
									}
									if (!newSortedByDate.delete(action.path)) {
										console.error(
											`A media with path "${action.path}" does not exist at newSortedByDate.`,
										);
										break;
									}

									set({
										sortedByDate: newSortedByDate,
										sortedByName: newMainList,
									});

									// If the media is in the favorites, remove it from the favorites
									if (newFavorites.delete(action.path))
										set({ favorites: newFavorites });

									// If the media is in the history, remove it from the history
									if (newHistory.delete(action.path))
										set({ history: newHistory });

									dbgPlaylists(
										"setPlaylists on 'UPDATE_MEDIA_LIST'\u279D'REMOVE_ONE_MEDIA_BY_PATH' (yet to be sorted). newMainList =",
										get().sortedByName,
									);
									break;
								}

								////////////////////////////////////////////////

								case PlaylistActions.REPLACE_ENTIRE_LIST: {
									const { favorites, history } = get();

									const newFavorites = new Set(favorites);
									const newHistory = new Map(history);

									// If the media in the favorites list is not on
									// action.list, remove it from the favorites:
									favorites.forEach(path => {
										if (!action.list.has(path))
											newFavorites.delete(path);
									});

									if (favorites.size !== newFavorites.size)
										set({ favorites: newFavorites });

									// If the media in the history list is not on
									// action.list, remove it from the favorites:
									history.forEach((_, path) => {
										if (!action.list.has(path))
											newHistory.delete(path);
									});

									if (history.size !== newHistory.size)
										set({ history: newHistory });

									updateAndSortSortedAndMainLists(action.list);

									dbgPlaylists(
										"setPlaylists on 'UPDATE_MEDIA_LIST'\u279D'REPLACE_ENTIRE_LIST' (yet to be sorted). action.list =",
										action.list,
									);
									break;
								}

								////////////////////////////////////////////////

								case PlaylistActions.REFRESH_ONE_MEDIA_BY_PATH: {
									const { newMedia, path, newPath } = action;

									const mainList = get().sortedByName;
									const oldMedia = mainList.get(path);

									if (oldMedia === undefined) {
										console.error(
											`I did not find a media with path = "${action.path}" when calling 'REFRESH_ONE_MEDIA_BY_PATH'!`,
										);
										break;
									}

									const newMainList = new Map(mainList);

									if (newPath.length > 0) {
										newMainList.delete(path);
										newMainList.set(newPath, newMedia);

										// Only sort if the their titles are different:
										if (newMedia.title !== oldMedia.title)
											updateAndSortSortedAndMainLists(newMainList);
										// Else, just update the media in the main list,
										// cause the title is the same, so no need to sort:
										else
											set({ sortedByName: newMainList });
									} ////////////////////////////////////////////////
									else if (newMedia.title !== oldMedia.title)
										updateAndSortSortedAndMainLists(
											newMainList.set(path, newMedia),
										);
									////////////////////////////////////////////////
									else
										set({ sortedByName: newMainList.set(path, newMedia) });

									dbgPlaylists(
										"playlistsReducer on 'UPDATE_MEDIA_LIST'\u279D'REFRESH_ONE_MEDIA_BY_ID'. newMedia =",
										get().sortedByName.get(newPath.length > 0 ? newPath : path),
										"\nnewMainList =",
										get().sortedByName,
									);
									break;
								}

								////////////////////////////////////////////////

								case PlaylistActions.CLEAN: {
									set({
										sortedByDate: emptySet,
										sortedByName: emptyMap,
										favorites: emptySet,
										history: emptyMap,
									});

									dbgPlaylists(
										"playlistsReducer on 'UPDATE_MEDIA_LIST'\u279D'CLEAN' (yet to be sorted). newMainList =",
										get().sortedByName,
									);
									break;
								}

								////////////////////////////////////////////////

								default:
									assertUnreachable(action);
							}
						}, `playlistsReducer on 'UPDATE_MEDIA_LIST'\u279D'${action.type}'`);
						break;
					}

					////////////////////////////////////////////////

					default:
						assertUnreachable(action);
				}
			}, "setPlaylists with: " + stringifyJson(action)),
	}))),
);

///////////////////////////////////////////////////
///////////////////////////////////////////////////
///////////////////////////////////////////////////
// Enums:

export enum PlaylistList {
	SORTED_BY_DATE = "sortedByDate",
	MAIN_LIST = "sortedByName",
	FAVORITES = "favorites",
	HISTORY = "history",
}

///////////////////////////////////////////////////

export enum PlaylistActions {
	REFRESH_ONE_MEDIA_BY_PATH = "REFRESH_ONE_MEDIA_BY_PATH",
	REMOVE_ONE_MEDIA_BY_PATH = "REMOVE_ONE_MEDIA_BY_PATH",
	REPLACE_ENTIRE_LIST = "REPLACE_ENTIRE_LIST",
	TOGGLE_ONE_MEDIA = "TOGGLE_ONE_MEDIA",
	ADD_ONE_MEDIA = "ADD_ONE_MEDIA",
	CLEAN = "CLEAN",
}

///////////////////////////////////////////////////

export enum WhatToDo {
	UPDATE_MAIN_LIST = "UPDATE_MAIN_LIST",
	UPDATE_FAVORITES = "UPDATE_FAVORITES",
	UPDATE_HISTORY = "UPDATE_HISTORY",
}

///////////////////////////////////////////////////
///////////////////////////////////////////////////
///////////////////////////////////////////////////
// Helper funtions:

const { getState } = usePlaylists;
export const getSortedByDate = () => getState().sortedByDate;
export const getMainList = () => getState().sortedByName;
export const getFavorites = () => getState().favorites;
export const getHistory = () => getState().history;
export const { setPlaylists } = getState();

///////////////////////////////////////////////////

export function getPlaylist(
	list: Readonly<PlaylistList>,
): ReadonlySet<Path> | MainList | History {
	switch (list) {
		case PlaylistList.MAIN_LIST:
			return getMainList();

		case PlaylistList.HISTORY:
			return getHistory();

		case PlaylistList.FAVORITES:
			return getFavorites();

		case PlaylistList.SORTED_BY_DATE:
			return getSortedByDate();

		default:
			assertUnreachable(list);
	}
}

///////////////////////////////////////////////////

export const cleanHistory = () =>
	setPlaylists({
		whatToDo: PlaylistActions.CLEAN,
		type: WhatToDo.UPDATE_HISTORY,
	});

///////////////////////////////////////////////////

export const cleanFavorites = () =>
	setPlaylists({
		whatToDo: PlaylistActions.CLEAN,
		type: WhatToDo.UPDATE_FAVORITES,
	});

///////////////////////////////////////////////////

export async function searchLocalComputerForMedias(): Promise<void> {
	try {
		usePlaylists.setState({ isLoadingMedias: true });

		const paths = getAllowedMedias(await searchDirectoryResult());

		const {
			assureMediaSizeIsGreaterThan60KB,
			ignoreMediaWithLessThan60Seconds,
		} = getSettings();

		const newMainList: MainList = new Map(
			await transformPathsToMedias(
				paths,
				assureMediaSizeIsGreaterThan60KB,
				ignoreMediaWithLessThan60Seconds,
			),
		);

		dbgPlaylists(
			"Finished searching, paths =",
			paths,
			"Finished searching, newMainList =",
			newMainList,
		);

		setPlaylists({
			whatToDo: PlaylistActions.REPLACE_ENTIRE_LIST,
			type: WhatToDo.UPDATE_MAIN_LIST,
			list: newMainList,
		});
	} catch (error) {
		console.error(error);
	} finally {
		usePlaylists.setState({ isLoadingMedias: false });
	}
}

///////////////////////////////////////////////////

const diacriticRegex = /\p{Diacritic}/gu;

/** normalize()ing to NFD Unicode normal form decomposes
 * combined graphemes into the combination of simple ones.
 * The è of Crème ends up expressed as e +  ̀.
 * It is now trivial to globally get rid of the diacritics,
 * which the Unicode standard conveniently groups as the
 * Combining Diacritical Marks Unicode block.
 */
export const unDiacritic = (str: string): string =>
	str.toLocaleLowerCase().normalize("NFD").replaceAll(diacriticRegex, "");

export function searchMedia(highlight: string): [Path, Media][] {
	return time(() => {
		const medias: [Path, Media][] = [];

		getMainList().forEach((media, path) =>
			unDiacritic(media.title).includes(highlight) && medias.push([path, media])
		);

		return medias;
	}, `searchMedia('${highlight}')`);
}

///////////////////////////////////////////////////
///////////////////////////////////////////////////
///////////////////////////////////////////////////
// Types:

export type History = ReadonlyMap<Path, DateAsNumber[]>;

export type MainList = ReadonlyMap<Path, Media>;

export type PlaylistsReducer_Action = Readonly<
	// ----------------------------------------
	// ----------------------------------------
	// ---------------------------------------- Favorites:
	| { type: WhatToDo.UPDATE_FAVORITES; whatToDo: PlaylistActions.CLEAN; }
	| {
		whatToDo: PlaylistActions.ADD_ONE_MEDIA;
		type: WhatToDo.UPDATE_FAVORITES;
		path: Path;
	}
	| {
		whatToDo: PlaylistActions.TOGGLE_ONE_MEDIA;
		type: WhatToDo.UPDATE_FAVORITES;
		path: Path;
	}
	| {
		whatToDo: PlaylistActions.REMOVE_ONE_MEDIA_BY_PATH;
		type: WhatToDo.UPDATE_FAVORITES;
		path: Path;
	}
	// ----------------------------------------
	// ----------------------------------------
	// ---------------------------------------- History:
	| { type: WhatToDo.UPDATE_HISTORY; whatToDo: PlaylistActions.CLEAN; }
	| {
		whatToDo: PlaylistActions.ADD_ONE_MEDIA;
		type: WhatToDo.UPDATE_HISTORY;
		path: Path;
	}
	// ----------------------------------------
	// ----------------------------------------
	// ---------------------------------------- MainList:
	| { type: WhatToDo.UPDATE_MAIN_LIST; whatToDo: PlaylistActions.CLEAN; }
	| {
		whatToDo:
			| PlaylistActions.REFRESH_ONE_MEDIA_BY_PATH
			| PlaylistActions.ADD_ONE_MEDIA;
		type: WhatToDo.UPDATE_MAIN_LIST;
		newMedia: Media;
		newPath: Path;
		path: Path;
	}
	| {
		whatToDo: PlaylistActions.REMOVE_ONE_MEDIA_BY_PATH;
		type: WhatToDo.UPDATE_MAIN_LIST;
		path: Path;
	}
	| {
		whatToDo: PlaylistActions.REPLACE_ENTIRE_LIST;
		type: WhatToDo.UPDATE_MAIN_LIST;
		list: MainList;
	}
>;
