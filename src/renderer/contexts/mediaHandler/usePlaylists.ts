import type { Media, Path } from "@common/@types/generalTypes";

import create from "zustand";

import { getFromLocalStorage, keys } from "@utils/localStorage";
import { setPlaylistsLocalStorage } from "./localStorageHelpers";
import { assertUnreachable, time } from "@utils/utils";
import { dbgPlaylists } from "@common/utils";
import {
	searchDirectoryResult,
	getAllowedMedias,
	sortByDate,
	sortByName,
} from "./usePlaylistsHelper";

const {
	media: { transformPathsToMedias },
	fs: { deleteFile },
} = electron;

const emptyArray: never[] = [];
const maxSizeOfHistory = 100;

export type UsePlaylistsActions = Readonly<{
	setPlaylists: (action: Readonly<PlaylistsReducer_Action>) => void;

	isLoadingMedias: boolean;

	history: readonly Path[];
	sortedByDate: Set<Path>;
	sortedByName: MainList;
	favorites: Set<Path>;
}>;

export const usePlaylists = create<UsePlaylistsActions>()(
	setPlaylistsLocalStorage((set, get) => ({
		isLoadingMedias: false,

		sortedByDate:
			(getFromLocalStorage(keys.sortedByDate) as Set<Path>) ?? new Set(),
		favorites: (getFromLocalStorage(keys.favorites) as Set<Path>) ?? new Set(),
		history: (getFromLocalStorage(keys.history) as Path[]) ?? [],
		sortedByName: new Map(),

		setPlaylists: (action: PlaylistsReducer_Action) => {
			time(() => {
				switch (action.type) {
					case WhatToDo.UPDATE_HISTORY: {
						switch (action.whatToDo) {
							case PlaylistActions.ADD_ONE_MEDIA: {
								const newHistory = [...get().history];

								// If the new media is the same as the last
								// one in the list, don't add it again:
								if (action.path === newHistory.at(-1)) break;

								// add newMedia to the end of array:
								newHistory.push(action.path);

								// history has a max size of maxSizeOfHistory:
								if (newHistory.length > maxSizeOfHistory)
									// remove the first element:
									newHistory.splice(1, 1);

								set({ history: newHistory });

								dbgPlaylists(
									"setPlaylists on 'UPDATE_HISTORY'\u279D'ADD_ONE_MEDIA'. newHistory =",
									get().history,
								);
								break;
							}

							case PlaylistActions.CLEAN:
								set({ history: emptyArray });
								break;

							default:
								assertUnreachable(action);
								break;
						}
						break;
					}

					case WhatToDo.UPDATE_FAVORITES: {
						switch (action.whatToDo) {
							case PlaylistActions.TOGGLE_ONE_MEDIA: {
								const { favorites } = get();

								// map.delete() returns true if an element in the Map
								// object existed and has been removed, or false if
								// the element does not exist.
								if (!favorites.delete(action.path)) favorites.add(action.path);

								set({ favorites });

								dbgPlaylists(
									"setPlaylists on 'UPDATE_FAVORITES'\u279D'TOGGLE_ONE_MEDIA'. new favorites =",
									get().favorites,
								);
								break;
							}

							case PlaylistActions.ADD_ONE_MEDIA: {
								set({ favorites: get().favorites.add(action.path) });

								dbgPlaylists(
									"setPlaylists on 'UPDATE_FAVORITES'\u279D'ADD_ONE_MEDIA'. new favorites =",
									get().favorites,
								);
								break;
							}

							case PlaylistActions.REMOVE_ONE_MEDIA_BY_PATH: {
								const { favorites } = get();

								favorites.delete(action.path)
									? set({ favorites })
									: console.error("Media not found in favorites");

								dbgPlaylists(
									"setPlaylists on 'UPDATE_FAVORITES'\u279D'REMOVE_ONE_MEDIA'. new favorites =",
									get().favorites,
								);
								break;
							}

							case PlaylistActions.CLEAN: {
								const { favorites } = get();
								favorites.clear();

								set({ favorites });
								break;
							}

							default:
								assertUnreachable(action);
								break;
						}
						break;
					}

					case WhatToDo.UPDATE_MAIN_LIST: {
						const updateAndSortSortedAndMainLists = (newMainList: MainList) =>
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

								updateAndSortSortedAndMainLists(
									mainList.set(action.path, action.newMedia),
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

								if (!mainList.delete(action.path)) {
									console.error(
										`A media with path "${action.path}" does not exist at sortedByName.`,
									);
									break;
								}
								if (!sortedByDate.delete(action.path)) {
									console.error(
										`A media with path "${action.path}" does not exist at sortedByDate.`,
									);
									break;
								}

								set({
									sortedByName: mainList,
									sortedByDate,
								});

								// If the media is in the favorites, remove it from the favorites
								if (favorites.delete(action.path)) set({ favorites });

								// If the media is in the history, remove it from the history
								const newHistory = history.filter(path => path !== action.path);
								if (newHistory.length !== history.length)
									set({ history: newHistory });

								dbgPlaylists(
									"setPlaylists on 'UPDATE_MEDIA_LIST'\u279D'REMOVE_ONE_MEDIA_BY_PATH' (yet to be sorted). newMainList =",
									get().sortedByName,
								);
								break;
							}

							case PlaylistActions.REPLACE_ENTIRE_LIST: {
								const { favorites, history } = get();

								// If the media in the favorites list is not on
								// action.list, remove it from the favorites:
								const previousFavoritesSize = favorites.size;
								favorites.forEach(
									path => !action.list.has(path) && favorites.delete(path),
								);
								if (favorites.size !== previousFavoritesSize)
									set({ favorites });

								// If the media in the history list is not on
								// action.list, remove it from the favorites:
								const newHistory = history.filter(path =>
									action.list.has(path),
								);
								if (newHistory.length !== history.length)
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

								if (newPath) {
									mainList.delete(path);
									mainList.set(newPath, newMedia);

									// Only sort if the their titles are different:
									if (newMedia.title !== oldMedia.title)
										updateAndSortSortedAndMainLists(mainList);
									/* Else, just update the media in the main list,
									 * cause the title is the same, so no need to sort:
									 */ else set({ sortedByName: mainList });
								} else if (newMedia.title !== oldMedia.title)
									updateAndSortSortedAndMainLists(mainList.set(path, newMedia));
								else set({ sortedByName: mainList.set(path, newMedia) });

								dbgPlaylists(
									"playlistsReducer on 'UPDATE_MEDIA_LIST'\u279D'REFRESH_ONE_MEDIA_BY_ID'. newMedia =",
									get().sortedByName.get(newPath ? newPath : path),
									"\nnewMainList =",
									get().sortedByName,
								);
								break;
							}

							case PlaylistActions.CLEAN: {
								const { favorites, sortedByDate, sortedByName } = get();

								sortedByDate.clear();
								sortedByName.clear();
								favorites.clear();

								set({
									history: emptyArray,
									sortedByDate,
									sortedByName,
									favorites,
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
						break;
					}

					default:
						assertUnreachable(action);
						break;
				}
			}, "setPlaylists " + JSON.stringify(action, null, 2));
		},
	})),
);

///////////////////////////////////////////////////
///////////////////////////////////////////////////
///////////////////////////////////////////////////

const { getState: getPlaylists } = usePlaylists;
export const sortedByDate = () => getPlaylists().sortedByDate;
export const mainList = () => getPlaylists().sortedByName;
export const favorites = () => getPlaylists().favorites;
export const history = () => getPlaylists().history;
export const { setPlaylists } = getPlaylists();

export enum PlaylistList {
	SORTED_BY_DATE,
	MAIN_LIST,
	FAVORITES,
	HISTORY,
}

export const getPlaylist = (list: Readonly<PlaylistList>) => {
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
};

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
	usePlaylists.setState({ isLoadingMedias: true });

	time(async () => {
		try {
			const paths = getAllowedMedias(await searchDirectoryResult());
			const newMainList: MainList = new Map(
				await transformPathsToMedias(paths),
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

		mainList().forEach(
			(media, path) =>
				media.title.toLowerCase().includes(searchTerm) &&
				medias.push([path, media]),
		);

		return medias;
	}, "searchMedia");
}

export async function deleteMedia(path: Path) {
	setPlaylists({
		whatToDo: PlaylistActions.REMOVE_ONE_MEDIA_BY_PATH,
		type: WhatToDo.UPDATE_MAIN_LIST,
		path,
	});

	await deleteFile(path);
}

///////////////////////////////////////////////////
///////////////////////////////////////////////////
///////////////////////////////////////////////////

export type MainList = Map<Path, Media>;
export type Playlist = Array<Path>;

export type PlaylistsReducer_Action =
	// ---------------------------------------- favorites:
	| Readonly<{
			whatToDo: PlaylistActions.ADD_ONE_MEDIA;
			type: WhatToDo.UPDATE_FAVORITES;
			path: Path;
	  }>
	| Readonly<{
			whatToDo: PlaylistActions.TOGGLE_ONE_MEDIA;
			type: WhatToDo.UPDATE_FAVORITES;
			path: Path;
	  }>
	| Readonly<{
			whatToDo: PlaylistActions.REMOVE_ONE_MEDIA_BY_PATH;
			type: WhatToDo.UPDATE_FAVORITES;
			path: Path;
	  }>
	| Readonly<{
			type: WhatToDo.UPDATE_FAVORITES;
			whatToDo: PlaylistActions.CLEAN;
	  }>
	// ---------------------------------------- history:
	| Readonly<{
			whatToDo: PlaylistActions.ADD_ONE_MEDIA;
			type: WhatToDo.UPDATE_HISTORY;
			path: Path;
	  }>
	| Readonly<{
			type: WhatToDo.UPDATE_HISTORY;
			whatToDo: PlaylistActions.CLEAN;
	  }>
	// ---------------------------------------- main list:
	| Readonly<{
			whatToDo:
				| PlaylistActions.REFRESH_ONE_MEDIA_BY_PATH
				| PlaylistActions.ADD_ONE_MEDIA;
			type: WhatToDo.UPDATE_MAIN_LIST;
			newMedia: Media;
			newPath?: Path;
			path: Path;
	  }>
	| Readonly<{
			whatToDo: PlaylistActions.REMOVE_ONE_MEDIA_BY_PATH;
			type: WhatToDo.UPDATE_MAIN_LIST;
			path: Path;
	  }>
	| Readonly<{
			whatToDo: PlaylistActions.REPLACE_ENTIRE_LIST;
			type: WhatToDo.UPDATE_MAIN_LIST;
			list: MainList;
	  }>
	| Readonly<{
			type: WhatToDo.UPDATE_MAIN_LIST;
			whatToDo: PlaylistActions.CLEAN;
	  }>;

export enum PlaylistActions {
	REFRESH_ONE_MEDIA_BY_PATH,
	REMOVE_ONE_MEDIA_BY_PATH,
	REPLACE_ENTIRE_LIST,
	TOGGLE_ONE_MEDIA,
	ADD_ONE_MEDIA,
	CLEAN,
}

export enum WhatToDo {
	UPDATE_MAIN_LIST,
	UPDATE_FAVORITES,
	UPDATE_HISTORY,
}
