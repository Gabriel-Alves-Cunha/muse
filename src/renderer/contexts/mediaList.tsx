import type { ListenToNotification } from "@common/@types/electron-window";
import type { Media, Path } from "@common/@types/types";
import type {
	currentPlayingReducer_Action,
	PlaylistsReducer_Action,
	MediaList_ProviderProps,
	MediaList_ContextProps,
	PlayOptions_Action,
	CurrentPlaying,
	PlayOptions,
	Playlist,
} from "./types";

import { createContext, useContext, useReducer, useEffect } from "react";

import { concatFromIndex, remove, replace, sort } from "@utils/array";
import { assertUnreachable, getRandomInt } from "@utils/utils";
import { useLocalStorage } from "@hooks";
import { dbg } from "@utils/app";
import {
	returnNewArrayWithNewMediaOnHistoryOfPlayedMedia,
	searchDirectoryResult,
	defaultCurrentPlaying,
	reaplyOrderedIndex,
	defaultPlaylists,
	getAllowedMedias,
	getMediaFiles,
} from "./mediaListHelper";
const {
	media: { transformPathsToMedias },
	fs: { readFile, rm },
} = electron;

const MediaList_Context = createContext({} as MediaList_ContextProps);

const keyPrefix = "@muse:";
const playlistsKey = keyPrefix + "playlists";
const playOptionsKey = keyPrefix + "play_options";
const currentPlayingKey = keyPrefix + "current_playing";

function MediaList_Provider({ children }: MediaList_ProviderProps) {
	////////////////////////////////////////////////////////////////////////
	//////////////////////////////  CACHES  ////////////////////////////////
	////////////////////////////////////////////////////////////////////////
	const [cachedCurrentPlaying, setCachedCurrentPlaying] = useLocalStorage(
		currentPlayingKey,
		defaultCurrentPlaying
	);

	const [cachedPlaylists, setCachedPlaylists] = useLocalStorage<
		readonly Playlist[]
	>(playlistsKey, defaultPlaylists);

	const [cachedPlayOptions, setCachedPlayOptions] =
		useLocalStorage<PlayOptions>(playOptionsKey, {
			loopThisMedia: false,
			repeatAllMedia: true,
			isRandom: false,
			isPaused: true,
			muted: false,
		});

	////////////////////////////////////////////////////////////////////////
	//////////////////////////////  REDUCERS  //////////////////////////////
	////////////////////////////////////////////////////////////////////////
	const [playOptions, dispatchPlayOptions] = useReducer(
		playOptionsReducer,
		cachedPlayOptions
	);

	function playOptionsReducer(
		previousPlayOptions: PlayOptions,
		action: PlayOptions_Action
	): PlayOptions {
		const { type } = action;

		switch (type) {
			case "loop this media": {
				const newPlayOptions: PlayOptions = {
					...previousPlayOptions,
					loopThisMedia: action.value,
				};

				(document.getElementById("audio") as HTMLAudioElement).loop =
					action.value;

				setCachedPlayOptions(newPlayOptions);

				return newPlayOptions;
				break;
			}

			case "repeat all media": {
				const newPlayOptions: PlayOptions = {
					...previousPlayOptions,
					repeatAllMedia: action.value,
				};

				setCachedPlayOptions(newPlayOptions);

				return newPlayOptions;
				break;
			}

			case "muted": {
				const newPlayOptions: PlayOptions = {
					...previousPlayOptions,
					muted: action.value,
				};

				console.time("doc get audio");
				(document.getElementById("audio") as HTMLAudioElement).muted =
					action.value;
				console.timeEnd("doc get audio");

				return newPlayOptions;
				break;
			}

			case "is paused": {
				const newPlayOptions: PlayOptions = {
					...previousPlayOptions,
					isPaused: action.value,
				};

				return newPlayOptions;
				break;
			}

			case "is random": {
				const newPlayOptions: PlayOptions = {
					...previousPlayOptions,
					isRandom: action.value,
				};

				setCachedPlayOptions(newPlayOptions);

				return newPlayOptions;
				break;
			}

			default:
				return assertUnreachable(type);
		}
	}

	////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////
	const [playlists, dispatchPlaylists] = useReducer(
		playlistsReducer,
		cachedPlaylists
	);

	function playlistsReducer(
		arrayOfpreviousPlaylist: readonly Playlist[],
		action: PlaylistsReducer_Action
	): readonly Playlist[] {
		const { type } = action;

		switch (type) {
			case "create or update playlists": {
				const { list, name } = action;

				const update = () => {
					const index = arrayOfpreviousPlaylist.findIndex(
						prev => prev.name === name
					);

					const updatedPlaylist: Playlist = { list, name };
					const newPlaylistList = replace(
						arrayOfpreviousPlaylist,
						index,
						updatedPlaylist
					);

					dbg("playlistsReducer on 'update'. New playlist =", newPlaylistList);
					setCachedPlaylists(newPlaylistList);

					return newPlaylistList;
				};

				const create = () => {
					const newPlaylistList: readonly Playlist[] = [
						...arrayOfpreviousPlaylist,
						{ name, list },
					];

					dbg("playlistsReducer on 'create'. New playlist =", newPlaylistList);
					setCachedPlaylists(newPlaylistList);

					return newPlaylistList;
				};

				const isOneAlreadyCreated = arrayOfpreviousPlaylist.some(
					({ name }) => name === action.name
				);

				return isOneAlreadyCreated ? update() : create();
				break;
			}

			case "update history": {
				// eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
				const prevHistory = arrayOfpreviousPlaylist.find(
					({ name }) => name === "history"
				)!.list;

				const { whatToDo } = action;
				switch (whatToDo) {
					case "add": {
						if (!action.media) {
							console.error(
								"There should be a media when calling 'add' on history!"
							);
							return arrayOfpreviousPlaylist;
						}

						const newHistory = returnNewArrayWithNewMediaOnHistoryOfPlayedMedia(
							prevHistory,
							action.media
						);

						if (newHistory === prevHistory) return arrayOfpreviousPlaylist;

						return playlistsReducer(arrayOfpreviousPlaylist, {
							type: "create or update playlists",
							list: newHistory,
							name: "history",
						});
						break;
					}

					case "clean": {
						return playlistsReducer(arrayOfpreviousPlaylist, {
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
				const prevFavorites = arrayOfpreviousPlaylist.find(
					({ name }) => name === "favorites"
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

						return playlistsReducer(arrayOfpreviousPlaylist, {
							type: "create or update playlists",
							list: newFavorites,
							name: "favorites",
						});
						break;
					}

					case "remove": {
						const newFavorites = reaplyOrderedIndex(
							remove(prevFavorites, action.media.index)
						);

						return playlistsReducer(arrayOfpreviousPlaylist, {
							type: "create or update playlists",
							list: newFavorites,
							name: "favorites",
						});
						break;
					}

					case "clean": {
						return playlistsReducer(arrayOfpreviousPlaylist, {
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
				const prevMediaList = arrayOfpreviousPlaylist.find(
					({ name }) => name === "mediaList"
				)!.list;

				const updateSortedListsAndFinish = (newMediaList: readonly Media[]) => {
					const previousPlaylistList_1 = playlistsReducer(
						arrayOfpreviousPlaylist,
						{
							type: "update sorted by date",
							list: newMediaList,
						}
					);
					const previousPlaylistList_2 = playlistsReducer(
						previousPlaylistList_1,
						{
							type: "update sorted by name",
							list: newMediaList,
						}
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
							return arrayOfpreviousPlaylist;
						}

						const newMediaList = [
							...prevMediaList,
							{
								...action.media,
								index: prevMediaList.length,
							},
						];

						return updateSortedListsAndFinish(newMediaList);
						break;
					}

					case "remove": {
						if (!action.media) {
							console.error("There should be a media when calling 'remove'!");
							return arrayOfpreviousPlaylist;
						}

						const newMediaList = reaplyOrderedIndex(
							remove(prevMediaList, action.media.index)
						);

						return updateSortedListsAndFinish(newMediaList);
						break;
					}

					case "new list": {
						if (!action.list) {
							console.error("There should be a list when calling 'new list'!");
							return arrayOfpreviousPlaylist;
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
									  action.list![index]
							)
							.filter(({ path }) => path);

						const newMediaList = reaplyOrderedIndex(
							concatFromIndex(
								updatedButWithOriginalDateOfArival,
								updatedButWithOriginalDateOfArival.length,
								action.list
							)
						);

						return playlistsReducer(arrayOfpreviousPlaylist, {
							type: "create or update playlists",
							list: newMediaList,
							name: "mediaList",
						});
						break;
					}

					case "refresh one": {
						if (!action.media) {
							console.error(
								"There should be a media when CALLING 'refresh one'!"
							);
							return arrayOfpreviousPlaylist;
						}

						const oldMediaIndex = prevMediaList.findIndex(
							// eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
							({ path }) => path === action.media!.path
						);

						if (oldMediaIndex === -1) {
							console.error(
								"There should be a not-refreshed media when CALLING 'refresh one' but I did not find one!"
							);
							return arrayOfpreviousPlaylist;
						}

						const newMediaWithRightIndex: Media = {
							...action.media,
							index: oldMediaIndex,
						};

						const newMediaList = replace(
							prevMediaList,
							oldMediaIndex,
							newMediaWithRightIndex
						);

						return playlistsReducer(arrayOfpreviousPlaylist, {
							type: "create or update playlists",
							list: newMediaList,
							name: "mediaList",
						});
						break;
					}

					case "clean": {
						return playlistsReducer(arrayOfpreviousPlaylist, {
							type: "create or update playlists",
							name: "mediaList",
							list: [],
						});
						break;
					}

					default:
						return assertUnreachable(whatToDo);
				}
				break;
			}

			case "update sorted by name": {
				const newSortedByName = reaplyOrderedIndex(
					sort(action.list, (a, b) => {
						if (a.title > b.title) return 1;
						if (a.title < b.title) return -1;
						// a must be equal to b:
						return 0;
					})
				);

				return playlistsReducer(arrayOfpreviousPlaylist, {
					type: "create or update playlists",
					name: "sorted by name",
					list: newSortedByName,
				});
				break;
			}

			case "update sorted by date": {
				const newSortedByDate = reaplyOrderedIndex(
					sort(action.list, (a, b) => {
						if (a.dateOfArival > b.dateOfArival) return 1;
						if (a.dateOfArival < b.dateOfArival) return -1;
						// a must be equal to b:
						return 0;
					})
				);

				return playlistsReducer(arrayOfpreviousPlaylist, {
					type: "create or update playlists",
					name: "sorted by date",
					list: newSortedByDate,
				});
				break;
			}

			default:
				return assertUnreachable(type);
		}
	}

	////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////
	const [currentPlaying, dispatchCurrentPlaying] = useReducer(
		currentPlayingReducer,
		cachedCurrentPlaying
	);

	function currentPlayingReducer(
		previousPlaying: CurrentPlaying,
		action: currentPlayingReducer_Action
	): CurrentPlaying {
		const { type } = action;
		switch (type) {
			case "there is no media": {
				dbg("there is no media");

				setCachedCurrentPlaying(defaultCurrentPlaying);

				return cachedCurrentPlaying;
				break;
			}

			case "new": {
				dbg("currentPlaying 'new' action =", action);

				if (!action.media) return previousPlaying;
				if (action.playlist.name === "none") {
					console.error(
						"Received 'none' playlist to play (from 'new' currentPlaying)!"
					);

					return currentPlayingReducer(previousPlaying, {
						type: "there is no media",
					});
				}

				// Update history:
				if (
					previousPlaying.media &&
					previousPlaying.media.title !== action.media.title
				)
					playlistsReducer(playlists, {
						media: previousPlaying.media,
						type: "update history",
						whatToDo: "add",
					});

				const newCurrentPlaying: CurrentPlaying = {
					playlist: action.playlist,
					media: action.media,
					seconds: 0.0,
				};

				setCachedCurrentPlaying(newCurrentPlaying);

				return newCurrentPlaying;
				break;
			}

			case "play this media": {
				dbg("currentPlaying 'play this media' action =", action);

				if (!action.media) {
					// ^ In case it received the [0] item from a Media[] that is empty.
					if (action.playlist.name !== "none")
						return currentPlayingReducer(previousPlaying, {
							playlist: action.playlist,
							media: action.media,
							type: "new",
						});
					else
						return currentPlayingReducer(previousPlaying, {
							type: "there is no media",
						});
				}

				return currentPlayingReducer(previousPlaying, {
					playlist: action.playlist,
					media: action.media,
					type: "new",
				});
				break;
			}

			case "play previous": {
				dbg("currentPlaying 'play previous' action =", action);

				// eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
				const head = playlists.find(({ name }) => name === "history")!.list[0];

				if (head)
					return currentPlayingReducer(previousPlaying, {
						playlist: action.playlist,
						type: "play this media",
						media: head,
					});
				else
					return currentPlayingReducer(previousPlaying, {
						type: "there is no media",
					});
				break;
			}

			case "resume": {
				(async () =>
					await (
						document.getElementById("audio") as HTMLAudioElement
					).play())();

				dispatchPlayOptions({ type: "is paused", value: false });

				return previousPlaying;
				break;
			}

			case "pause": {
				(document.getElementById("audio") as HTMLAudioElement).pause();

				dispatchPlayOptions({ type: "is paused", value: true });

				return previousPlaying;
				break;
			}

			case "play next": {
				dbg("currentPlaying 'playNext' action =", action);

				const prevPlaylist = previousPlaying.playlist;
				if (previousPlaying.playlist.name === "none") {
					console.error("Can't play next media from the 'none' playlist!");

					return currentPlayingReducer(previousPlaying, {
						type: "there is no media",
					});
				}

				const prevMedia = previousPlaying.media;

				if (playOptions.loopThisMedia) {
					if (!prevMedia)
						return currentPlayingReducer(previousPlaying, {
							type: "there is no media",
						});
					else
						return currentPlayingReducer(previousPlaying, {
							playlist: prevPlaylist,
							media: prevMedia,
							type: "play this media",
						});
				}

				if (playOptions.isRandom) {
					const randomIndex = getRandomInt(0, prevPlaylist.list.length);
					const randomMedia = prevPlaylist.list[randomIndex];

					return currentPlayingReducer(previousPlaying, {
						type: "play this media",
						playlist: prevPlaylist,
						media: randomMedia,
					});
				} else {
					if (!prevMedia) {
						console.error(
							"Can't play next media if there isn't one selected already!"
						);

						return currentPlayingReducer(previousPlaying, {
							type: "there is no media",
						});
					}

					const nextMediaFromTheSameList =
						prevPlaylist.list[prevMedia.index + 1];

					if (!nextMediaFromTheSameList) {
						// ^ In case it is in the final of the list (it would receive undefined):
						const firstMediaFromTheSameList = prevPlaylist.list[0];

						return currentPlayingReducer(previousPlaying, {
							media: firstMediaFromTheSameList,
							playlist: prevPlaylist,
							type: "play this media",
						});
					}

					return currentPlayingReducer(previousPlaying, {
						media: nextMediaFromTheSameList,
						playlist: prevPlaylist,
						type: "play this media",
					});
					break;
				}
			}

			default:
				return assertUnreachable(type);
		}
	}

	////////////////////////////////////////////////////////////////////////
	/////////////////////////  General fns  ////////////////////////////////
	////////////////////////////////////////////////////////////////////////
	function searchForMedia(searchTerm: string): readonly Media[] {
		console.time("Searching for file");
		// eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
		const mediaList = playlists.find(({ name }) => name === "mediaList")!.list;

		const results = mediaList.filter(({ title }) =>
			title.toLowerCase().includes(searchTerm.toLowerCase())
		);
		console.timeEnd("Searching for file");

		return results;
	}

	async function searchLocalComputerForMedias(force = false) {
		// eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
		const mediaList = playlists.find(({ name }) => name === "mediaList")!.list;

		const isThereNewMedia = (paths: readonly string[]) => {
			const isThereNewMedia = paths.length !== mediaList.length;
			dbg(
				`mediaList.length = ${mediaList.length}. Is there new media? ${isThereNewMedia}`
			);
			return isThereNewMedia;
		};

		try {
			console.time("Getting paths");
			const paths = getAllowedMedias(await searchDirectoryResult());
			console.timeEnd("Getting paths");
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
				event.data
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
							"There should be a path if you want to remove a media!"
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
							"There should be a path if you want to refresh a media!"
						);
						break;
					}

					// eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
					const mediaIndex = playlists
						.find(({ name }) => name === "mediaList")!
						.list.findIndex(({ path: path_ }) => path_ === path);

					if (mediaIndex === -1) {
						console.error(
							`There should be a media with path = "${path}" to be refreshed, but there isn't!`
						);
						break;
					}

					const refreshedMedia = (await transformPathsToMedias([path]))[0];

					if (!refreshedMedia) {
						console.error(
							`I wasn't able to transform this path (${path}) to a media to be refreshed!`
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
							`I wasn't able to find this path (${path}) to a media to be removed!`
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

	////////////////////////////////////////////////////////////////////////
	/////////////////////////  Use Effect  /////////////////////////////////
	////////////////////////////////////////////////////////////////////////
	useEffect(() => {
		(async () => await searchLocalComputerForMedias())();

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
	}, []);

	useEffect(() => {
		const { port1: reactPort, port2: electronPort } = new MessageChannel();

		window.twoWayComm_React_Electron = addListeners(reactPort);

		dbg("Sending 'async two way comm' to Electron side.");
		window.postMessage("async two way comm", "*", [electronPort]);
	}, []);

	useEffect(() => {
		(async function setAudioToHTMLAudioElement() {
			if (!window || !currentPlaying.media) return;

			console.time("Reading file");
			const url = URL.createObjectURL(
				new Blob([await readFile(currentPlaying.media.path)])
			);
			console.timeEnd("Reading file");

			const audio = document.getElementById("audio") as HTMLAudioElement;
			audio.src = url;

			audio.addEventListener("canplay", () => {
				console.log("Audio can play");
			});
			audio.addEventListener("invalid", e => {
				console.error("Audio is invalid:", e);
			});
			audio.addEventListener("stalled", e => {
				console.log("Audio is stalled:", e);
			});
			audio.addEventListener("securitypolicyviolation", e =>
				console.error("Audio has a security policy violation:", e)
			);
			audio.addEventListener("error", e => console.error("Audio error:", e));
			audio.addEventListener("abort", e =>
				console.log("Audio was aborted:", e)
			);
		})();
	}, [currentPlaying]);

	return (
		<MediaList_Context.Provider
			value={{
				dispatches: {
					dispatchCurrentPlaying,
					dispatchPlayOptions,
					dispatchPlaylists,
				},
				functions: {
					searchLocalComputerForMedias,
					searchForMedia,
					deleteMedia,
				},
				values: {
					currentPlaying,
					playOptions,
				},
				playlists,
			}}
		>
			{children}
		</MediaList_Context.Provider>
	);
}

function useMediaList() {
	const context = useContext(MediaList_Context);

	if (!context)
		throw new Error(
			"`useMediaList` must be used within a `<MediaList_Context>`"
		);

	return context;
}

export { useMediaList, MediaList_Provider };

MediaList_Provider.whyDidYouRender = {
	customName: "MediaList_Provider",
	logOnDifferentValues: false,
};
