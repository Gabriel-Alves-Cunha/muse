import type { ListenToNotification } from "@common/@types/electron-window";
import type { Media, Path } from "@common/@types/types";

import { useEffect, useReducer } from "react";

import { concatFromIndex, remove, replace, sort } from "@renderer/utils/array";
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
		const { type } = action;

		switch (type) {
			case "create or update playlists": {
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

			case "update history": {
				// eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
				const prevHistory = prevPlaylistArray.find(
					({ name }) => name === "history",
				)?.list;
				if (!prevHistory) {
					console.error("There should be a previous history!!");
					return prevPlaylistArray;
				}

				const { whatToDo } = action;
				switch (whatToDo) {
					case "add": {
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
							type: "create or update playlists",
							list: newHistory,
							name: "history",
						});
						break;
					}

					case "clean": {
						dbg(
							"playlistsReducer on 'update history'->'clean'. newHistory = []",
						);

						return playlistsReducer(prevPlaylistArray, {
							type: "create or update playlists",
							name: "history",
							list: [],
						});
						break;
					}

					default:
						return assertUnreachable(whatToDo);
				}
			}

			case "update favorites": {
				// eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
				const prevFavorites = prevPlaylistArray.find(
					({ name }) => name === "favorites",
				)!.list;

				const { whatToDo } = action;
				switch (whatToDo) {
					case "add": {
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
							type: "create or update playlists",
							list: newFavorites,
							name: "favorites",
						});
						break;
					}

					case "remove": {
						const newFavorites = reaplyOrderedIndex(
							remove(prevFavorites, action.media.index),
						);

						dbg(
							"playlistsReducer on 'update favorites'->'remove'. newFavorites =",
							newFavorites,
						);

						return playlistsReducer(prevPlaylistArray, {
							type: "create or update playlists",
							list: newFavorites,
							name: "favorites",
						});
						break;
					}

					case "clean": {
						dbg(
							"playlistsReducer on 'update favorites'->'clean'. newFavorites = []",
						);

						return playlistsReducer(prevPlaylistArray, {
							type: "create or update playlists",
							name: "favorites",
							list: [],
						});
						break;
					}

					default:
						return assertUnreachable(whatToDo);
				}
				break;
			}

			case "update mediaList": {
				// eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
				const prevMediaList = prevPlaylistArray.find(
					({ name }) => name === "mediaList",
				)!.list;

				const updateSortedListsAndFinish = (newMediaList: readonly Media[]) => {
					const previousPlaylistList_1 = playlistsReducer(prevPlaylistArray, {
						type: "create or update playlists",
						list: sortByDate(newMediaList),
						name: "sorted by date",
					});
					const previousPlaylistList_2 = playlistsReducer(
						previousPlaylistList_1,
						{
							type: "create or update playlists",
							list: sortByName(newMediaList),
							name: "sorted by name",
						},
					);

					return playlistsReducer(previousPlaylistList_2, {
						type: "create or update playlists",
						list: newMediaList,
						name: "mediaList",
					});
				};

				const { whatToDo } = action;
				switch (whatToDo) {
					case "add": {
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

					case "remove": {
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

					case "new list": {
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

					case "refresh one": {
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
							type: "create or update playlists",
							list: newMediaList,
							name: "mediaList",
						});
						break;
					}

					case "clean": {
						dbg(
							"playlistsReducer on 'update mediaList'->'clean' (yet to be sorted). newMediaList = []",
						);

						return updateSortedListsAndFinish([]);
						break;
					}

					default:
						return assertUnreachable(whatToDo);
				}
				break;
			}

			default:
				return assertUnreachable(type);
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
			dbg(
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
					type: "update mediaList",
					whatToDo: "new list",
					list: newMediaList,
				});
			}
		} catch (error) {
			console.error(error);
		}
	}

	async function deleteMedia(media: Media) {
		await rm(media.path);

		dispatchPlaylists({ type: "update mediaList", whatToDo: "remove", media });
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
				case "add media": {
					if (!path) {
						console.error("There should be a path if you want to add a media!");
						break;
					}

					const media: Media = (await transformPathsToMedias([path]))[0];

					dispatchPlaylists({
						type: "update mediaList",
						whatToDo: "add",
						media,
					});
					break;
				}

				case "del media": {
					if (!path) {
						console.error(
							"There should be a path if you want to remove a media!",
						);
						break;
					}

					// eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
					const media = playlists
						.find(({ name }) => name === "mediaList")!
						.list.find(({ path: path_ }) => path_ === path);

					media && deleteMedia(media);
					break;
				}

				case "refresh-all-media": {
					await searchLocalComputerForMedias(true);
					break;
				}

				case "refresh media": {
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
						type: "update mediaList",
						whatToDo: "refresh one",
						media: refreshedMedia,
					});
					break;
				}

				case "remove media": {
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
						type: "update mediaList",
						whatToDo: "remove",
						media,
					});

					break;
				}

				default:
					assertUnreachable(msg);
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

type usePlaylistsReturnType = Readonly<{
	searchLocalComputerForMedias(force?: boolean): Promise<void>;
	dispatchPlaylists: React.Dispatch<PlaylistsReducer_Action>;
	searchForMedia(searchTerm: string): readonly Media[];
	deleteMedia(media: Media): Promise<void>;
	playlists: readonly Playlist[];
}>;

const defaultLists = [
	"sorted by date",
	"sorted by name",
	"favorites",
	"mediaList",
	"history",
] as const;
const temp: Playlist[] = defaultLists.map(name => ({ name, list: [] }));
temp.push({ name: "none", list: [] });
export const defaultPlaylists: readonly Playlist[] = temp;
export type DefaultLists = typeof defaultLists[number];

export type Playlist = Readonly<{
	list: readonly Media[];
	name: string;
}>;

export type PlaylistsReducer_Action =
	| Readonly<{
			type: "create or update playlists";
			list: readonly Media[];
			name: string;
	  }>
	| Readonly<{
			whatToDo: "add" | "remove" | "clean";
			type: "update favorites";
			media: Media;
	  }>
	| Readonly<{
			whatToDo: "add" | "remove" | "new list" | "refresh one" | "clean";
			type: "update mediaList";
			list?: readonly Media[];
			media?: Media;
	  }>
	| Readonly<{
			whatToDo: "add" | "clean";
			type: "update history";
			media?: Media;
	  }>;
