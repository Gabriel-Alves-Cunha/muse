/* eslint-disable @typescript-eslint/no-non-null-assertion */

import type { Media, MediaID } from "@common/@types/typesAndEnums";

import { persist } from "zustand/middleware";
import create from "zustand";

import { constRefToEmptyArray, push, remove, replace } from "@utils/array";
import { assertUnreachable } from "@utils/utils";
import { dbgPlaylists } from "@common/utils";
import { keyPrefix } from "@utils/app";
import { hash } from "@common/hash";
import {
	returnNewArrayWithNewMediaIDOnHistoryOfPlayedMedia,
	searchDirectoryResult,
	getAllowedMedias,
	SORTED_BY_DATE,
	SORTED_BY_NAME,
	sortByDate,
	sortByName,
	FAVORITES,
	HISTORY,
} from "./usePlaylistsHelper";

const {
	media: { transformPathsToMedias },
	fs: { deleteFile },
} = electron;

const playlistsKey = `${keyPrefix}playlists` as const;

const defaultPlaylists: readonly Playlist[] = Object.freeze([
	{ name: SORTED_BY_DATE, list: constRefToEmptyArray },
	{ name: SORTED_BY_NAME, list: constRefToEmptyArray },
	{ name: FAVORITES, list: constRefToEmptyArray },
	{ name: HISTORY, list: constRefToEmptyArray },
]);

type UsePlaylistsActions = Readonly<{
	searchForMediaFromList: (searchTerm_: Readonly<string>) => readonly Media[];
	searchLocalComputerForMedias: (force?: Readonly<boolean>) => Promise<void>;
	setPlaylists: (action: Readonly<PlaylistsReducer_Action>) => void;
	updatePlaylists: (playlists: readonly Playlist[]) => void;
	createPlaylist: (playlists: readonly Playlist[]) => void;
	deleteMedia: (media: Media) => Promise<void>;
	playlists: readonly Playlist[];
	mainList: readonly Media[];
}>;

export const usePlaylists = create<UsePlaylistsActions>()(
	persist(
		(set, get) => ({
			mainList: constRefToEmptyArray,
			playlists: defaultPlaylists,
			deleteMedia: async ({ path, id }: Media) => {
				await deleteFile(path);

				get().setPlaylists({
					whatToDo: PlaylistActions.REMOVE_ONE_MEDIA_BY_ID,
					type: PlaylistEnum.UPDATE_MAIN_LIST,
					mediaID: id,
				});
			},
			searchForMediaFromList: (searchTerm_: Readonly<string>) => {
				const searchTerm = searchTerm_.toLowerCase();
				const mainList = get().mainList;

				return mainList.filter(m => m.title.toLowerCase().includes(searchTerm));
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
										action.mediaID
									);

								dbgPlaylists(
									"setPlaylists on 'UPDATE_HISTORY'\u279D'ADD_ONE_MEDIA'. newHistory =",
									newHistory
								);

								if (newHistory === prevHistory) break;

								get().updatePlaylists([{ list: newHistory, name: HISTORY }]);
								break;
							}

							case PlaylistActions.CLEAN: {
								dbgPlaylists(
									"setPlaylists on 'UPDATE_HISTORY'\u279D'CLEAN'. newHistory = []"
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

								dbgPlaylists(
									"setPlaylists on 'UPDATE_FAVORITES'\u279D'ADD_ONE_MEDIA'. newFavorites =",
									newFavorites
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

								dbgPlaylists(
									"setPlaylists on 'UPDATE_FAVORITES'\u279D'REMOVE_ONE_MEDIA'. newFavorites =",
									newFavorites
								);

								get().updatePlaylists([
									{ list: Object.freeze(newFavorites), name: FAVORITES },
								]);
								break;
							}

							case PlaylistActions.CLEAN: {
								dbgPlaylists(
									"setPlaylists on 'UPDATE_FAVORITES'\u279D'CLEAN'. newfavorites = []"
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
							newMainList: readonly Media[]
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
										`A media with path "${action.media.path}" already exists. Therefore, I'm not gonna add it.`
									);
									break;
								}

								const newMainList = push(mainList, action.media);

								dbgPlaylists(
									"setPlaylists on 'UPDATE_MEDIA_LIST'\u279D'ADD_ONE_MEDIA' (yet to be sorted). newMainList =",
									newMainList
								);

								updateSortedListsAndFinish(newMainList);
								break;
							}

							case PlaylistActions.REMOVE_ONE_MEDIA_BY_ID: {
								const newMainList = mainList.filter(
									m => m.id !== action.mediaID
								);

								dbgPlaylists(
									"setPlaylists on 'UPDATE_MEDIA_LIST'\u279D'REMOVE_ONE_MEDIA' (yet to be sorted). newMainList =",
									newMainList
								);

								updateSortedListsAndFinish(newMainList);
								break;
							}

							case PlaylistActions.REPLACE_ENTIRE_LIST: {
								const newMainList = action.list;

								dbgPlaylists(
									"setPlaylists on 'UPDATE_MEDIA_LIST'\u279D'REPLACE_ENTIRE_LIST' (yet to be sorted). newMainList =",
									newMainList
								);

								updateSortedListsAndFinish(newMainList);
								break;
							}

							case PlaylistActions.REFRESH_ONE_MEDIA_BY_ID: {
								const oldMediaIndex = mainList.findIndex(
									m => m.id === action.media.id
								);

								if (oldMediaIndex === -1) {
									console.error(
										`I did not find a media with id = "${action.media.id}" when calling 'REFRESH_ONE_MEDIA_BY_ID'!`
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
									refreshedMedia
								);

								dbgPlaylists(
									"playlistsReducer on 'UPDATE_MEDIA_LIST'\u279D'REFRESH_ONE_MEDIA_BY_ID'. newMediaWithRightIndex =",
									refreshedMedia,
									"\nnewMainList =",
									newMainList
								);

								updateSortedListsAndFinish(newMainList);
								break;
							}

							case PlaylistActions.CLEAN: {
								dbgPlaylists(
									"playlistsReducer on 'UPDATE_MEDIA_LIST'\u279D'CLEAN' (yet to be sorted). newMainList = []"
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
						`%cmainList.length = ${mainListLength}. Is there new media? ${isThereNewMedia}`,
						"color:blue"
					);
					return isThereNewMedia;
				};

				try {
					const paths = getAllowedMedias(await searchDirectoryResult());
					dbgPlaylists("Finished searching. Paths =", paths);

					if (force || isThereNewMedia(paths)) {
						const newMainList = await transformPathsToMedias(paths);
						dbgPlaylists("Finished searching. Medias =", newMainList);

						get().setPlaylists({
							whatToDo: PlaylistActions.REPLACE_ENTIRE_LIST,
							type: PlaylistEnum.UPDATE_MAIN_LIST,
							list: newMainList,
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

				dbgPlaylists(
					"setPlaylists on 'createPlaylist'. New playlist =",
					newPlaylistsContainer
				);

				set({ playlists: Object.freeze(newPlaylistsContainer) });
			},
			updatePlaylists: (newPlaylists: readonly Playlist[]) => {
				const oldPlaylistsContainer = get().playlists;

				// Assert there isn't a not-created playlist:
				let foundOneAlreadyCreated = true;
				for (const newPlaylist of newPlaylists)
					foundOneAlreadyCreated = oldPlaylistsContainer.some(
						p => p.name === newPlaylist.name
					);

				if (!foundOneAlreadyCreated)
					return console.error(
						"One of the playlists I got was not already created. I'm not made to handle it's creation, only to update; to create, use the function `createPlaylist`.\nPlaylists received =",
						newPlaylists,
						"\nExisting playlists =",
						oldPlaylistsContainer
					);

				const updatedPlaylistsContainer = [...oldPlaylistsContainer];
				for (const [index, oldPlaylist] of oldPlaylistsContainer.entries())
					for (const newPlaylist of newPlaylists)
						if (oldPlaylist.name === newPlaylist.name)
							updatedPlaylistsContainer[index] = newPlaylist;

				dbgPlaylists(
					"setPlaylists on 'updatePlaylists'. New playlist =",
					updatedPlaylistsContainer
				);

				set({ playlists: Object.freeze(updatedPlaylistsContainer) });
			},
		}),
		{
			name: playlistsKey,
			partialize: ({ mainList, playlists }) => ({ mainList, playlists }),
			deserialize: object => JSON.parse(object),
			merge: (persistedState, currentState) =>
				Object.assign({}, persistedState, currentState),
			serialize: ({ state: { playlists, mainList } }) =>
				JSON.stringify({ playlists, mainList }),
		}
	)
);

export const { getState: getPlaylists } = usePlaylists;
export const {
	searchLocalComputerForMedias,
	searchForMediaFromList,
	createPlaylist,
	setPlaylists,
	deleteMedia,
} = getPlaylists();

export type DefaultLists =
	| "sorted by date"
	| "sorted by name"
	| "favorites"
	| "main list"
	| "history";

export type Playlist = Readonly<{
	name: DefaultLists | string;
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
