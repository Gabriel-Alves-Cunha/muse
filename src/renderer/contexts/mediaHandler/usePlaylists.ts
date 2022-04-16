/* eslint-disable @typescript-eslint/no-non-null-assertion */

import type { Media, MediaID } from "@common/@types/typesAndEnums";

import { persist } from "zustand/middleware";
import create from "zustand";
import merge from "deepmerge";

import { push, remove, replace } from "@utils/array";
import { assertUnreachable } from "@utils/utils";
import { keyPrefix } from "@utils/app";
import { hash } from "@common/hash";
import { dbg } from "@common/utils";
import {
	returnNewArrayWithNewMediaIDOnHistoryOfPlayedMedia,
	searchDirectoryResult,
	getAllowedMedias,
	SORTED_BY_DATE,
	SORTED_BY_NAME,
	sortByDate,
	sortByName,
	FAVORITES,
	MAIN_LIST,
	HISTORY,
} from "./usePlaylistsHelper";

const {
	media: { transformPathsToMedias },
	fs: { deleteFile: rm },
} = electron;

const playlistsKey = `${keyPrefix}playlists` as const;

const constRefToEmptyArray = Object.freeze([]);
const defaultPlaylists: readonly Playlist[] = Object.freeze([
	{ name: SORTED_BY_DATE, list: constRefToEmptyArray },
	{ name: SORTED_BY_NAME, list: constRefToEmptyArray },
	{ name: FAVORITES, list: constRefToEmptyArray },
	{ name: HISTORY, list: constRefToEmptyArray },
]);

type UsePlaylistsActions = Readonly<{
	searchForMediaFromList: (
		searchTerm_: Readonly<string>,
		fromList: DefaultLists,
	) => readonly Media[];
	searchLocalComputerForMedias: (force?: Readonly<boolean>) => Promise<void>;
	setPlaylists: (action: Readonly<PlaylistsReducer_Action>) => void;
	updatePlaylists: (playlists: readonly Playlist[]) => void;
	createPlaylist: (playlists: readonly Playlist[]) => void;
	deleteMedia: (media: Readonly<Media>) => Promise<void>;
	playlists: readonly Playlist[];
	mainList: readonly Media[];
}>;

export const usePlaylists = create<UsePlaylistsActions>(
	persist(
		(set, get) => ({
			mainList: constRefToEmptyArray,
			playlists: defaultPlaylists,
			deleteMedia: async ({ path, id }: Media) => {
				await rm(path);

				get().setPlaylists({
					whatToDo: PlaylistActions.REMOVE_ONE_MEDIA_BY_ID,
					type: PlaylistEnum.UPDATE_MAIN_LIST,
					mediaID: id,
				});
			},
			searchForMediaFromList: (
				searchTerm_: Readonly<string>,
				fromList: DefaultLists,
			) => {
				const searchTerm = searchTerm_.toLowerCase();
				const mainList = get().mainList;
				let results: readonly Media[];

				// Handle when fromList === MAIN_LIST
				if (fromList === MAIN_LIST) {
					console.time("Searching for file");
					results = mainList.filter(m =>
						m.title.toLowerCase().includes(searchTerm),
					);
					console.timeEnd("Searching for file");
				} else {
					console.time("Searching for file");
					results = get()
						.playlists.find(p => p.name === fromList)!
						.list.map(mediaID => mainList.find(m => m.id === mediaID)!)
						.filter(m => m.title.toLowerCase().includes(searchTerm));
					console.timeEnd("Searching for file");
				}

				return Object.freeze(results);
			},
			setPlaylists: (action: PlaylistsReducer_Action) => {
				const prevPlaylistsContainer = get().playlists;
				const getPlaylist = (listName: DefaultLists) =>
					prevPlaylistsContainer.find(p => p.name === listName);

				switch (action.type) {
					case PlaylistEnum.UPDATE_HISTORY: {
						const prevHistory = getPlaylist(HISTORY)!.list;

						switch (action.whatToDo) {
							case PlaylistActions.ADD_ONE_MEDIA: {
								const newHistory =
									returnNewArrayWithNewMediaIDOnHistoryOfPlayedMedia(
										prevHistory,
										action.mediaID,
									);

								dbg(
									"setPlaylists on 'UPDATE_HISTORY'\u279D'ADD_ONE_MEDIA'. newHistory =",
									newHistory,
								);

								if (newHistory === prevHistory) break;

								get().updatePlaylists([{ list: newHistory, name: HISTORY }]);
								break;
							}

							case PlaylistActions.CLEAN: {
								dbg(
									"setPlaylists on 'UPDATE_HISTORY'\u279D'CLEAN'. newHistory = []",
								);

								get().updatePlaylists([
									{ list: constRefToEmptyArray, name: HISTORY },
								]);
								break;
							}

							default: {
								assertUnreachable(action);
								break;
							}
						}
						break;
					}

					case PlaylistEnum.UPDATE_FAVORITES: {
						const prevFavorites = getPlaylist(FAVORITES)!.list;

						switch (action.whatToDo) {
							case PlaylistActions.ADD_ONE_MEDIA: {
								const newFavorites = push(prevFavorites, action.mediaID);

								dbg(
									"setPlaylists on 'UPDATE_FAVORITES'\u279D'ADD_ONE_MEDIA'. newFavorites =",
									newFavorites,
								);

								get().updatePlaylists([
									{ list: Object.freeze(newFavorites), name: FAVORITES },
								]);
								break;
							}

							case PlaylistActions.REMOVE_ONE_MEDIA_BY_ID: {
								const index = prevFavorites.indexOf(action.mediaID);

								if (index === -1) {
									console.error("Media not found in favorites");
									break;
								}

								const newFavorites = remove(prevFavorites, index);

								dbg(
									"setPlaylists on 'UPDATE_FAVORITES'\u279D'REMOVE_ONE_MEDIA'. newFavorites =",
									newFavorites,
								);

								get().updatePlaylists([
									{ list: Object.freeze(newFavorites), name: FAVORITES },
								]);
								break;
							}

							case PlaylistActions.CLEAN: {
								dbg(
									"setPlaylists on 'UPDATE_FAVORITES'\u279D'CLEAN'. newfavorites = []",
								);

								get().updatePlaylists([
									{ list: constRefToEmptyArray, name: FAVORITES },
								]);
								break;
							}

							default: {
								assertUnreachable(action);
								break;
							}
						}
						break;
					}

					case PlaylistEnum.UPDATE_MAIN_LIST: {
						const mainList = get().mainList;

						const updateSortedListsAndFinish = (
							newMainList: readonly Media[],
						) => {
							get().updatePlaylists([
								{ list: sortByDate(newMainList), name: SORTED_BY_DATE },
								{ list: sortByName(newMainList), name: SORTED_BY_NAME },
							]);
							set(() => ({ mainList: Object.freeze(newMainList) }));
						};

						switch (action.whatToDo) {
							case PlaylistActions.ADD_ONE_MEDIA: {
								if (mainList.find(m => m.path === action.media.path)) {
									console.error(
										`A media with path "${action.media.path}" already exists. Therefore, I'm not gonna add it.`,
									);
									break;
								}

								const newMainList = push(mainList, action.media);

								dbg(
									"setPlaylists on 'UPDATE_MEDIA_LIST'\u279D'ADD_ONE_MEDIA' (yet to be sorted). newMainList =",
									newMainList,
								);

								updateSortedListsAndFinish(newMainList);
								break;
							}

							case PlaylistActions.REMOVE_ONE_MEDIA_BY_ID: {
								const newMainList = mainList.filter(
									m => m.id !== action.mediaID,
								);

								dbg(
									"setPlaylists on 'UPDATE_MEDIA_LIST'\u279D'REMOVE_ONE_MEDIA' (yet to be sorted). newMainList =",
									newMainList,
								);

								updateSortedListsAndFinish(newMainList);
								break;
							}

							case PlaylistActions.REPLACE_ENTIRE_LIST: {
								const newMainList = action.list;

								dbg(
									"setPlaylists on 'UPDATE_MEDIA_LIST'\u279D'REPLACE_ENTIRE_LIST' (yet to be sorted). newMainList =",
									newMainList,
								);

								updateSortedListsAndFinish(newMainList);
								break;
							}

							case PlaylistActions.REFRESH_ONE_MEDIA_BY_ID: {
								const oldMediaIndex = mainList.findIndex(
									m => m.id === action.media.id,
								);

								if (oldMediaIndex === -1) {
									console.error(
										`I did not find a media with id = "${action.media.id}" when calling 'REFRESH_ONE_MEDIA_BY_ID'!`,
									);
									break;
								}

								const refreshedMedia: Media = {
									...action.media,
									id: hash(action.media.path),
								};

								const newMainList = replace(
									mainList,
									oldMediaIndex,
									refreshedMedia,
								);

								dbg(
									"playlistsReducer on 'UPDATE_MEDIA_LIST'\u279D'REFRESH_ONE_MEDIA_BY_ID'. newMediaWithRightIndex =",
									refreshedMedia,
									"\nnewMainList =",
									newMainList,
								);

								updateSortedListsAndFinish(newMainList);
								break;
							}

							case PlaylistActions.CLEAN: {
								dbg(
									"playlistsReducer on 'UPDATE_MEDIA_LIST'\u279D'CLEAN' (yet to be sorted). newMainList = []",
								);

								updateSortedListsAndFinish(constRefToEmptyArray);
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
			},
			searchLocalComputerForMedias: async (force = false) => {
				const isThereNewMedia = (paths: readonly string[]) => {
					const mainListLength = get().mainList.length;
					const isThereNewMedia = paths.length !== mainListLength;
					console.log(
						`mainList.length = ${mainListLength}. Is there new media? ${isThereNewMedia}`,
					);
					return isThereNewMedia;
				};

				try {
					const paths = getAllowedMedias(await searchDirectoryResult());
					dbg("Finished searching. Paths =", paths);

					if (force || isThereNewMedia(paths)) {
						console.time("Reading metadata of all medias");
						const newMainList = await transformPathsToMedias(paths);
						console.timeEnd("Reading metadata of all medias");
						dbg("Finished searching. Medias =", newMainList);

						get().setPlaylists({
							whatToDo: PlaylistActions.REPLACE_ENTIRE_LIST,
							type: PlaylistEnum.UPDATE_MAIN_LIST,
							list: Object.freeze(newMainList),
						});
					}
				} catch (error) {
					console.error(error);
				}
			},
			createPlaylist: (playlists: readonly Playlist[]) => {
				const prevPlaylistsContainer = get().playlists;

				const isOneAlreadyCreated = prevPlaylistsContainer
					.map(playlist => playlists.some(p => p.name === playlist.name))
					.some(Boolean);

				if (isOneAlreadyCreated) return get().updatePlaylists(playlists);

				const newPlaylistsContainer = [...prevPlaylistsContainer];

				for (const playlist of playlists) newPlaylistsContainer.push(playlist);

				dbg(
					"setPlaylists on 'createPlaylist'. New playlist =",
					newPlaylistsContainer,
				);

				set({ playlists: Object.freeze(newPlaylistsContainer) });
			},
			updatePlaylists: (newPlaylists: readonly Playlist[]) => {
				const oldPlaylistsContainer = get().playlists;

				// Assert there isn't a not-created playlist:
				let foundOneAlreadyCreated = true;
				for (const newPlaylist of newPlaylists)
					foundOneAlreadyCreated = oldPlaylistsContainer.some(
						p => p.name === newPlaylist.name,
					);

				if (!foundOneAlreadyCreated)
					return console.error(
						"One of the playlists I got was not already created. I'm not made to handle it's creation, only to update; to create, use the function `createPlaylist`.\nPlaylists received =",
						newPlaylists,
						"\nExisting playlists =",
						oldPlaylistsContainer,
					);

				const updatedPlaylistsContainer = [...oldPlaylistsContainer];
				for (const [index, oldPlaylist] of oldPlaylistsContainer.entries())
					for (const newPlaylist of newPlaylists)
						if (oldPlaylist.name === newPlaylist.name)
							updatedPlaylistsContainer[index] = newPlaylist;

				dbg(
					"setPlaylists on 'updatePlaylists'. New playlist =",
					updatedPlaylistsContainer,
				);

				set({ playlists: Object.freeze(updatedPlaylistsContainer) });
			},
		}),
		{
			name: playlistsKey,
			partialize: ({ mainList, playlists }) => ({ mainList, playlists }),
			deserialize: object => JSON.parse(object),
			merge: (persistedState, currentState) =>
				merge(persistedState, currentState),
			serialize: ({ state: { playlists, mainList } }) =>
				JSON.stringify({ playlists, mainList }),
		},
	),
);

export type DefaultLists =
	| "sorted by date"
	| "sorted by name"
	| "favorites"
	| "main list"
	| "history";

export type Playlist = Readonly<{
	name: DefaultLists & string;
	list: readonly MediaID[];
}>;

export type PlaylistsReducer_Action =
	| Readonly<{
			whatToDo: PlaylistActions.ADD_ONE_MEDIA;
			type: PlaylistEnum.UPDATE_FAVORITES;
			mediaID: MediaID;
	  }>
	| Readonly<{
			whatToDo: PlaylistActions.REMOVE_ONE_MEDIA_BY_ID;
			type: PlaylistEnum.UPDATE_FAVORITES;
			mediaID: MediaID;
	  }>
	| Readonly<{
			type: PlaylistEnum.UPDATE_FAVORITES;
			whatToDo: PlaylistActions.CLEAN;
	  }>
	// ----------------------------------------
	| Readonly<{
			whatToDo: PlaylistActions.ADD_ONE_MEDIA;
			type: PlaylistEnum.UPDATE_HISTORY;
			mediaID: MediaID;
	  }>
	| Readonly<{
			type: PlaylistEnum.UPDATE_HISTORY;
			whatToDo: PlaylistActions.CLEAN;
	  }>
	// ----------------------------------------
	| Readonly<{
			whatToDo:
				| PlaylistActions.REFRESH_ONE_MEDIA_BY_ID
				| PlaylistActions.ADD_ONE_MEDIA;
			type: PlaylistEnum.UPDATE_MAIN_LIST;
			media: Media;
	  }>
	| Readonly<{
			whatToDo: PlaylistActions.REMOVE_ONE_MEDIA_BY_ID;
			type: PlaylistEnum.UPDATE_MAIN_LIST;
			mediaID: MediaID;
	  }>
	| Readonly<{
			whatToDo: PlaylistActions.REPLACE_ENTIRE_LIST;
			type: PlaylistEnum.UPDATE_MAIN_LIST;
			list: readonly Media[];
	  }>
	| Readonly<{
			type: PlaylistEnum.UPDATE_MAIN_LIST;
			whatToDo: PlaylistActions.CLEAN;
	  }>;

export enum PlaylistActions {
	REFRESH_ONE_MEDIA_BY_ID,
	REMOVE_ONE_MEDIA_BY_ID,
	REPLACE_ENTIRE_LIST,
	ADD_ONE_MEDIA,
	CLEAN,
}

export enum PlaylistEnum {
	UPDATE_MAIN_LIST,
	UPDATE_FAVORITES,
	UPDATE_HISTORY,
}
