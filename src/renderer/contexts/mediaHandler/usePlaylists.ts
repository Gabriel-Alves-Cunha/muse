import type {
	DateAsNumber,
	Media,
	Mutable,
	Path,
} from "@common/@types/generalTypes";

import { subscribeWithSelector } from "zustand/middleware";
import create from "zustand";

import { emptyMap, emptySet, getFirstKey } from "@utils/map-set";
import { getFromLocalStorage, keys } from "@utils/localStorage";
import { setPlaylistsLocalStorage } from "./localStorageHelpers";
import { assertUnreachable, time } from "@utils/utils";
import { dbgPlaylists } from "@common/utils";
import { getSettings } from "@contexts/settings";
import {
	searchDirectoryResult,
	getAllowedMedias,
	sortByDate,
	sortByName,
} from "./usePlaylistsHelper";

const { transformPathsToMedias } = electron.media;

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

export const usePlaylists = create<UsePlaylistsActions>()(
	subscribeWithSelector(
		setPlaylistsLocalStorage((set, get) => ({
			isLoadingMedias: false,

			sortedByDate: (getFromLocalStorage(keys.sortedByDate) as Set<Path>) ??
				new Set(),
			favorites: (getFromLocalStorage(keys.favorites) as Set<Path>) ??
				new Set(),
			history: (getFromLocalStorage(keys.history) as History) ?? new Map(),
			sortedByName: new Map(),

			setPlaylists: (action: PlaylistsReducer_Action) => {
				time(() => {
					switch (
						action.type
					) {
						case WhatToDo.UPDATE_HISTORY: {
							time(() => {
								switch (action.whatToDo) {
									case PlaylistActions.ADD_ONE_MEDIA: {
										const { history } = get();
										const { path } = action;

										const dates: DateAsNumber[] = [];

										// Add to history if there isn't one yet:
										const historyOfDates = history.get(path);
										if (!historyOfDates)
											dates.push(Date.now());
										else
											dates.push(...historyOfDates, Date.now());

										const newHistory = new Map(history).set(path, dates);

										// history has a max size of maxSizeOfHistory:
										if (newHistory.size > getSettings().maxSizeOfHistory) {
											// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
											const firstPath = getFirstKey(newHistory)!;
											// remove the first element:
											newHistory.delete(firstPath);
										}

										set({ history: newHistory });

										dbgPlaylists(
											"setPlaylists on 'UPDATE_HISTORY'\u279D'ADD_ONE_MEDIA'. newHistory =",
											get().history,
										);
										break;
									}

									case PlaylistActions.CLEAN: {
										set({ history: emptyMap });
										break;
									}

									default:
										assertUnreachable(action);
										break;
								}
							}, `setPlaylists on 'UPDATE_HISTORY'\u279D'${action.whatToDo}'`);
							break;
						}

						case WhatToDo.UPDATE_FAVORITES: {
							time(
								() => {
									switch (action.whatToDo) {
										case PlaylistActions.TOGGLE_ONE_MEDIA: {
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

										case PlaylistActions.REMOVE_ONE_MEDIA_BY_PATH: {
											const { favorites } = get();

											if (favorites.has(action.path)) {
												const newFavorites = new Set(favorites);
												newFavorites.delete(action.path);

												set({ favorites: newFavorites });
											} else
												console.error("Media not found in favorites");

											dbgPlaylists(
												"setPlaylists on 'UPDATE_FAVORITES'\u279D'REMOVE_ONE_MEDIA'. new favorites =",
												get().favorites,
											);
											break;
										}

										case PlaylistActions.CLEAN: {
											set({ favorites: emptySet });
											break;
										}

										default:
											assertUnreachable(action);
											break;
									}
								},
								`setPlaylists on 'UPDATE_FAVORITES'\u279D'${action.whatToDo}'`,
							);
							break;
						}

						case WhatToDo.UPDATE_MAIN_LIST: {
							time(
								() => {
									const updateAndSortSortedAndMainLists = (
										newMainList: MainList,
									) =>
										set({
											sortedByDate: sortByDate(newMainList),
											sortedByName: sortByName(newMainList),
										});

									switch (action.whatToDo) {
										case PlaylistActions.ADD_ONE_MEDIA: {
											const mainList = get().sortedByName;

											if (mainList.has(action.path)) {
												console.error(
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

										case PlaylistActions.REPLACE_ENTIRE_LIST: {
											const { favorites, history } = get();

											const newFavorites = new Set(favorites);
											const newHistory = new Map(history);

											// If the media in the favorites list is not on
											// action.list, remove it from the favorites:
											favorites.forEach(path =>
												!action.list.has(path) && newFavorites.delete(path)
											);
											if (favorites.size !== newFavorites.size)
												set({ favorites: newFavorites });

											// If the media in the history list is not on
											// action.list, remove it from the favorites:
											history.forEach((_, path) =>
												!action.list.has(path) && newHistory.delete(path)
											);
											if (history.size !== newHistory.size)
												set({ history: newHistory });

											updateAndSortSortedAndMainLists(action.list);

											dbgPlaylists(
												"setPlaylists on 'UPDATE_MEDIA_LIST'\u279D'REPLACE_ENTIRE_LIST' (yet to be sorted). action.list =",
												action.list,
											);
											break;
										}

										case PlaylistActions.REFRESH_ONE_MEDIA_BY_PATH: {
											const { newMedia, path, newPath } = action;

											const mainList = get().sortedByName;
											const oldMedia = mainList.get(path);

											if (!oldMedia) {
												console.error(
													`I did not find a media with path = "${action.path}" when calling 'REFRESH_ONE_MEDIA_BY_PATH'!`,
												);
												break;
											}

											const newMainList = new Map(mainList);

											if (newPath) {
												newMainList.delete(path);
												newMainList.set(newPath, newMedia);

												// Only sort if the their titles are different:
												if (newMedia.title !== oldMedia.title)
													updateAndSortSortedAndMainLists(newMainList);
												/* Else, just update the media in the main list,
										 * cause the title is the same, so no need to sort:
										 */ else
													set({ sortedByName: newMainList });
											} else if (newMedia.title !== oldMedia.title)
												updateAndSortSortedAndMainLists(
													newMainList.set(path, newMedia),
												);
											else
												set({ sortedByName: newMainList.set(path, newMedia) });

											dbgPlaylists(
												"playlistsReducer on 'UPDATE_MEDIA_LIST'\u279D'REFRESH_ONE_MEDIA_BY_ID'. newMedia =",
												get().sortedByName.get(newPath ? newPath : path),
												"\nnewMainList =",
												get().sortedByName,
											);
											break;
										}

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

										default:
											assertUnreachable(action);
											break;
									}
								},
								`playlistsReducer on 'UPDATE_MEDIA_LIST'\u279D'${action.type}'`,
							);
							break;
						}

						default:
							assertUnreachable(action);
							break;
					}
				}, "setPlaylists " + JSON.stringify(action, null, 2));
			},
		})),
	),
);

///////////////////////////////////////////////////
///////////////////////////////////////////////////
///////////////////////////////////////////////////

const { getState } = usePlaylists;
export const sortedByDate = () => getState().sortedByDate;
export const mainList = () => getState().sortedByName;
export const favorites = () => getState().favorites;
export const history = () => getState().history;
export const { setPlaylists } = getState();

///////////////////////////////////////////////////
///////////////////////////////////////////////////
///////////////////////////////////////////////////

export let allSelectedMedias: readonly Path[] = [];

if (!import.meta.vitest)
	usePlaylists.subscribe(
		({ sortedByName }) => sortedByName,
		function updateAllSelectedMedias() {
			time(() =>
			{
				allSelectedMedias = Array
					.from(getState().sortedByName)
					.filter(([, { isSelected }]) => isSelected)
					.map(([path]) => path);
			}, "updateAllSelectedMedias");
		},
	);

///////////////////////////////////////////////////
///////////////////////////////////////////////////
///////////////////////////////////////////////////

export function toggleSelectedMedia(media: Media, mediaPath: Path): void {
	time(
		() =>
			allSelectedMedias.includes(mediaPath) ?
				removeFromAllSelectedMedias(media, mediaPath) :
				addToAllSelectedMedias(media, mediaPath),
		"toggleSelectedMedia",
	);
}

export function addToAllSelectedMedias(newMedia: Media, mediaPath: Path): void {
	time(
		() =>
			setPlaylists({
				whatToDo: PlaylistActions.REFRESH_ONE_MEDIA_BY_PATH,
				newMedia: { ...newMedia, isSelected: true },
				type: WhatToDo.UPDATE_MAIN_LIST,
				path: mediaPath,
			}),
		"addToAllSelectedMedias",
	);
}

export function removeFromAllSelectedMedias(
	newMedia: Media,
	mediaPath: Path,
): void {
	time(
		() =>
			setPlaylists({
				whatToDo: PlaylistActions.REFRESH_ONE_MEDIA_BY_PATH,
				newMedia: { ...newMedia, isSelected: false },
				type: WhatToDo.UPDATE_MAIN_LIST,
				path: mediaPath,
			}),
		"removeFromAllSelectedMedias",
	);
}

export function deselectAllMedias() {
	time(() => {
		if (allSelectedMedias.length === 0) return;

		const newMediasList = mainList() as Map<Path, Mutable<Media>>;

		newMediasList.forEach((media, path) =>
			newMediasList.set(path, { ...media, isSelected: false })
		);

		setPlaylists({
			whatToDo: PlaylistActions.REPLACE_ENTIRE_LIST,
			type: WhatToDo.UPDATE_MAIN_LIST,
			list: newMediasList,
		});
	}, "deselectAllMedias");
}

export function selectAllMedias() {
	time(() => {
		const newMediasList = mainList() as Map<Path, Mutable<Media>>;

		if (allSelectedMedias.length === newMediasList.size) return;

		newMediasList.forEach((media, path) =>
			newMediasList.set(path, { ...media, isSelected: true })
		);

		setPlaylists({
			whatToDo: PlaylistActions.REPLACE_ENTIRE_LIST,
			type: WhatToDo.UPDATE_MAIN_LIST,
			list: newMediasList,
		});
	}, "selectAllMedias");
}

///////////////////////////////////////////////////
///////////////////////////////////////////////////
///////////////////////////////////////////////////

export enum PlaylistList {
	SORTED_BY_DATE = "sortedByDate",
	MAIN_LIST = "sortedByName",
	FAVORITES = "favorites",
	HISTORY = "history",
}

export function getPlaylist(
	list: Readonly<PlaylistList>,
): ReadonlySet<string> | MainList | History {
	switch (list) {
		case PlaylistList.MAIN_LIST:
			return mainList();

		case PlaylistList.HISTORY:
			return history();

		case PlaylistList.FAVORITES:
			return favorites();

		case PlaylistList.SORTED_BY_DATE:
			return sortedByDate();

		default:
			return assertUnreachable(list);
	}
}

export const cleanHistory = () =>
	setPlaylists({
		whatToDo: PlaylistActions.CLEAN,
		type: WhatToDo.UPDATE_HISTORY,
	});

export const cleanFavorites = () =>
	setPlaylists({
		whatToDo: PlaylistActions.CLEAN,
		type: WhatToDo.UPDATE_FAVORITES,
	});

export async function searchLocalComputerForMedias() {
	time(async () => {
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
	}, "searchLocalComputerForMedias");
}

export function searchMedia(searchTerm_: Readonly<string>): [Path, Media][] {
	return time(() => {
		const searchTerm = searchTerm_.toLowerCase();
		const medias: [Path, Media][] = [];

		mainList().forEach((media, path) =>
		{
			if (media.title.toLowerCase().includes(searchTerm))
				medias.push([path, media]);
		});

		return medias;
	}, `searchMedia(${searchTerm_})`);
}

///////////////////////////////////////////////////
///////////////////////////////////////////////////
///////////////////////////////////////////////////

export type History = ReadonlyMap<Path, DateAsNumber[]>;
export type MainList = ReadonlyMap<Path, Media>;

export type PlaylistsReducer_Action =
	// ---------------------------------------- favorites:
	| Readonly<
		{
			whatToDo: PlaylistActions.ADD_ONE_MEDIA;
			type: WhatToDo.UPDATE_FAVORITES;
			path: Path;
		}
	>
	| Readonly<
		{
			whatToDo: PlaylistActions.TOGGLE_ONE_MEDIA;
			type: WhatToDo.UPDATE_FAVORITES;
			path: Path;
		}
	>
	| Readonly<
		{
			whatToDo: PlaylistActions.REMOVE_ONE_MEDIA_BY_PATH;
			type: WhatToDo.UPDATE_FAVORITES;
			path: Path;
		}
	>
	| Readonly<
		{ type: WhatToDo.UPDATE_FAVORITES; whatToDo: PlaylistActions.CLEAN; }
	>
	// ---------------------------------------- history:
	| Readonly<
		{
			whatToDo: PlaylistActions.ADD_ONE_MEDIA;
			type: WhatToDo.UPDATE_HISTORY;
			path: Path;
		}
	>
	| Readonly<
		{ type: WhatToDo.UPDATE_HISTORY; whatToDo: PlaylistActions.CLEAN; }
	>
	// ---------------------------------------- main list:
	| Readonly<
		{
			whatToDo:
				| PlaylistActions.REFRESH_ONE_MEDIA_BY_PATH
				| PlaylistActions.ADD_ONE_MEDIA;
			type: WhatToDo.UPDATE_MAIN_LIST;
			newMedia: Media;
			newPath?: Path;
			path: Path;
		}
	>
	| Readonly<
		{
			whatToDo: PlaylistActions.REMOVE_ONE_MEDIA_BY_PATH;
			type: WhatToDo.UPDATE_MAIN_LIST;
			path: Path;
		}
	>
	| Readonly<
		{
			whatToDo: PlaylistActions.REPLACE_ENTIRE_LIST;
			type: WhatToDo.UPDATE_MAIN_LIST;
			list: MainList;
		}
	>
	| Readonly<
		{ type: WhatToDo.UPDATE_MAIN_LIST; whatToDo: PlaylistActions.CLEAN; }
	>;

export enum PlaylistActions {
	REFRESH_ONE_MEDIA_BY_PATH = "REFRESH_ONE_MEDIA_BY_PATH",
	REMOVE_ONE_MEDIA_BY_PATH = "REMOVE_ONE_MEDIA_BY_PATH",
	REPLACE_ENTIRE_LIST = "REPLACE_ENTIRE_LIST",
	TOGGLE_ONE_MEDIA = "TOGGLE_ONE_MEDIA",
	ADD_ONE_MEDIA = "ADD_ONE_MEDIA",
	CLEAN = "CLEAN",
}

export enum WhatToDo {
	UPDATE_MAIN_LIST = "UPDATE_MAIN_LIST",
	UPDATE_FAVORITES = "UPDATE_FAVORITES",
	UPDATE_HISTORY = "UPDATE_HISTORY",
}
