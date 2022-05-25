import type { Media, Path } from "@common/@types/generalTypes";

import create from "zustand";

import { assertUnreachable, time } from "@utils/utils";
import { dbg } from "@common/utils";
import {
	getFromLocalStorage,
	setLocalStorage,
	keys,
} from "@utils/localStorage";
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

type UsePlaylistsActions = Readonly<{
	setPlaylists: (action: Readonly<PlaylistsReducer_Action>) => void;

	isLoadingMedias: boolean;

	history: ReadonlyArray<Path>;
	sortedByDate: Set<Path>;
	sortedByName: Set<Path>;
	favorites: Set<Path>;
	mainList: MainList;
}>;

export const usePlaylists = create<UsePlaylistsActions>((set, get) => ({
	sortedByDate:
		(getFromLocalStorage(keys.sortedByDate) as Set<Path>) ?? new Set(),
	sortedByName:
		(getFromLocalStorage(keys.sortedByName) as Set<Path>) ?? new Set(),
	favorites: (getFromLocalStorage(keys.favorites) as Set<Path>) ?? new Set(),
	history: (getFromLocalStorage(keys.history) as Path[]) ?? [],
	mainList: new Map(),

	isLoadingMedias: false,

	setPlaylists: (action: PlaylistsReducer_Action) => {
		time(() => {
			switch (action.type) {
				case WhatToDo.UPDATE_HISTORY: {
					switch (action.whatToDo) {
						case PlaylistActions.ADD_ONE_MEDIA: {
							const newHistory = [...get().history];

							// If the new media is the same as the first
							// media in the list, don't add it again:
							if (action.path === newHistory[0]) break;

							// add newMedia to the start of array:
							newHistory.unshift(action.path);

							// history has a max size of maxSizeOfHistory:
							if (newHistory.length > maxSizeOfHistory)
								newHistory.length = maxSizeOfHistory;

							dbg(
								"setPlaylists on 'UPDATE_HISTORY'\u279D'ADD_ONE_MEDIA'. newHistory =",
								newHistory
							);

							set({ history: newHistory });
							setLocalStorage(keys.history, newHistory);
							break;
						}

						case PlaylistActions.CLEAN: {
							dbg(
								"setPlaylists on 'UPDATE_HISTORY'\u279D'CLEAN'. new history = []"
							);

							set({ history: emptyArray });
							setLocalStorage(keys.history, emptyArray);
							break;
						}

						default: {
							assertUnreachable(action);
							break;
						}
					}
					break;
				}

				case WhatToDo.UPDATE_FAVORITES: {
					switch (action.whatToDo) {
						case PlaylistActions.TOGGLE_ONE_MEDIA: {
							const favorites = get().favorites;

							if (favorites.has(action.path)) {
								favorites.delete(action.path);
								set({ favorites });
							} else set({ favorites: favorites.add(action.path) });

							dbg(
								"setPlaylists on 'UPDATE_FAVORITES'\u279D'TOGGLE_ONE_MEDIA'. new favorites =",
								get().favorites
							);

							setLocalStorage(keys.favorites, favorites);
							break;
						}

						case PlaylistActions.ADD_ONE_MEDIA: {
							set({ favorites: get().favorites.add(action.path) });

							dbg(
								"setPlaylists on 'UPDATE_FAVORITES'\u279D'ADD_ONE_MEDIA'. new favorites =",
								get().favorites
							);

							setLocalStorage(keys.favorites, get().favorites);
							break;
						}

						case PlaylistActions.REMOVE_ONE_MEDIA_BY_PATH: {
							const favorites = get().favorites;

							favorites.delete(action.path)
								? set({ favorites })
								: console.error("Media not found in favorites");

							dbg(
								"setPlaylists on 'UPDATE_FAVORITES'\u279D'REMOVE_ONE_MEDIA'. new favorites =",
								get().favorites
							);

							setLocalStorage(keys.favorites, favorites);
							break;
						}

						case PlaylistActions.CLEAN: {
							dbg(
								"setPlaylists on 'UPDATE_FAVORITES'\u279D'CLEAN'. new favorites = []"
							);

							set({ favorites: new Set() });
							setLocalStorage(keys.favorites, new Set());
							break;
						}

						default: {
							assertUnreachable(action);
							break;
						}
					}
					break;
				}

				case WhatToDo.UPDATE_MAIN_LIST: {
					const updateSortedAndMainLists = (newMainList: MainList) => {
						const sortedByName = sortByName(newMainList);
						const sortedByDate = sortByDate(newMainList);

						set({ mainList: newMainList, sortedByDate, sortedByName });
						setLocalStorage(keys.sortedByDate, sortedByDate);
						setLocalStorage(keys.sortedByName, sortedByName);
					};

					switch (action.whatToDo) {
						case PlaylistActions.ADD_ONE_MEDIA: {
							const mainList = get().mainList;

							if (mainList.has(action.path)) {
								console.error(
									`A media with path "${String(
										action.path
									)}" already exists. Therefore, I'm not gonna add it.`
								);
								break;
							}

							mainList.set(action.path, action.newMedia);

							updateSortedAndMainLists(mainList);

							dbg(
								"setPlaylists on 'UPDATE_MEDIA_LIST'\u279D'ADD_ONE_MEDIA' (yet to be sorted). newMainList =",
								get().mainList
							);
							break;
						}

						case PlaylistActions.REMOVE_ONE_MEDIA_BY_PATH: {
							const mainList = get().mainList;

							if (!mainList.delete(action.path)) {
								console.error(
									`A media with path "${String(
										action.path
									)}" does not exist. Therefore, I'm not gonna remove it.`
								);
								break;
							}

							updateSortedAndMainLists(mainList);

							// If the media is in the favorites, remove it from the favorites
							const favorites = get().favorites;

							if (favorites.delete(action.path)) {
								set({ favorites });
								setLocalStorage(keys.favorites, favorites);
							}

							// If the media is in the history, remove it from the history
							const history = [...get().history];
							const mediaIndexInHistory = history.findIndex(
								path => action.path === path
							);
							if (mediaIndexInHistory !== -1) {
								history.splice(mediaIndexInHistory, 1);
								set({ history });
								setLocalStorage(keys.history, history);
							}

							dbg(
								"setPlaylists on 'UPDATE_MEDIA_LIST'\u279D'REMOVE_ONE_MEDIA_BY_PATH' (yet to be sorted). newMainList =",
								get().mainList
							);
							break;
						}

						case PlaylistActions.REPLACE_ENTIRE_LIST: {
							dbg(
								"setPlaylists on 'UPDATE_MEDIA_LIST'\u279D'REPLACE_ENTIRE_LIST' (yet to be sorted). newMainList =",
								action.list
							);

							// If the media in the favorites list is not on
							// action.list, remove it from the favorites:
							const favorites = get().favorites;
							const previousFavoritesSize = favorites.size;

							favorites.forEach(
								path => !action.list.has(path) && favorites.delete(path)
							);

							if (favorites.size !== previousFavoritesSize) {
								set({ favorites });
								setLocalStorage(keys.favorites, favorites);
							}

							// If the media in the history list is not on
							// action.list, remove it from the favorites:
							const history = [...get().history];
							const previousHistorySize = history.length;

							history.forEach(
								(path, index) =>
									!action.list.has(path) && history.splice(index, 1)
							);

							if (history.length !== previousHistorySize) {
								set({ history });
								setLocalStorage(keys.history, history);
							}

							updateSortedAndMainLists(action.list);
							break;
						}

						case PlaylistActions.REFRESH_ONE_MEDIA_BY_PATH: {
							const { newMedia, path, newPath } = action;
							const mainList = get().mainList;

							const oldMedia = mainList.get(path);

							if (!oldMedia) {
								console.error(
									`I did not find a media with path = "${String(
										action.path
									)}" when calling 'REFRESH_ONE_MEDIA_BY_PATH'!`
								);
								break;
							}

							if (newPath) {
								mainList.delete(path);
								mainList.set(newPath, newMedia);
								updateSortedAndMainLists(mainList);

								// Now path is an old, invalid path:
								if (get().mainList.has(path))
									console.error(
										`A media with path "${String(
											path
										)}" should have been deleted, but it wasn't!`,
										{ newPath, path, newMedia, mainList: get().mainList }
									);
							} else
								updateSortedAndMainLists(
									mainList.set(action.path, action.newMedia)
								);

							dbg(
								"playlistsReducer on 'UPDATE_MEDIA_LIST'\u279D'REFRESH_ONE_MEDIA_BY_ID'. newMedia =",
								get().mainList.get(newPath ? newPath : path),
								"\nnewMainList =",
								get().mainList
							);
							break;
						}

						case PlaylistActions.CLEAN: {
							dbg(
								"playlistsReducer on 'UPDATE_MEDIA_LIST'\u279D'CLEAN' (yet to be sorted). newMainList = []"
							);

							set({
								sortedByDate: new Set(),
								sortedByName: new Set(),
								favorites: new Set(),
								mainList: new Map(),
								history: emptyArray,
							});

							setLocalStorage(keys.sortedByDate, emptyArray);
							setLocalStorage(keys.sortedByName, emptyArray);
							setLocalStorage(keys.favorites, emptyArray);
							setLocalStorage(keys.history, emptyArray);

							break;
						}

						default: {
							assertUnreachable(action);
							break;
						}
					}
					break;
				}

				default: {
					assertUnreachable(action);
					break;
				}
			}
		}, "setPlaylists " + JSON.stringify(action, null, 2));
	},
}));

///////////////////////////////////////////////////
///////////////////////////////////////////////////
///////////////////////////////////////////////////

const { getState: getPlaylists } = usePlaylists;
export const sortedByDate = () => getPlaylists().sortedByDate;
export const sortedByName = () => getPlaylists().sortedByName;
export const favorites = () => getPlaylists().favorites;
export const mainList = () => getPlaylists().mainList;
export const history = () => getPlaylists().history;
export const { setPlaylists } = getPlaylists();

export enum PlaylistList {
	SORTED_BY_DATE,
	SORTED_BY_NAME,
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

		case PlaylistList.SORTED_BY_NAME:
			return sortedByName();

		default:
			return assertUnreachable(list);
	}
};

export const cleanHistory = () =>
	setPlaylists({
		whatToDo: PlaylistActions.CLEAN,
		type: WhatToDo.UPDATE_HISTORY,
	});

export async function searchLocalComputerForMedias() {
	time(async () => {
		usePlaylists.setState({ isLoadingMedias: true });

		try {
			const paths = getAllowedMedias(await searchDirectoryResult());
			const newMediaList = await transformPathsToMedias(paths);

			dbg(
				"Finished searching. Paths =",
				paths,
				"Finished searching. Medias =",
				newMediaList
			);

			const newMainList: MainList = new Map(newMediaList);

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
	const searchTerm = searchTerm_.toLowerCase();
	const medias: [Path, Media][] = [];

	getPlaylists().mainList.forEach(
		(media, path) =>
			media.title.toLowerCase().includes(searchTerm) &&
			medias.push([path, media])
	);

	return medias;
}

export async function deleteMedia(path: Path) {
	time(async () => {
		await deleteFile(path);

		setPlaylists({
			whatToDo: PlaylistActions.REMOVE_ONE_MEDIA_BY_PATH,
			type: WhatToDo.UPDATE_MAIN_LIST,
			path,
		});
	}, "deleteMedia");
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
