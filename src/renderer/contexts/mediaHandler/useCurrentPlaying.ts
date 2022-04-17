/* eslint-disable @typescript-eslint/no-non-null-assertion */

import type { GetState, Mutate, SetState, StoreApi } from "zustand";
import type { MediaID } from "@common/@types/typesAndEnums";

import { persist, subscribeWithSelector } from "zustand/middleware";
import create from "zustand";
import merge from "deepmerge";

import { assertUnreachable, getRandomInt } from "@utils/utils";
import { HISTORY, MAIN_LIST } from "./usePlaylistsHelper";
import { formatDuration } from "@common/utils";
import { usePlayOptions } from "./usePlayOptions";
import { keyPrefix } from "@utils/app";
import { dbg } from "@common/utils";
import {
	type DefaultLists,
	type Playlist,
	PlaylistActions,
	usePlaylists,
	PlaylistEnum,
} from "./usePlaylists";

const { readFile } = electron.fs;

const currentPlayingKey = `${keyPrefix}current_playing` as const;
const { getState: getPlaylistsFunctions } = usePlaylists;
const { getState: getPlayOptions } = usePlayOptions;

const defaultCurrentPlaying: CurrentPlaying = Object.freeze({
	playlistName: MAIN_LIST,
	mediaID: undefined,
	currentTime: 0,
} as const);

export type CurrentPlaying = Readonly<{
	playlistName: Playlist["name"];
	mediaID: MediaID | undefined;
	currentTime: number;
}>;

export const useCurrentPlaying = create(
	subscribeWithSelector(
		persist<
			CurrentPlayingAction,
			SetState<CurrentPlayingAction>,
			GetState<CurrentPlayingAction>,
			Mutate<
				StoreApi<CurrentPlayingAction>,
				[["zustand/persist", Partial<CurrentPlayingAction>]]
			>
		>(
			(set, get) => ({
				currentPlaying: defaultCurrentPlaying,
				setCurrentPlaying: (action: currentPlayingReducer_Action) => {
					const previousPlaying = get().currentPlaying;
					const getPlaylist = (listName: DefaultLists) =>
						getPlaylistsFunctions().playlists.find(p => p.name === listName);

					switch (action.type) {
						case CurrentPlayingEnum.PLAY_THIS_MEDIA: {
							dbg("setCurrentPlaying 'play this media' action =", action);
							const { mediaID, playlistName } = action;

							if (!mediaID) {
								// ^ In case it received the [0] item from a MediaID[] that is empty.
								console.error("There is no mediaID to play!");
								break;
							}

							// We need to update history:
							dbg("Adding media to history...");
							getPlaylistsFunctions().setPlaylists({
								whatToDo: PlaylistActions.ADD_ONE_MEDIA,
								type: PlaylistEnum.UPDATE_HISTORY,
								mediaID,
							});

							set({
								currentPlaying: {
									currentTime: 0,
									playlistName,
									mediaID,
								},
							});
							break;
						}

						case CurrentPlayingEnum.PLAY_PREVIOUS_FROM_PLAYLIST: {
							dbg(
								"CurrentPlayingEnum.PLAY_PREVIOUS_FROM_LIST\naction =",
								action,
							);
							const { playlistName } = action;

							const currMediaID = get().currentPlaying.mediaID;

							if (!currMediaID) {
								console.error(
									"A media needs to be currently selected to play a previous media!",
								);
								break;
							}

							// Handle if it's the "main list":
							if (playlistName === MAIN_LIST) {
								const mainList = getPlaylistsFunctions().mainList;
								const currMediaIDIndex = mainList.findIndex(
									m => m.id === currMediaID,
								);

								const prevMediaID = mainList.at(currMediaIDIndex - 1)!.id;

								set({
									currentPlaying: {
										mediaID: prevMediaID,
										currentTime: 0,
										playlistName,
									},
								});
							} else {
								const currPlaylist = getPlaylist(playlistName)!.list;
								const currMediaIDIndex = currPlaylist.findIndex(
									id => id === currMediaID,
								);

								const prevMediaID = currPlaylist.at(currMediaIDIndex - 1);

								set({
									currentPlaying: {
										mediaID: prevMediaID,
										currentTime: 0,
										playlistName,
									},
								});
							}
							break;
						}

						case CurrentPlayingEnum.PLAY_PREVIOUS_FROM_HISTORY: {
							dbg(
								"CurrentPlayingEnum.PLAY_PREVIOUS_FROM_HISTORY\naction =",
								action,
							);

							const headOfHistory = getPlaylist(HISTORY)!.list[1];

							if (headOfHistory) {
								// We need to update history:
								dbg("Adding media to history");
								getPlaylistsFunctions().setPlaylists({
									whatToDo: PlaylistActions.ADD_ONE_MEDIA,
									type: PlaylistEnum.UPDATE_HISTORY,
									mediaID: headOfHistory,
								});

								set({
									currentPlaying: {
										playlistName: action.playlistName,
										mediaID: headOfHistory,
										currentTime: 0,
									},
								});
							} else console.error("There is no previous media in history!");
							break;
						}

						case CurrentPlayingEnum.TOGGLE_PLAY_PAUSE: {
							(async () => {
								const audio = document.getElementById(
									"audio",
								) as HTMLAudioElement;
								const isPaused = audio.paused;

								if (isPaused) await audio.play();
								else {
									const { mediaID, playlistName } = previousPlaying;

									audio.pause();

									set({
										currentPlaying: {
											currentTime: audio.currentTime,
											playlistName,
											mediaID,
										},
									});
								}
							})();

							break;
						}

						case CurrentPlayingEnum.PLAY: {
							(async () =>
								await (
									document.getElementById("audio") as HTMLAudioElement
								).play())();
							break;
						}

						case CurrentPlayingEnum.PAUSE: {
							const { mediaID, playlistName } = previousPlaying;

							if (!mediaID) {
								console.warn("There is media currently playing!");
								break;
							}

							const audio = document.getElementById(
								"audio",
							) as HTMLAudioElement;
							audio.pause();

							set({
								currentPlaying: {
									currentTime: audio.currentTime,
									playlistName,
									mediaID,
								},
							});
							break;
						}

						case CurrentPlayingEnum.PLAY_NEXT_FROM_PLAYLIST: {
							dbg(
								"CurrentPlayingEnum.PLAY_NEXT_FROM_PLAYLIST\naction =",
								action,
							);
							const { playlistName } = action;
							const prevMediaID = previousPlaying.mediaID;

							if (!prevMediaID) {
								console.error(
									"A media needs to be currently selected to play a next media!",
								);
								break;
							}

							// Handle if it's the "main list":
							if (playlistName === MAIN_LIST) {
								const mainList = getPlaylistsFunctions().mainList;

								if (getPlayOptions().playOptions.isRandom) {
									const randomMedia =
										mainList[getRandomInt(0, mainList.length)];

									if (!randomMedia) {
										console.error(
											"There should be a random media selected, but there isn't!\nrandomMedia =",
											randomMedia,
										);
										break;
									}

									// We need to update history:
									getPlaylistsFunctions().setPlaylists({
										whatToDo: PlaylistActions.ADD_ONE_MEDIA,
										type: PlaylistEnum.UPDATE_HISTORY,
										mediaID: randomMedia.id,
									});

									// Setting the current playing media:
									set({
										currentPlaying: {
											mediaID: randomMedia.id,
											currentTime: 0,
											playlistName,
										},
									});
								} else {
									const prevMediaIDIndex = mainList.findIndex(
										m => m.id === prevMediaID,
									);

									const nextMediaFromTheSameList =
										mainList[prevMediaIDIndex + 1];

									if (!nextMediaFromTheSameList) {
										// ^ In case it is in the final of the list (it would receive undefined):
										const firstMediaFromTheSameList = mainList[0]!;

										// We need to update history:
										dbg("Adding media to history");
										getPlaylistsFunctions().setPlaylists({
											whatToDo: PlaylistActions.ADD_ONE_MEDIA,
											mediaID: firstMediaFromTheSameList.id,
											type: PlaylistEnum.UPDATE_HISTORY,
										});

										set({
											currentPlaying: {
												mediaID: firstMediaFromTheSameList.id,
												currentTime: 0,
												playlistName,
											},
										});
										break;
									}

									// We need to update history:
									getPlaylistsFunctions().setPlaylists({
										whatToDo: PlaylistActions.ADD_ONE_MEDIA,
										mediaID: nextMediaFromTheSameList.id,
										type: PlaylistEnum.UPDATE_HISTORY,
									});

									set({
										currentPlaying: {
											mediaID: nextMediaFromTheSameList.id,
											currentTime: 0,
											playlistName,
										},
									});
								}
							} else {
								const list = getPlaylist(playlistName)!.list;

								if (getPlayOptions().playOptions.isRandom) {
									const randomMedia = list[getRandomInt(0, list.length)];

									if (!randomMedia) {
										console.error(
											"There should be a random media selected, but there isn't!\nrandomMedia =",
											randomMedia,
										);
										break;
									}

									// We need to update history:
									getPlaylistsFunctions().setPlaylists({
										whatToDo: PlaylistActions.ADD_ONE_MEDIA,
										type: PlaylistEnum.UPDATE_HISTORY,
										mediaID: randomMedia,
									});

									// Setting the current playing mediaID:
									set({
										currentPlaying: {
											mediaID: randomMedia,
											currentTime: 0,
											playlistName,
										},
									});
								} else {
									const prevMediaID = previousPlaying.mediaID;
									const prevMediaIDIndex = list.findIndex(
										id => id === prevMediaID,
									);

									const nextMediaFromTheSameList = list[prevMediaIDIndex + 1];

									if (!nextMediaFromTheSameList) {
										// ^ In case it is in the final of the list (it would receive undefined):
										const firstMediaFromTheSameList = list[0]!;

										// We need to update history:
										dbg("Adding media to history");
										getPlaylistsFunctions().setPlaylists({
											whatToDo: PlaylistActions.ADD_ONE_MEDIA,
											mediaID: firstMediaFromTheSameList,
											type: PlaylistEnum.UPDATE_HISTORY,
										});

										set({
											currentPlaying: {
												mediaID: firstMediaFromTheSameList,
												currentTime: 0,
												playlistName,
											},
										});
										break;
									}

									// We need to update history:
									getPlaylistsFunctions().setPlaylists({
										whatToDo: PlaylistActions.ADD_ONE_MEDIA,
										type: PlaylistEnum.UPDATE_HISTORY,
										mediaID: nextMediaFromTheSameList,
									});

									set({
										currentPlaying: {
											mediaID: nextMediaFromTheSameList,
											currentTime: 0,
											playlistName,
										},
									});
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
			}),
			{
				name: currentPlayingKey,
				partialize: ({ currentPlaying }) => ({ currentPlaying }),
				serialize: ({ state }) => JSON.stringify(state.currentPlaying),
				deserialize: currentPlaying => JSON.parse(currentPlaying),
				merge: (persistedState, currentState) =>
					merge(persistedState, currentState),
			},
		),
	),
);

const { getState: getCurrentPlaying } = useCurrentPlaying;
const timeKey = "Reading <audio> file took";
let prevMediaTimer: NodeJS.Timeout | undefined = undefined;

if (globalThis.window)
	useCurrentPlaying.subscribe(
		state => state.currentPlaying.mediaID,
		function setAudioToHTMLAudioElement() {
			// @ts-ignore It will just return undefined if it's undefined.
			clearTimeout(prevMediaTimer);

			const { mediaID, currentTime } = getCurrentPlaying().currentPlaying;
			if (!mediaID) return;

			const media = getPlaylistsFunctions().mainList.find(
				m => m.id === mediaID,
			)!;

			const mediaTimer = setTimeout(async () => {
				console.time(timeKey);
				const url = URL.createObjectURL(new Blob([await readFile(media.path)]));
				console.timeEnd(timeKey);

				const audio = document.getElementById("audio") as HTMLAudioElement;
				audio.src = url;

				// Adding event listeners:
				audio.addEventListener("loadeddata", () => {
					// Updating the duration of media:
					getPlaylistsFunctions().setPlaylists({
						media: { ...media, duration: formatDuration(audio.duration) },
						whatToDo: PlaylistActions.REFRESH_ONE_MEDIA_BY_ID,
						type: PlaylistEnum.UPDATE_MAIN_LIST,
					});

					if (currentTime > 20) {
						console.log(
							`Audio has loaded metadata. Setting currentTime to ${currentTime} seconds.`,
						);
						audio.currentTime = currentTime;
					}
				});
				audio.addEventListener("canplay", () => {
					console.log("Audio can play.");
				});
				audio.addEventListener("invalid", e => {
					console.error("Audio is invalid:", e);
				});
				audio.addEventListener("stalled", e => {
					console.log(
						"Audio is stalled (Fires when the browser is trying to get media data, but data is not available):",
						e,
					);
				});
				audio.addEventListener("securitypolicyviolation", e => {
					console.error("Audio has a security policy violation:", e);
				});
				audio.addEventListener("error", e => {
					console.error("Audio error.", e);
				});
				audio.addEventListener("abort", () => {
					console.log("Audio was aborted.");
				});
				audio.addEventListener("close", () => {
					console.log("Audio was closed.");
				});
				audio.addEventListener("ended", () => {
					console.log("Audio has ended.");
				});
			}, 150);

			prevMediaTimer = mediaTimer;
		},
	);

export type currentPlayingReducer_Action =
	| Readonly<{
			type: CurrentPlayingEnum.PLAY_THIS_MEDIA;
			playlistName: Playlist["name"];
			mediaID: MediaID;
	  }>
	| Readonly<{
			type: CurrentPlayingEnum.PLAY_PREVIOUS_FROM_PLAYLIST;
			playlistName: Playlist["name"];
	  }>
	| Readonly<{
			type: CurrentPlayingEnum.PLAY_PREVIOUS_FROM_HISTORY;
			playlistName: Playlist["name"];
	  }>
	| Readonly<{
			type: CurrentPlayingEnum.PLAY_NEXT_FROM_PLAYLIST;
			playlistName: Playlist["name"];
	  }>
	| Readonly<{ type: CurrentPlayingEnum.TOGGLE_PLAY_PAUSE }>
	| Readonly<{ type: CurrentPlayingEnum.PAUSE }>
	| Readonly<{ type: CurrentPlayingEnum.PLAY }>;

export enum CurrentPlayingEnum {
	PLAY_PREVIOUS_FROM_PLAYLIST,
	PLAY_PREVIOUS_FROM_HISTORY,
	PLAY_NEXT_FROM_PLAYLIST,
	TOGGLE_PLAY_PAUSE,
	PLAY_THIS_MEDIA,
	PAUSE,
	PLAY,
}

type CurrentPlayingAction = Readonly<{
	setCurrentPlaying(action: currentPlayingReducer_Action): void;
	currentPlaying: CurrentPlaying;
}>;
