import { add2end } from "./../../utils/arrayMutations";
import type { Media, Mutable, Path } from "@common/@types/typesAndEnums";

import { persist } from "zustand/middleware";
import create from "zustand";
import merge from "deepmerge";

import { concatFromIndex, remove, replace, sort } from "@utils/array";
import { ListenToNotification } from "@common/@types/typesAndEnums";
import { assertUnreachable } from "@utils/utils";
import { dbg, immer } from "@common/utils";
import { keyPrefix } from "@utils/app";
import {
	returnNewArrayWithNewMediaOnHistoryOfPlayedMedia,
	searchDirectoryResult,
	reaplyOrderedIndex,
	getAllowedMedias,
} from "./usePlaylistsHelper";
import { updatedByIndex } from "@utils/arrayMutations";

const {
	media: { transformPathsToMedias },
	fs: { rm },
} = electron;

const playlistsKey = keyPrefix + "playlists";

export const defaultPlaylists: Playlist[] = [
	{ name: "sorted by date", list: [] },
	{ name: "sorted by name", list: [] },
	{ name: "favorites", list: [] },
	{ name: "mediaList", list: [] },
	{ name: "history", list: [] },
	{ name: "none", list: [] },
];

export const usePlaylists = create<UsePlaylistsActions>(
	persist(
		immer((set, get) => ({
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
						case ListenToNotification.ADD_MEDIA: {
							if (!path) {
								console.error(
									"There should be a path if you want to add a media!",
								);
								break;
							}

							const media: Media = (await transformPathsToMedias([path]))[0];

							if (!media) {
								console.error(`Could not transform "${path}" to media.`);
								break;
							}

							get().setPlaylists({
								type: PlaylistType.UPDATE_MEDIA_LIST,
								whatToDo: PlaylistActions.ADD,
								media,
							});
							break;
						}

						case ListenToNotification.DEL_MEDIA: {
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
							await get().searchLocalComputerForMedias(true);
							break;
						}

						case ListenToNotification.REFRESH_MEDIA: {
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
								console.error(
									`There should be a media with path = "${path}" to be refreshed, but there isn't!`,
								);
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
								type: PlaylistType.UPDATE_MEDIA_LIST,
								media: refreshedMedia,
							});
							break;
						}

						case ListenToNotification.REMOVE_MEDIA: {
							// eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
							const media = get()
								.playlists.find(({ name }) => name === "mediaList")!
								.list.find(({ path: path_ }) => path_ === path);

							if (!media) {
								console.error(
									`I wasn't able to find this path (${path}) to a media to be removed!`,
								);
								break;
							}

							get().setPlaylists({
								type: PlaylistType.UPDATE_MEDIA_LIST,
								whatToDo: PlaylistActions.REMOVE,
								media,
							});
							break;
						}

						default: {
							console.error(`There is no function to handle this case: ${msg}`);
							break;
						}
					}
				};

				return port;
			},
			deleteMedia: async (media: Media) => {
				await rm(media.path);

				get().setPlaylists({
					type: PlaylistType.UPDATE_MEDIA_LIST,
					whatToDo: PlaylistActions.REMOVE,
					media,
				});
			},
			searchForMedia: (searchTerm: string) => {
				const playlists = get().playlists;

				console.time("Searching for file");
				// eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
				const mediaList = playlists.find(
					({ name }) => name === "mediaList",
				)!.list;
				console.assert(mediaList);

				const results = mediaList.filter(({ title }) =>
					title.toLowerCase().includes(searchTerm.toLowerCase()),
				);
				console.timeEnd("Searching for file");

				return results;
			},
			setPlaylists: (action: PlaylistsReducer_Action) => {
				const prevPlaylistArray = get().playlists;

				switch (action.type) {
					case PlaylistType.UPDATE_HISTORY: {
						// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
						const prevHistory = prevPlaylistArray.find(
							({ name }) => name === "history",
						)!.list;
						console.assert(prevHistory);

						switch (action.whatToDo) {
							case PlaylistActions.ADD: {
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

								get().createOrUpdatePlaylists(newHistory, "history");
								break;
							}

							case PlaylistActions.CLEAN: {
								dbg(
									"setPlaylists on 'update history'->'clean'. newHistory = []",
								);

								get().createOrUpdatePlaylists([], "history");
								break;
							}

							default: {
								assertUnreachable(action);
								break;
							}
						}
						break;
					}

					case PlaylistType.UPDATE_FAVORITES: {
						// eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
						const prevFavorites = prevPlaylistArray.find(
							({ name }) => name === "favorites",
						)!.list;
						console.assert(prevFavorites);

						switch (action.whatToDo) {
							case PlaylistActions.ADD: {
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

								get().createOrUpdatePlaylists(newFavorites, "favorites");
								break;
							}

							case PlaylistActions.REMOVE: {
								const newFavorites = reaplyOrderedIndex(
									remove(prevFavorites, action.media.index),
								);

								dbg(
									"setPlaylists on 'update favorites'->'remove'. newFavorites =",
									newFavorites,
								);

								get().createOrUpdatePlaylists(newFavorites, "favorites");
								break;
							}

							case PlaylistActions.CLEAN: {
								dbg(
									"setPlaylists on 'update favorites'->'clean'. newFavorites = []",
								);

								get().createOrUpdatePlaylists([], "favorites");
								break;
							}

							default: {
								assertUnreachable(action);
								break;
							}
						}
						break;
					}

					case PlaylistType.UPDATE_MEDIA_LIST: {
						// eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
						const prevMediaList = prevPlaylistArray.find(
							({ name }) => name === "mediaList",
						)!.list;

						const updateSortedListsAndFinish = (
							newMediaList: readonly Media[],
						) => {
							// get().createOrUpdatePlaylists(
							// 	sortByDate(newMediaList),
							// 	"sorted by date",
							// );
							// get().createOrUpdatePlaylists(
							// 	sortByName(newMediaList),
							// 	"sorted by name",
							// );
							// get().createOrUpdatePlaylists(newMediaList, "mediaList");

							set(({ playlists }) => {
								playlists.forEach((value, index, arr) => {
									if (value.name === "sorted by date") {
										updatedByIndex(arr, index, {
											list: sortByDate(newMediaList) as Mutable<Media[]>,
											name: "sorted by date",
										});
									} else if (value.name === "sorted by name") {
										updatedByIndex(arr, index, {
											list: sortByName(newMediaList) as Mutable<Media[]>,
											name: "sorted by name",
										});
									} else if (value.name === "mediaList") {
										updatedByIndex(arr, index, {
											list: newMediaList as Mutable<Media[]>,
											name: "mediaList",
										});
									}
								});
							});
						};

						switch (action.whatToDo) {
							case PlaylistActions.ADD: {
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

							case PlaylistActions.REMOVE: {
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

							case PlaylistActions.NEW_LIST: {
								if (!action.list) {
									console.error(
										"There should be a list when calling 'new list'!",
									);
									break;
								}

								const updatedButWithOriginalDateOfArival = prevMediaList
									.map((prevMedia, index) =>
										prevMedia.dateOfArival
											? {
													// eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
													...action.list![index],
													dateOfArival: prevMedia.dateOfArival,
											  }
											: // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
											  action.list![index],
									)
									.filter(({ path }) => path);

								const newMediaList = reaplyOrderedIndex(
									concatFromIndex(
										updatedButWithOriginalDateOfArival,
										updatedButWithOriginalDateOfArival.length,
										action.list,
									),
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
							type: PlaylistType.UPDATE_MEDIA_LIST,
							whatToDo: PlaylistActions.NEW_LIST,
							list: newMediaList,
						});
					}
				} catch (error) {
					console.error(error);
				}
			},
			createOrUpdatePlaylists: (list: Media[], name: string) => {
				const prevPlaylistArray = get().playlists;

				const update = () => {
					const index = prevPlaylistArray.findIndex(
						({ name: name_ }) => name_ === name,
					);

					const newPlaylistArray = updatedByIndex(prevPlaylistArray, index, {
						name,
						list,
					});

					dbg(
						"setPlaylists on 'create or update playlists'->'update'. New playlist =",
						newPlaylistArray,
					);

					set(state => (state.playlists = newPlaylistArray));
				};

				const create = () => {
					const newPlaylistArray = add2end(prevPlaylistArray, { list, name });

					dbg(
						"setPlaylists on 'create or update playlists'->'create'. New playlist =",
						newPlaylistArray,
					);

					set(state => (state.playlists = newPlaylistArray));
				};

				const isOneAlreadyCreated = prevPlaylistArray.some(
					({ name: name_ }) => name_ === name,
				);

				isOneAlreadyCreated ? update() : create();
			},
		})),
		{
			name: playlistsKey,
			serialize: state => JSON.stringify(state.state.playlists),
			deserialize: state => JSON.parse(state),
			partialize: state => ({ playlists: state.playlists }),
			merge: (persistedState, currentState) =>
				merge(persistedState, currentState),
		},
	),
);

type T1 = Readonly<{ dateOfArival: number; index: number }>;
type ListWithDateAndOrder<T extends T1> = ReadonlyArray<T>;

const sortByDate = <T extends T1>(
	list: ListWithDateAndOrder<T>,
): ListWithDateAndOrder<T> =>
	reaplyOrderedIndex(
		sort(list, (a, b) => {
			if (a.dateOfArival > b.dateOfArival) return 1;
			if (a.dateOfArival < b.dateOfArival) return -1;
			// a must be equal to b:
			return 0;
		}),
	) as ListWithDateAndOrder<T>;

type T2 = Readonly<{ title: string; index: number }>;
type ListWithNameAndOrder<T extends T2> = ReadonlyArray<T>;

const sortByName = <T extends T2>(
	list: ListWithNameAndOrder<T>,
): ListWithNameAndOrder<T> =>
	reaplyOrderedIndex(
		sort(list, (a, b) => {
			if (a.title > b.title) return 1;
			if (a.title < b.title) return -1;
			// a must be equal to b:
			return 0;
		}),
	) as unknown as ListWithNameAndOrder<T>;

type UsePlaylistsActions = {
	createOrUpdatePlaylists: (list: Media[], name: string) => void;
	searchLocalComputerForMedias: (force?: boolean) => Promise<void>;
	searchForMedia: (searchTerm: string) => readonly Media[];
	setPlaylists: (action: PlaylistsReducer_Action) => void;
	addListeners: (port: MessagePort) => MessagePort;
	deleteMedia: (media: Media) => Promise<void>;
	playlists: Playlist[];
};

export type DefaultLists =
	| "sorted by date"
	| "sorted by name"
	| "favorites"
	| "mediaList"
	| "history";

export type Playlist = {
	list: Media[];
	name: string;
};

export type PlaylistsReducer_Action =
	| Readonly<{
			whatToDo:
				| PlaylistActions.ADD
				| PlaylistActions.REMOVE
				| PlaylistActions.CLEAN;
			type: PlaylistType.UPDATE_FAVORITES;
			media: Media;
	  }>
	| Readonly<{
			whatToDo: PlaylistActions.ADD | PlaylistActions.CLEAN;
			type: PlaylistType.UPDATE_HISTORY;
			media?: Media;
	  }>
	| Readonly<{
			type: PlaylistType.UPDATE_MEDIA_LIST;
			list?: readonly Media[];
			whatToDo: PlaylistActions;
			media?: Media;
	  }>;

export enum PlaylistActions {
	REFRESH_ONE,
	NEW_LIST,
	REMOVE,
	CLEAN,
	ADD,
}

export enum PlaylistType {
	UPDATE_MEDIA_LIST,
	UPDATE_FAVORITES,
	UPDATE_HISTORY,
}
