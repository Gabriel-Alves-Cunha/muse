import type { Media, Path } from "@common/@types/typesAndEnums";
import type { Dispatch } from "react";

import { useEffect, useReducer } from "react";

import { concatFromIndex, remove, replace, sort } from "@renderer/utils/array";
import { ListenToNotification } from "@common/@types/typesAndEnums";
import { assertUnreachable } from "@renderer/utils/utils";
import { useLocalStorage } from "@hooks";
import { keyPrefix } from "@renderer/utils/app";
import { dbg } from "@common/utils";
import {
	returnNewArrayWithNewMediaOnHistoryOfPlayedMedia,
	searchDirectoryResult,
	reaplyOrderedIndex,
	getAllowedMedias,
	getMediaFiles,
} from "./usePlaylistsHelper";
const {
	media: { transformPathsToMedias },
	fs: { rm },
} = electron;

const playlistsKey = keyPrefix + "playlists";

export function usePlaylists(): usePlaylistsReturnType {
	const [cachedPlaylists, setCachedPlaylists] = useLocalStorage<
		readonly Playlist[]
	>(playlistsKey, defaultPlaylists);

	const [playlists, dispatchPlaylists] = useReducer(
		playlistsReducer,
		cachedPlaylists,
	);

	function playlistsReducer(
		prevPlaylistArray: readonly Playlist[],
		action: PlaylistsReducer_Action,
	): readonly Playlist[] {
		switch (action.type) {
			case Type.CREATE_OR_UPDATE_PLAYLISTS: {
				const update = () => {
					const index = prevPlaylistArray.findIndex(
						({ name }) => name === action.name,
					);

					const updatedPlaylist: Playlist = {
						list: action.list,
						name: action.name,
					};
					const newPlaylistArray = replace(
						prevPlaylistArray,
						index,
						updatedPlaylist,
					);

					dbg(
						"playlistsReducer on 'create or update playlists'->'update'. New playlist =",
						newPlaylistArray,
					);
					setCachedPlaylists(newPlaylistArray);

					return newPlaylistArray;
				};

				const create = () => {
					const newPlaylistArray: readonly Playlist[] = [
						...prevPlaylistArray,
						{ list: action.list, name: action.name },
					];

					dbg(
						"playlistsReducer on 'create or update playlists'->'create'. New playlist =",
						newPlaylistArray,
					);
					setCachedPlaylists(newPlaylistArray);

					return newPlaylistArray;
				};

				const isOneAlreadyCreated = prevPlaylistArray.some(
					({ name }) => name === action.name,
				);

				return isOneAlreadyCreated ? update() : create();
				break;
			}

			case Type.UPDATE_HISTORY: {
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				const prevHistory = prevPlaylistArray.find(
					({ name }) => name === "history",
				)!.list;

				switch (action.whatToDo) {
					case Actions.ADD: {
						if (!action.media) {
							console.error(
								"There should be a media when calling 'add' on history!",
							);
							return prevPlaylistArray;
						}

						const newHistory = returnNewArrayWithNewMediaOnHistoryOfPlayedMedia(
							prevHistory,
							action.media,
						);

						dbg(
							"playlistsReducer on 'update history'->'add'. newHistory =",
							newHistory,
						);

						if (newHistory === prevHistory) return prevPlaylistArray;

						return playlistsReducer(prevPlaylistArray, {
							type: Type.CREATE_OR_UPDATE_PLAYLISTS,
							list: newHistory,
							name: "history",
						});
						break;
					}

					case Actions.CLEAN: {
						dbg(
							"playlistsReducer on 'update history'->'clean'. newHistory = []",
						);

						return playlistsReducer(prevPlaylistArray, {
							type: Type.CREATE_OR_UPDATE_PLAYLISTS,
							name: "history",
							list: [],
						});
						break;
					}

					default:
						return assertUnreachable(action);
				}
			}

			case Type.UPDATE_FAVORITES: {
				// eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
				const prevFavorites = prevPlaylistArray.find(
					({ name }) => name === "favorites",
				)!.list;

				switch (action.whatToDo) {
					case Actions.ADD: {
						const newFavorites = [
							...prevFavorites,
							{
								...action.media,
								index: prevFavorites.length,
							},
						];

						dbg(
							"playlistsReducer on 'update favorites'->'add'. newFavorites =",
							newFavorites,
						);

						return playlistsReducer(prevPlaylistArray, {
							type: Type.CREATE_OR_UPDATE_PLAYLISTS,
							list: newFavorites,
							name: "favorites",
						});
						break;
					}

					case Actions.REMOVE: {
						const newFavorites = reaplyOrderedIndex(
							remove(prevFavorites, action.media.index),
						);

						dbg(
							"playlistsReducer on 'update favorites'->'remove'. newFavorites =",
							newFavorites,
						);

						return playlistsReducer(prevPlaylistArray, {
							type: Type.CREATE_OR_UPDATE_PLAYLISTS,
							list: newFavorites,
							name: "favorites",
						});
						break;
					}

					case Actions.CLEAN: {
						dbg(
							"playlistsReducer on 'update favorites'->'clean'. newFavorites = []",
						);

						return playlistsReducer(prevPlaylistArray, {
							type: Type.CREATE_OR_UPDATE_PLAYLISTS,
							name: "favorites",
							list: [],
						});
						break;
					}

					default:
						return assertUnreachable(action);
				}
				break;
			}

			case Type.UPDATE_MEDIA_LIST: {
				// eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
				const prevMediaList = prevPlaylistArray.find(
					({ name }) => name === "mediaList",
				)!.list;

				const updateSortedListsAndFinish = (newMediaList: readonly Media[]) => {
					const previousPlaylistList_1 = playlistsReducer(prevPlaylistArray, {
						type: Type.CREATE_OR_UPDATE_PLAYLISTS,
						list: sortByDate(newMediaList),
						name: "sorted by date",
					});
					const previousPlaylistList_2 = playlistsReducer(
						previousPlaylistList_1,
						{
							type: Type.CREATE_OR_UPDATE_PLAYLISTS,
							list: sortByName(newMediaList),
							name: "sorted by name",
						},
					);

					return playlistsReducer(previousPlaylistList_2, {
						type: Type.CREATE_OR_UPDATE_PLAYLISTS,
						list: newMediaList,
						name: "mediaList",
					});
				};

				switch (action.whatToDo) {
					case Actions.ADD: {
						if (!action.media) {
							console.error("There should be a media when calling 'add'!");
							return prevPlaylistArray;
						}

						const newMediaList = [
							...prevMediaList,
							{
								...action.media,
								index: prevMediaList.length,
							},
						];

						dbg(
							"playlistsReducer on 'update mediaList'->'add' (yet to be sorted). newMediaList =",
							newMediaList,
						);

						return updateSortedListsAndFinish(newMediaList);
						break;
					}

					case Actions.REMOVE: {
						if (!action.media) {
							console.error("There should be a media when calling 'remove'!");
							return prevPlaylistArray;
						}

						const newMediaList = reaplyOrderedIndex(
							remove(prevMediaList, action.media.index),
						);

						dbg(
							"playlistsReducer on 'update mediaList'->'remove' (yet to be sorted). newMediaList =",
							newMediaList,
						);

						return updateSortedListsAndFinish(newMediaList);
						break;
					}

					case Actions.NEW_LIST: {
						if (!action.list) {
							console.error("There should be a list when calling 'new list'!");
							return prevPlaylistArray;
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
							"playlistsReducer on 'update mediaList'->'new list' (yet to be sorted). newMediaList =",
							newMediaList,
						);

						return updateSortedListsAndFinish(newMediaList);
						break;
					}

					case Actions.REFRESH_ONE: {
						if (!action.media) {
							console.error(
								"There should be a media when CALLING 'refresh one'!",
							);
							return prevPlaylistArray;
						}

						const oldMediaIndex = prevMediaList.findIndex(
							// eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
							({ path }) => path === action.media!.path,
						);

						if (oldMediaIndex === -1) {
							console.error(
								"There should be a not-refreshed media when CALLING 'refresh one' but I did not find one!",
							);
							return prevPlaylistArray;
						}

						const newMediaWithRightIndex: Media = {
							...action.media,
							index: oldMediaIndex,
						};

						const newMediaList = replace(
							prevMediaList,
							oldMediaIndex,
							newMediaWithRightIndex,
						);

						dbg(
							"playlistsReducer on 'update mediaList'->'refresh one'. newMediaWithRightIndex =",
							newMediaWithRightIndex,
							"\nnewMediaList =",
							newMediaList,
						);

						return playlistsReducer(prevPlaylistArray, {
							type: Type.CREATE_OR_UPDATE_PLAYLISTS,
							list: newMediaList,
							name: "mediaList",
						});
						break;
					}

					case Actions.CLEAN: {
						dbg(
							"playlistsReducer on 'update mediaList'->'clean' (yet to be sorted). newMediaList = []",
						);

						return updateSortedListsAndFinish([]);
						break;
					}

					default:
						return assertUnreachable(action);
				}
				break;
			}

			default:
				return assertUnreachable(action);
		}
	}

	////////////////////////////////////////////////////////////////////////
	/////////////////////////  General fns  ////////////////////////////////
	////////////////////////////////////////////////////////////////////////
	const searchForMedia = (searchTerm: string): readonly Media[] => {
		console.time("Searching for file");
		// eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
		const mediaList = playlists.find(({ name }) => name === "mediaList")!.list;

		const results = mediaList.filter(({ title }) =>
			title.toLowerCase().includes(searchTerm.toLowerCase()),
		);
		console.timeEnd("Searching for file");

		return results;
	};

	async function searchLocalComputerForMedias(force = false) {
		// eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
		const mediaList = playlists.find(({ name }) => name === "mediaList")!.list;

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
				dispatchPlaylists({
					type: Type.UPDATE_MEDIA_LIST,
					whatToDo: Actions.NEW_LIST,
					list: newMediaList,
				});
			}
		} catch (error) {
			console.error(error);
		}
	}

	async function deleteMedia(media: Media) {
		await rm(media.path);

		dispatchPlaylists({
			type: Type.UPDATE_MEDIA_LIST,
			whatToDo: Actions.REMOVE,
			media,
		});
	}

	function addListeners(port: MessagePort) {
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
						console.error("There should be a path if you want to add a media!");
						break;
					}

					const media: Media = (await transformPathsToMedias([path]))[0];

					if (!media) {
						console.error(`Could not transform "${path}" to media.`);
						break;
					}

					dispatchPlaylists({
						type: Type.UPDATE_MEDIA_LIST,
						whatToDo: Actions.ADD,
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
					const media = playlists
						.find(({ name }) => name === "mediaList")!
						.list.find(({ path: path_ }) => path_ === path);

					if (media) {
						deleteMedia(media);
						console.log(`Media "${media}" deleted.`);
					}
					break;
				}

				case ListenToNotification.REFRESH_ALL_MEDIA: {
					await searchLocalComputerForMedias(true);
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
					const mediaIndex = playlists
						.find(({ name }) => name === "mediaList")!
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

					dispatchPlaylists({
						whatToDo: Actions.REFRESH_ONE,
						type: Type.UPDATE_MEDIA_LIST,
						media: refreshedMedia,
					});
					break;
				}

				case ListenToNotification.REMOVE_MEDIA: {
					// eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
					const media = playlists
						.find(({ name }) => name === "mediaList")!
						.list.find(({ path: path_ }) => path_ === path);

					if (!media) {
						console.error(
							`I wasn't able to find this path (${path}) to a media to be removed!`,
						);
						break;
					}

					dispatchPlaylists({
						type: Type.UPDATE_MEDIA_LIST,
						whatToDo: Actions.REMOVE,
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
	}

	useEffect(() => {
		(async () => await searchLocalComputerForMedias())();

		////////////////////////////////////////////////////////////////////////
		////////////////////////////////////////////////////////////////////////
		////////////////////////////////////////////////////////////////////////

		const { port1: reactPort, port2: electronPort } = new MessageChannel();

		window.twoWayComm_React_Electron = addListeners(reactPort);

		dbg("Sending 'async two way comm' to Electron side.");
		window.postMessage("async two way comm", "*", [electronPort]);

		////////////////////////////////////////////////////////////////////////
		////////////////////////////////////////////////////////////////////////
		////////////////////////////////////////////////////////////////////////

		// listen for files drop
		function listenToDragoverEvent(event: DragEvent) {
			event.stopPropagation();
			event.preventDefault();

			if (!event.dataTransfer) return;

			event.dataTransfer.dropEffect = "copy";
			// ^ Style the drag-and-drop as a "copy file" operation.
		}
		window.addEventListener("dragover", listenToDragoverEvent);

		function listenToDropEvent(event: DragEvent) {
			event.stopPropagation();
			event.preventDefault();

			if (!event.dataTransfer) return;

			const fileList = event.dataTransfer.files;
			console.log("fileList =", fileList);

			const files = getMediaFiles(fileList);

			console.error("@TODO: handle these files droped!", files);
		}
		window.addEventListener("drop", listenToDropEvent);

		return () => {
			window.removeEventListener("dragover", listenToDragoverEvent);
			window.removeEventListener("drop", listenToDropEvent);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return {
		searchLocalComputerForMedias,
		dispatchPlaylists,
		searchForMedia,
		deleteMedia,
		playlists,
	} as const;
}

usePlaylists.whyDidYouRender = {
	logOnDifferentValues: false,
	customName: "usePlaylists",
};

const sortByDate = (list: readonly Media[]): readonly Media[] =>
	reaplyOrderedIndex(
		sort(list, (a, b) => {
			if (a.dateOfArival > b.dateOfArival) return 1;
			if (a.dateOfArival < b.dateOfArival) return -1;
			// a must be equal to b:
			return 0;
		}),
	);

const sortByName = (list: readonly Media[]): readonly Media[] =>
	reaplyOrderedIndex(
		sort(list, (a, b) => {
			if (a.title > b.title) return 1;
			if (a.title < b.title) return -1;
			// a must be equal to b:
			return 0;
		}),
	);

export const defaultPlaylists: readonly Playlist[] = [
	{ name: "sorted by date", list: [] },
	{ name: "sorted by name", list: [] },
	{ name: "favorites", list: [] },
	{ name: "mediaList", list: [] },
	{ name: "history", list: [] },
	{ name: "none", list: [] },
];

export type DefaultLists =
	| "sorted by date"
	| "sorted by name"
	| "favorites"
	| "mediaList"
	| "history";

type usePlaylistsReturnType = Readonly<{
	searchLocalComputerForMedias(force?: boolean): Promise<void>;
	dispatchPlaylists: Dispatch<PlaylistsReducer_Action>;
	searchForMedia(searchTerm: string): readonly Media[];
	deleteMedia(media: Media): Promise<void>;
	playlists: readonly Playlist[];
}>;

export type Playlist = Readonly<{
	list: readonly Media[];
	name: string;
}>;

export type PlaylistsReducer_Action =
	| Readonly<{
			whatToDo: Exclude<Actions, Actions.CREATE_OR_UPDATE_PLAYLISTS>;
			type: Type.UPDATE_MEDIA_LIST;
			list?: readonly Media[];
			media?: Media;
	  }>
	| Readonly<{
			whatToDo: Actions.ADD | Actions.REMOVE | Actions.CLEAN;
			type: Type.UPDATE_FAVORITES;
			media: Media;
	  }>
	| Readonly<{
			type: Type.CREATE_OR_UPDATE_PLAYLISTS;
			list: readonly Media[];
			name: string;
	  }>
	| Readonly<{
			whatToDo: Actions.ADD | Actions.CLEAN;
			type: Type.UPDATE_HISTORY;
			media?: Media;
	  }>;

export enum Actions {
	CREATE_OR_UPDATE_PLAYLISTS,
	REFRESH_ONE,
	NEW_LIST,
	REMOVE,
	CLEAN,
	ADD,
}

export enum Type {
	CREATE_OR_UPDATE_PLAYLISTS,
	UPDATE_MEDIA_LIST,
	UPDATE_FAVORITES,
	UPDATE_HISTORY,
}
