import type { Media, Path } from "@common/@types/typesAndEnums";

import { persist } from "zustand/middleware";
import create from "zustand";
import merge from "deepmerge";

import { remove, replace, sort } from "@utils/array";
import { ListenToNotification } from "@common/@types/typesAndEnums";
import { assertUnreachable } from "@utils/utils";
import { keyPrefix } from "@utils/app";
import { dbg } from "@common/utils";
import {
	returnNewArrayWithNewMediaOnHistoryOfPlayedMedia,
	searchDirectoryResult,
	reaplyOrderedIndex,
	getAllowedMedias,
} from "./usePlaylistsHelper";

const {
	media: { transformPathsToMedias },
	fs: { rm },
} = global.electron;

const playlistsKey = keyPrefix + "playlists";

export const defaultPlaylists: readonly Playlist[] = Object.freeze([
	{ name: "sorted by date", list: [] },
	{ name: "sorted by name", list: [] },
	{ name: "favorites", list: [] },
	{ name: "mediaList", list: [] },
	{ name: "history", list: [] },
	{ name: "none", list: [] },
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

					const {
						msg,
						path,
					}: Readonly<{ msg: ListenToNotification; path?: Path }> = event.data;

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

						case ListenToNotification.DEL_MEDIA: {
							dbg("At ListenToNotification.DEL_MEDIA:", { path });

							if (!path) {
								console.error(
									"There should be a path if you want to delete a media!",
								);
								break;
							}

							// eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
							const media = get()
								.playlists.find(({ name }) => name === "mediaList")!
								.list.find(({ path: path_ }) => path_ === path);

							if (media) {
								get().deleteMedia(media);
								console.log(`Media "${media}" deleted.`);
							}
							break;
						}

						case ListenToNotification.REFRESH_ALL_MEDIA: {
							dbg("At ListenToNotification.REFRESH_ALL_MEDIA:");
							await get().searchLocalComputerForMedias(true);
							break;
						}

						case ListenToNotification.REFRESH_MEDIA: {
							dbg("At ListenToNotification.REFRESH_MEDIA:", { path });

							if (!path) {
								console.error(
									"There should be a path if you want to refresh a media!",
								);
								break;
							}

							// eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
							const mediaIndex = get()
								.playlists.find(({ name }) => name === "mediaList")!
								.list.findIndex(({ path: path_ }) => path_ === path);

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
								whatToDo: PlaylistActions.REFRESH_ONE,
								type: PlaylistEnum.UPDATE_MEDIA_LIST,
								media: refreshedMedia,
							});
							break;
						}

						case ListenToNotification.REMOVE_MEDIA: {
							dbg("At ListenToNotification.REMOVE_MEDIA:", { path });

							// eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
							const media = get()
								.playlists.find(({ name }) => name === "mediaList")!
								.list.find(({ path: path_ }) => path_ === path);

							if (!media) {
								console.error(
									`I wasn't able to find this path "${path}" to a media to be removed!`,
								);
								break;
							}

							get().setPlaylists({
								type: PlaylistEnum.UPDATE_MEDIA_LIST,
								whatToDo: PlaylistActions.REMOVE_ONE_MEDIA,
								media,
							});
							break;
						}

						default: {
							console.error(
								`There is no function to handle this case: ${event.data}`,
							);
							break;
						}
					}
				};

				return port;
			},
			deleteMedia: async (media: Media) => {
				await rm(media.path);

				get().setPlaylists({
					type: PlaylistEnum.UPDATE_MEDIA_LIST,
					whatToDo: PlaylistActions.REMOVE_ONE_MEDIA,
					media,
				});
			},
			searchForMedia: (searchTerm: Readonly<string>) => {
				const playlists = get().playlists;

				console.time("Searching for file");
				// eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
				const mediaList = playlists.find(
					({ name }) => name === "mediaList",
				)!.list;

				const results = mediaList.filter(({ title }) =>
					title.toLowerCase().includes(searchTerm.toLowerCase()),
				);
				console.timeEnd("Searching for file");

				return results;
			},
			setPlaylists: (action: PlaylistsReducer_Action) => {
				const prevPlaylistArray = get().playlists;

				switch (action.type) {
					case PlaylistEnum.UPDATE_HISTORY: {
						// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
						const prevHistory = prevPlaylistArray.find(
							({ name }) => name === "history",
						)!.list;
						console.assert(prevHistory);

						switch (action.whatToDo) {
							case PlaylistActions.ADD_ONE_MEDIA: {
								if (!action.media) {
									console.error(
										"There should be a media when calling 'add' on history! action",
										action,
									);
									break;
								}

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

								get().updatePlaylists([{ list: newHistory, name: "history" }]);
								break;
							}

							case PlaylistActions.CLEAN: {
								dbg(
									"setPlaylists on 'update history'->'clean'. newHistory = []",
								);

								get().updatePlaylists([{ list: [], name: "history" }]);
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
						// eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
						const prevFavorites = prevPlaylistArray.find(
							({ name }) => name === "favorites",
						)!.list;
						console.assert(prevFavorites);

						switch (action.whatToDo) {
							case PlaylistActions.ADD_ONE_MEDIA: {
								const newFavorites = [
									...prevFavorites,
									{
										...action.media,
										index: prevFavorites.length,
									},
								];

								dbg(
									"setPlaylists on 'update favorites'->'add'. newFavorites =",
									newFavorites,
								);

								get().updatePlaylists([
									{ list: newFavorites, name: "favorites" },
								]);
								break;
							}

							case PlaylistActions.REMOVE_ONE_MEDIA: {
								const newFavorites = reaplyOrderedIndex(
									remove(prevFavorites, action.media.index),
								);

								dbg(
									"setPlaylists on 'update favorites'->'remove'. newFavorites =",
									newFavorites,
								);

								get().updatePlaylists([
									{ list: newFavorites, name: "favorites" },
								]);
								break;
							}

							case PlaylistActions.CLEAN: {
								dbg(
									"setPlaylists on 'update favorites'->'clean'. newFavorites = []",
								);

								get().updatePlaylists([{ list: [], name: "favorites" }]);
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
						// eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
						const prevMediaList = prevPlaylistArray.find(
							({ name }) => name === "mediaList",
						)!.list;
						console.assert(prevMediaList);

						const updateSortedListsAndFinish = (
							newMediaList: readonly Media[],
						) => {
							get().updatePlaylists([
								{ list: sortByDate(newMediaList), name: "sorted by date" },
								{ list: sortByName(newMediaList), name: "sorted by name" },
								{ list: newMediaList, name: "mediaList" },
							]);
						};

						switch (action.whatToDo) {
							case PlaylistActions.ADD_ONE_MEDIA: {
								if (!action.media) {
									console.error(
										"There should be a media when calling 'add'! action =",
										action,
									);
									break;
								}

								const newMediaList = [
									...prevMediaList,
									{
										...action.media,
										index: prevMediaList.length,
									},
								];

								dbg(
									"setPlaylists on 'update mediaList'->'add' (yet to be sorted). newMediaList =",
									newMediaList,
								);

								updateSortedListsAndFinish(newMediaList);
								break;
							}

							case PlaylistActions.REMOVE_ONE_MEDIA: {
								if (!action.media) {
									console.error(
										"There should be a media when calling 'remove'! action =",
										action,
									);
									break;
								}

								const newMediaList = reaplyOrderedIndex(
									remove(prevMediaList, action.media.index),
								);

								dbg(
									"setPlaylists on 'update mediaList'->'remove' (yet to be sorted). newMediaList =",
									newMediaList,
								);

								updateSortedListsAndFinish(newMediaList);
								break;
							}

							case PlaylistActions.REPLACE_ENTIRE_LIST: {
								if (!action.list) {
									console.error(
										"There should be a list when calling 'new list'!",
									);
									break;
								}

								// const updatedButWithOriginalDateOfArival = prevMediaList
								// 	.map((prevMedia, index) =>
								// 		prevMedia.dateOfArival
								// 			? {
								// 					// eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
								// 					...action.list![index],
								// 					dateOfArival: prevMedia.dateOfArival,
								// 			  }
								// 			: // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
								// 			  action.list![index],
								// 	)
								// 	.filter(({ path }) => path);

								const newMediaList = reaplyOrderedIndex(
									// concatFromIndex(
									// 	updatedButWithOriginalDateOfArival,
									// 	updatedButWithOriginalDateOfArival.length,
									// 	action.list,
									// ),
									action.list,
								);

								dbg(
									"setPlaylists on 'update mediaList'->'new list' (yet to be sorted). newMediaList =",
									newMediaList,
								);

								updateSortedListsAndFinish(newMediaList);
								break;
							}

							case PlaylistActions.REFRESH_ONE: {
								if (!action.media) {
									console.error(
										"There should be a media when CALLING 'refresh one'!",
									);
									break;
								}

								const oldMediaIndex = prevMediaList.findIndex(
									// eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
									({ path }) => path === action.media!.path,
								);

								if (oldMediaIndex === -1) {
									console.error(
										"I did not find a media when calling 'PlaylistActions.REFRESH_ONE'!",
									);
									break;
								}

								const newMediaWithCorrectIndex: Media = {
									...action.media,
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

				// eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
				const mediaList = playlists.find(
					({ name }) => name === "mediaList",
				)!.list;
				console.assert(mediaList);

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
					.map(playlist => playlists.some(({ name }) => name === playlist.name))
					.some(Boolean);

				if (isOneAlreadyCreated) return get().updatePlaylists(playlists);

				const newPlaylistArray: Playlist[] = [...prevPlaylistArray];

				for (const playlist of playlists) newPlaylistArray.push(playlist);

				dbg(
					"setPlaylists on 'create or update playlists'->'create'. New playlist =",
					newPlaylistArray,
				);

				set({ playlists: newPlaylistArray });
			},
			updatePlaylists: (playlists: readonly Playlist[]) => {
				const prevPlaylistArray = get().playlists;

				{
					// Assert there isn't a not-created playlist:
					let foundOneAlreadyCreated = true;
					for (const playlist of playlists)
						foundOneAlreadyCreated = prevPlaylistArray.some(
							({ name }) => name === playlist.name,
						);

					if (foundOneAlreadyCreated === false)
						return console.error(
							"One of the playlists I got was not already created. I'm not made to handle it's creation, only to update.\nplaylists received =",
							playlists,
							"\nexisting playlists =",
							prevPlaylistArray,
						);
				}

				const newPlaylistArray = [...prevPlaylistArray];
				for (const [prevIndex, prevPlaylist] of prevPlaylistArray.entries())
					for (const playlist of playlists)
						if (prevPlaylist.name === playlist.name)
							newPlaylistArray[prevIndex] = playlist;

				dbg(
					"setPlaylists on 'create or update playlists'->'update'. New playlist =",
					newPlaylistArray,
				);

				set({ playlists: newPlaylistArray });
			},
		}),
		{
			name: playlistsKey,
			serialize: state => JSON.stringify(state.state.playlists),
			partialize: state => ({ playlists: state.playlists }),
			deserialize: state => JSON.parse(state),
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

type UsePlaylistsActions = {
	searchLocalComputerForMedias: (force?: Readonly<boolean>) => Promise<void>;
	searchForMedia: (searchTerm: Readonly<string>) => readonly Media[];
	setPlaylists: (action: Readonly<PlaylistsReducer_Action>) => void;
	updatePlaylists: (playlists: readonly Playlist[]) => void;
	createPlaylist: (playlists: readonly Playlist[]) => void;
	deleteMedia: (media: Readonly<Media>) => Promise<void>;
	addListeners: (port: MessagePort) => MessagePort;
	playlists: readonly Playlist[];
};

export type DefaultLists =
	| "sorted by date"
	| "sorted by name"
	| "favorites"
	| "mediaList"
	| "history";

export type Playlist = Readonly<{
	list: readonly Media[];
	name: string;
}>;

export type PlaylistsReducer_Action =
	| Readonly<{
			whatToDo:
				| PlaylistActions.ADD_ONE_MEDIA
				| PlaylistActions.REMOVE_ONE_MEDIA
				| PlaylistActions.CLEAN;
			type: PlaylistEnum.UPDATE_FAVORITES;
			media: Media;
	  }>
	| Readonly<{
			whatToDo: PlaylistActions.ADD_ONE_MEDIA | PlaylistActions.CLEAN;
			type: PlaylistEnum.UPDATE_HISTORY;
			media?: Media;
	  }>
	| Readonly<{
			type: PlaylistEnum.UPDATE_MEDIA_LIST;
			whatToDo: PlaylistActions;
			list?: readonly Media[];
			media?: Media;
	  }>;

export enum PlaylistActions {
	REPLACE_ENTIRE_LIST,
	REMOVE_ONE_MEDIA,
	ADD_ONE_MEDIA,
	REFRESH_ONE,
	CLEAN,
}

export enum PlaylistEnum {
	UPDATE_MEDIA_LIST,
	UPDATE_FAVORITES,
	UPDATE_HISTORY,
}
