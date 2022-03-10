/* eslint-disable @typescript-eslint/no-non-null-assertion */

import type { Media, Path } from "@common/@types/typesAndEnums";

import { persist } from "zustand/middleware";
import create from "zustand";
import merge from "deepmerge";

import { push, remove, replace, sort } from "@utils/array";
import { ListenToNotification } from "@common/@types/typesAndEnums";
import { assertUnreachable } from "@utils/utils";
import { string2number } from "@common/hash";
import { keyPrefix } from "@utils/app";
import { dbg } from "@common/utils";
import {
	returnNewArrayWithNewMediaOnHistoryOfPlayedMedia,
	searchDirectoryResult,
	reaplyOrderedIndex,
	getAllowedMedias,
	SORTED_BY_DATE,
	SORTED_BY_NAME,
	MEDIA_LIST,
	FAVORITES,
	HISTORY,
} from "./usePlaylistsHelper";

const {
	media: { transformPathsToMedias },
	fs: { rm },
} = electron;

const playlistsKey = keyPrefix + "playlists";

const defaultPlaylists: readonly Playlist[] = Object.freeze([
	{ name: SORTED_BY_DATE, list: [] },
	{ name: SORTED_BY_NAME, list: [] },
	{ name: MEDIA_LIST, list: [] },
	{ name: FAVORITES, list: [] },
	{ name: HISTORY, list: [] },
]);

export const usePlaylists = create<UsePlaylistsActions>(
	persist(
		(set, get) => ({
			playlists: defaultPlaylists,
			addListeners: (port: MessagePort) => {
				port.onmessage = async event => {
					dbg(
						"Received message from MessagePort on React side.\ndata =",
						event.data,
					);

					const { msg, path }: Msg = event.data;

					switch (msg) {
						case ListenToNotification.ADD_ONE_MEDIA: {
							if (!path) {
								console.error(
									"There should be a path if you want to add a media!",
								);
								break;
							}

							dbg("At ListenToNotification.ADD_MEDIA:", { path });

							const media: Media = (await transformPathsToMedias([path]))[0];

							if (!media) {
								console.error(`Could not transform "${path}" to media.`);
								break;
							}

							get().setPlaylists({
								whatToDo: PlaylistActions.ADD_ONE_MEDIA,
								type: PlaylistEnum.UPDATE_MEDIA_LIST,
								media,
							});
							break;
						}

						case ListenToNotification.DELETE_ONE_MEDIA_FROM_COMPUTER: {
							dbg("At ListenToNotification.DELETE_ONE_MEDIA_FROM_COMPUTER:", {
								path,
							});

							if (!path) {
								console.error(
									"There should be a path if you want to delete a media!",
								);
								break;
							}

							const media = get()
								.playlists.find(p => p.name === MEDIA_LIST)!
								.list.find(m => m.path === path);

							if (media) {
								await get().deleteMedia(media);
								console.log(`Media "${{ media }}" deleted.`);
							}
							break;
						}

						case ListenToNotification.REFRESH_ALL_MEDIA: {
							dbg("At ListenToNotification.REFRESH_ALL_MEDIA:");
							await get().searchLocalComputerForMedias(true);
							break;
						}

						case ListenToNotification.REFRESH_ONE_MEDIA: {
							dbg("At ListenToNotification.REFRESH_MEDIA:", { path });

							if (!path) {
								console.error(
									"There should be a path if you want to refresh a media!",
								);
								break;
							}

							const mediaIndex = get()
								.playlists.find(p => p.name === MEDIA_LIST)!
								.list.findIndex(m => m.path === path);

							if (mediaIndex === -1) {
								console.warn(
									`There should be a media with path = "${path}" to be refreshed, but there isn't!\nRefreshing all media.`,
								);

								await get().searchLocalComputerForMedias(true);
								break;
							}

							const refreshedMedia = (await transformPathsToMedias([path]))[0];

							if (!refreshedMedia) {
								console.error(
									`I wasn't able to transform this path (${path}) to a media to be refreshed!`,
								);
								break;
							}

							get().setPlaylists({
								whatToDo: PlaylistActions.REFRESH_ONE_MEDIA_BY_ID,
								type: PlaylistEnum.UPDATE_MEDIA_LIST,
								media: refreshedMedia,
							});
							break;
						}

						case ListenToNotification.REMOVE_ONE_MEDIA: {
							dbg("At ListenToNotification.REMOVE_MEDIA:", { path });

							const media = get()
								.playlists.find(p => p.name === MEDIA_LIST)!
								.list.find(m => m.path === path);

							if (!media) {
								console.error(
									`I wasn't able to find this path "${path}" to a media to be removed!`,
								);
								break;
							}

							get().setPlaylists({
								whatToDo: PlaylistActions.REMOVE_ONE_MEDIA,
								type: PlaylistEnum.UPDATE_MEDIA_LIST,
								mediaIndex: media.index,
							});
							break;
						}

						default: {
							console.error("There is no function to handle this event:", {
								event,
							});
							break;
						}
					}
				};

				return port;
			},
			deleteMedia: async (media: Media) => {
				await rm(media.path);

				get().setPlaylists({
					whatToDo: PlaylistActions.REMOVE_ONE_MEDIA,
					type: PlaylistEnum.UPDATE_MEDIA_LIST,
					mediaIndex: media.index,
				});
			},
			searchForMedia: (searchTerm_: Readonly<string>) => {
				const searchTerm = searchTerm_.toLowerCase();
				const mediaList = get().playlists.find(
					p => p.name === MEDIA_LIST,
				)!.list;

				console.time("Searching for file");
				const results = mediaList.filter(m =>
					m.title.toLowerCase().includes(searchTerm),
				);
				console.timeEnd("Searching for file");

				return results;
			},
			setPlaylists: (action: PlaylistsReducer_Action) => {
				const prevPlaylistArray = get().playlists;
				const getPlaylist = (listName: DefaultLists) =>
					prevPlaylistArray.find(p => p.name === listName);

				switch (action.type) {
					case PlaylistEnum.UPDATE_HISTORY: {
						const prevHistory = getPlaylist(HISTORY)!.list;

						switch (action.whatToDo) {
							case PlaylistActions.ADD_ONE_MEDIA: {
								const newHistory =
									returnNewArrayWithNewMediaOnHistoryOfPlayedMedia(
										prevHistory,
										action.media,
									);

								dbg(
									"setPlaylists on 'update history'->'add'. newHistory =",
									newHistory,
								);

								if (newHistory === prevHistory) break;

								get().updatePlaylists([{ list: newHistory, name: HISTORY }]);
								break;
							}

							case PlaylistActions.CLEAN: {
								dbg(
									"setPlaylists on 'update history'->'clean'. newHistory = []",
								);

								get().updatePlaylists([{ list: [], name: HISTORY }]);
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
								const newFavorites = push(prevFavorites, {
									...action.media,
									index: prevFavorites.length,
								});

								dbg(
									"setPlaylists on 'update FAVORITES'->'add'. newFavorites =",
									newFavorites,
								);

								get().updatePlaylists([
									{ list: newFavorites, name: FAVORITES },
								]);
								break;
							}

							case PlaylistActions.REMOVE_ONE_MEDIA: {
								const newFavorites = reaplyOrderedIndex(
									remove(prevFavorites, action.mediaIndex),
								);

								dbg(
									"setPlaylists on 'update favorites'->'REMOVE_ONE_MEDIA'. newFavorites =",
									newFavorites,
								);

								get().updatePlaylists([
									{ list: newFavorites, name: FAVORITES },
								]);
								break;
							}

							case PlaylistActions.CLEAN: {
								dbg(
									"setPlaylists on 'update favorites'->'clean'. newfavorites = []",
								);

								get().updatePlaylists([{ list: [], name: FAVORITES }]);
								break;
							}

							default: {
								assertUnreachable(action);
								break;
							}
						}
						break;
					}

					case PlaylistEnum.UPDATE_MEDIA_LIST: {
						const prevMediaList = getPlaylist(MEDIA_LIST)!.list;

						const updateSortedListsAndFinish = (
							newMediaList: readonly Media[],
						) =>
							get().updatePlaylists([
								{ list: sortByDate(newMediaList), name: SORTED_BY_DATE },
								{ list: sortByName(newMediaList), name: SORTED_BY_NAME },
								{ list: newMediaList, name: MEDIA_LIST },
							]);

						switch (action.whatToDo) {
							case PlaylistActions.ADD_ONE_MEDIA: {
								if (prevMediaList.find(m => m.path === action.media.path)) {
									console.error(
										`A media with path "${action.media.path}" already exists. Therefore, I'm not gonna add it.`,
									);
									break;
								}

								const newMediaList = push(prevMediaList, {
									...action.media,
									index: prevMediaList.length,
								});

								dbg(
									"setPlaylists on 'update mediaList'->'add' (yet to be sorted). newMediaList =",
									newMediaList,
								);

								updateSortedListsAndFinish(newMediaList);
								break;
							}

							case PlaylistActions.REMOVE_ONE_MEDIA: {
								const newMediaList = reaplyOrderedIndex(
									remove(prevMediaList, action.mediaIndex),
								);

								dbg(
									"setPlaylists on 'update mediaList'->'remove' (yet to be sorted). newMediaList =",
									newMediaList,
								);

								updateSortedListsAndFinish(newMediaList);
								break;
							}

							case PlaylistActions.REPLACE_ENTIRE_LIST: {
								const newMediaList = reaplyOrderedIndex(action.list);

								dbg(
									"setPlaylists on 'update mediaList'->'new list' (yet to be sorted). newMediaList =",
									newMediaList,
								);

								updateSortedListsAndFinish(newMediaList);
								break;
							}

							case PlaylistActions.REFRESH_ONE_MEDIA_BY_ID: {
								const oldMediaIndex = prevMediaList.findIndex(
									p => p.id === action.media.id,
								);

								if (oldMediaIndex === -1) {
									console.error(
										"I did not find a media when calling 'PlaylistActions.REFRESH_ONE_MEDIA_BY_ID'!",
									);
									break;
								}

								const newMediaWithCorrectIndex: Media = {
									...action.media,
									id: string2number(action.media.title),
									index: oldMediaIndex,
								};

								const newMediaList = replace(
									prevMediaList,
									oldMediaIndex,
									newMediaWithCorrectIndex,
								);

								dbg(
									"playlistsReducer on 'update mediaList'->'refresh one'. newMediaWithRightIndex =",
									newMediaWithCorrectIndex,
									"\nnewMediaList =",
									newMediaList,
								);

								updateSortedListsAndFinish(newMediaList);
								break;
							}

							case PlaylistActions.CLEAN: {
								dbg(
									"playlistsReducer on 'update mediaList'->'clean' (yet to be sorted). newMediaList = []",
								);

								updateSortedListsAndFinish([]);
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
				const playlists = get().playlists;

				const mediaList = playlists.find(p => p.name === MEDIA_LIST)!.list;

				const isThereNewMedia = (paths: readonly string[]) => {
					const isThereNewMedia = paths.length !== mediaList.length;
					console.log(
						`mediaList.length = ${mediaList.length}. Is there new media? ${isThereNewMedia}`,
					);
					return isThereNewMedia;
				};

				try {
					const paths = getAllowedMedias(await searchDirectoryResult());
					dbg("Finished searching. Paths =", paths);

					if (force || isThereNewMedia(paths)) {
						console.time("Reading metadata of all medias");
						const newMediaList = await transformPathsToMedias(paths);
						console.timeEnd("Reading metadata of all medias");
						dbg("Finished searching. Medias =", newMediaList);

						get().setPlaylists({
							whatToDo: PlaylistActions.REPLACE_ENTIRE_LIST,
							type: PlaylistEnum.UPDATE_MEDIA_LIST,
							list: newMediaList,
						});
					}
				} catch (error) {
					console.error(error);
				}
			},
			createPlaylist: (playlists: readonly Playlist[]) => {
				const prevPlaylistArray = get().playlists;

				const isOneAlreadyCreated = prevPlaylistArray
					.map(playlist => playlists.some(p => p.name === playlist.name))
					.some(Boolean);

				if (isOneAlreadyCreated) return get().updatePlaylists(playlists);

				const newPlaylistArray = [...prevPlaylistArray];

				for (const playlist of playlists) newPlaylistArray.push(playlist);

				dbg(
					"setPlaylists on 'create or update playlists'->'create'. New playlist =",
					newPlaylistArray,
				);

				set({ playlists: newPlaylistArray });
			},
			updatePlaylists: (newPlaylists: readonly Playlist[]) => {
				const oldPlaylists = get().playlists;

				// Assert there isn't a not-created playlist:
				let foundOneAlreadyCreated = true;
				for (const newPlaylist of newPlaylists)
					foundOneAlreadyCreated = oldPlaylists.some(
						p => p.name === newPlaylist.name,
					);

				if (!foundOneAlreadyCreated)
					return console.error(
						"One of the playlists I got was not already created. I'm not made to handle it's creation, only to update; to create, use the function `createPlaylist`.\nPlaylists received =",
						newPlaylists,
						"\nExisting playlists =",
						oldPlaylists,
					);

				const updatedPlaylists = [...oldPlaylists];
				for (const [index, oldPlaylist] of oldPlaylists.entries())
					for (const newPlaylist of newPlaylists)
						if (oldPlaylist.name === newPlaylist.name)
							updatedPlaylists[index] = newPlaylist;

				dbg(
					"setPlaylists on 'create or update playlists'->'update'. New playlist =",
					updatedPlaylists,
				);

				set({ playlists: updatedPlaylists });
			},
		}),
		{
			name: playlistsKey,
			serialize: ({ state }) => JSON.stringify(state.playlists),
			partialize: ({ playlists }) => ({ playlists }),
			deserialize: playlists => JSON.parse(playlists),
			merge: (persistedState, currentState) =>
				merge(persistedState, currentState),
		},
	),
);

type ListWithDateAndOrder<T> = ReadonlyArray<
	Readonly<T> & Readonly<{ dateOfArival: number; index: number }>
>;

const sortByDate = <T>(list: ListWithDateAndOrder<T>) =>
	reaplyOrderedIndex(
		sort(list, (a, b) => {
			if (a.dateOfArival > b.dateOfArival) return 1;
			if (a.dateOfArival < b.dateOfArival) return -1;
			// a must be equal to b:
			return 0;
		}),
	);

type ListWithNameAndOrder<T> = ReadonlyArray<
	Readonly<T> & Readonly<{ title: string; index: number }>
>;

const sortByName = <T>(list: ListWithNameAndOrder<T>) =>
	reaplyOrderedIndex(
		sort(list, (a, b) => {
			if (a.title > b.title) return 1;
			if (a.title < b.title) return -1;
			// a must be equal to b:
			return 0;
		}),
	);

type UsePlaylistsActions = Readonly<{
	searchLocalComputerForMedias: (force?: Readonly<boolean>) => Promise<void>;
	searchForMedia: (searchTerm_: Readonly<string>) => readonly Media[];
	setPlaylists: (action: Readonly<PlaylistsReducer_Action>) => void;
	updatePlaylists: (playlists: readonly Playlist[]) => void;
	createPlaylist: (playlists: readonly Playlist[]) => void;
	deleteMedia: (media: Readonly<Media>) => Promise<void>;
	addListeners: (port: MessagePort) => MessagePort;
	playlists: readonly Playlist[];
}>;

type Msg = { msg: ListenToNotification; path?: Path };

export type DefaultLists =
	| "sorted by date"
	| "sorted by name"
	| "favorites"
	| "mediaList"
	| "history";

export type Playlist = Readonly<{
	name: DefaultLists & string;
	list: readonly Media[];
}>;

export type PlaylistsReducer_Action =
	| Readonly<{
			whatToDo: PlaylistActions.ADD_ONE_MEDIA;
			type: PlaylistEnum.UPDATE_FAVORITES;
			media: Media;
	  }>
	| Readonly<{
			whatToDo: PlaylistActions.REMOVE_ONE_MEDIA;
			type: PlaylistEnum.UPDATE_FAVORITES;
			mediaIndex: Media["index"];
	  }>
	| Readonly<{
			type: PlaylistEnum.UPDATE_FAVORITES;
			whatToDo: PlaylistActions.CLEAN;
	  }>
	// ----------------------------------------
	| Readonly<{
			whatToDo: PlaylistActions.ADD_ONE_MEDIA;
			type: PlaylistEnum.UPDATE_HISTORY;
			media: Media;
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
			type: PlaylistEnum.UPDATE_MEDIA_LIST;
			media: Media;
	  }>
	| Readonly<{
			whatToDo: PlaylistActions.REMOVE_ONE_MEDIA;
			type: PlaylistEnum.UPDATE_MEDIA_LIST;
			mediaIndex: number;
	  }>
	| Readonly<{
			whatToDo: PlaylistActions.REPLACE_ENTIRE_LIST;
			type: PlaylistEnum.UPDATE_MEDIA_LIST;
			list: readonly Media[];
	  }>
	| Readonly<{
			type: PlaylistEnum.UPDATE_MEDIA_LIST;
			whatToDo: PlaylistActions.CLEAN;
	  }>;

export enum PlaylistActions {
	REFRESH_ONE_MEDIA_BY_ID,
	REPLACE_ENTIRE_LIST,
	REMOVE_ONE_MEDIA,
	ADD_ONE_MEDIA,
	CLEAN,
}

export enum PlaylistEnum {
	UPDATE_MEDIA_LIST,
	UPDATE_FAVORITES,
	UPDATE_HISTORY,
}
