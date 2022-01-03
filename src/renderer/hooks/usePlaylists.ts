import type { Media } from "@common/@types/types";

import { useReducer } from "react";

import { concatFromIndex, remove, replace, sort } from "@renderer/utils/array";
import { assertUnreachable } from "@renderer/utils/utils";
import { useLocalStorage } from ".";
import { dbg, keyPrefix } from "@renderer/utils/app";
import {
	returnNewArrayWithNewMediaOnHistoryOfPlayedMedia,
	reaplyOrderedIndex,
} from "@renderer/contexts/mediaListHelper";

const playlistsKey = keyPrefix + "playlists";

export function usePlaylists() {
	const [cachedPlaylists, setCachedPlaylists] = useLocalStorage<
		readonly Playlist[]
	>(playlistsKey, defaultPlaylists);

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

	return [playlists, dispatchPlaylists] as const;
}

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

type PlaylistsReducer_Action =
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
	  }>
	| Readonly<{ type: "update sorted by date"; list: readonly Media[] }>
	| Readonly<{ type: "update sorted by name"; list: readonly Media[] }>;
