/* eslint-disable @typescript-eslint/no-non-null-assertion */

import type { GetState, Mutate, SetState, StoreApi } from "zustand";
import type { Media } from "@common/@types/typesAndEnums";

import { persist, subscribeWithSelector } from "zustand/middleware";
import create from "zustand";
import merge from "deepmerge";

import { assertUnreachable, getRandomInt } from "@utils/utils";
import { HISTORY, MEDIA_LIST } from "./usePlaylistsHelper";
import { keyPrefix } from "@utils/app";
import { dbg } from "@common/utils";
import {
	type DefaultLists,
	type Playlist,
	PlaylistActions,
	usePlayOptions,
	PlaylistEnum,
	usePlaylists,
} from "@contexts";

const {
	fs: { readFile },
} = electron;

const currentPlayingKey = `${keyPrefix}current_playing` as const;
const { getState: getPlayOptions } = usePlayOptions;
const { getState: getPlaylists } = usePlaylists;

const defaultCurrentPlaying: CurrentPlaying = Object.freeze({
	playlistName: MEDIA_LIST,
	media: undefined,
	currentTime: 0,
});

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
						getPlaylists().playlists.find(p => p.name === listName)!;

					switch (action.type) {
						case CurrentPlayingEnum.PLAY_THIS_MEDIA: {
							dbg("setCurrentPlaying 'play this media' action =", action);
							const { media, playlistName } = action;

							if (!media) {
								// ^ In case it received the [0] item from a Media[] that is empty.
								console.error("There is no media to play!");
								break;
							}

							// We need to update history:
							dbg("Adding media to history");
							getPlaylists().setPlaylists({
								whatToDo: PlaylistActions.ADD_ONE_MEDIA,
								type: PlaylistEnum.UPDATE_HISTORY,
								media,
							});

							set({
								currentPlaying: {
									currentTime: 0,
									playlistName,
									media,
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

							const currPlaylist = getPlaylist(playlistName).list;
							const currMedia = get().currentPlaying.media;

							if (!currMedia) {
								console.error(
									"A media needs to be currently selected to play a previous media!",
								);
								break;
							}

							const prevMedia = currPlaylist.at(currMedia.index - 1)!;

							set({
								currentPlaying: {
									media: prevMedia,
									currentTime: 0,
									playlistName,
								},
							});
							break;
						}

						case CurrentPlayingEnum.PLAY_PREVIOUS_FROM_HISTORY: {
							dbg(
								"CurrentPlayingEnum.PLAY_PREVIOUS_FROM_HISTORY\naction =",
								action,
							);

							const headOfHistory = getPlaylist(HISTORY).list[0];

							if (headOfHistory) {
								// We need to update history:
								dbg("Adding media to history");
								getPlaylists().setPlaylists({
									whatToDo: PlaylistActions.ADD_ONE_MEDIA,
									type: PlaylistEnum.UPDATE_HISTORY,
									media: headOfHistory,
								});

								set({
									currentPlaying: {
										playlistName: action.playlistName,
										media: headOfHistory,
										currentTime: 0,
									},
								});
							} else console.error("There is no previous media in history!");
							break;
						}

						case CurrentPlayingEnum.RESUME: {
							(async () =>
								await (
									document.getElementById("audio") as HTMLAudioElement
								).play())();
							break;
						}

						case CurrentPlayingEnum.PAUSE: {
							const audio = document.getElementById(
								"audio",
							) as HTMLAudioElement;

							audio.pause();

							const { media, playlistName } = previousPlaying;

							set({
								currentPlaying: {
									currentTime: audio.currentTime,
									playlistName,
									media,
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
							const playlist = getPlaylist(playlistName);

							if (playlist.list.length === 0) {
								console.error(
									"Media list size is 0! Can't play next media.\naction.playlist =",
									{ playlist },
								);
								break;
							}

							if (getPlayOptions().playOptions.isRandom) {
								const randomMedia =
									playlist.list[getRandomInt(0, playlist.list.length)];

								// We need to update history:
								dbg("Adding media to history");
								getPlaylists().setPlaylists({
									whatToDo: PlaylistActions.ADD_ONE_MEDIA,
									type: PlaylistEnum.UPDATE_HISTORY,
									media: randomMedia,
								});

								set({
									currentPlaying: {
										media: randomMedia,
										currentTime: 0,
										playlistName,
									},
								});
							} else {
								const prevMedia = previousPlaying.media;
								if (!prevMedia) {
									console.error(
										"Can't play next media if there isn't one selected already.",
									);
									break;
								}

								const nextMediaFromTheSameList =
									playlist.list[prevMedia.index + 1];

								if (!nextMediaFromTheSameList) {
									// ^ In case it is in the final of the list (it would receive undefined):
									const firstMediaFromTheSameList = playlist.list[0];

									// We need to update history:
									dbg("Adding media to history");
									getPlaylists().setPlaylists({
										whatToDo: PlaylistActions.ADD_ONE_MEDIA,
										type: PlaylistEnum.UPDATE_HISTORY,
										media: firstMediaFromTheSameList,
									});

									set({
										currentPlaying: {
											media: firstMediaFromTheSameList,
											currentTime: 0,
											playlistName,
										},
									});
									break;
								}

								// We need to update history:
								dbg("Adding media to history");
								getPlaylists().setPlaylists({
									whatToDo: PlaylistActions.ADD_ONE_MEDIA,
									type: PlaylistEnum.UPDATE_HISTORY,
									media: nextMediaFromTheSameList,
								});

								set({
									currentPlaying: {
										media: nextMediaFromTheSameList,
										currentTime: 0,
										playlistName,
									},
								});
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

if (globalThis.window) {
	useCurrentPlaying.subscribe(
		state => state.currentPlaying.media,
		async function setAudioToHTMLAudioElement() {
			const {
				currentPlaying: { media, currentTime },
			} = getCurrentPlaying();
			if (!global.window || !media) return;

			console.time("Reading <audio> file took");
			const url = URL.createObjectURL(new Blob([await readFile(media.path)]));
			console.timeEnd("Reading <audio> file took");

			const audio = document.getElementById("audio") as HTMLAudioElement;
			audio.src = url;

			audio.addEventListener("loadedmetadata", () => {
				console.log("Audio has loaded metadata. Setting currentTime...");
				if (currentTime > 10) audio.currentTime = currentTime;
			});
			audio.addEventListener("canplay", () => {
				console.log("Audio can play.");
			});
			audio.addEventListener("invalid", e => {
				console.error("Audio is invalid:", e);
			});
			audio.addEventListener("stalled", e => {
				console.log("Audio is stalled:", e);
			});
			audio.addEventListener("securitypolicyviolation", e =>
				console.error("Audio has a security policy violation:", e),
			);
			audio.addEventListener("error", () => console.error("Audio error."));
			audio.addEventListener("abort", () => console.log("Audio was aborted."));
		},
	);
}

export type CurrentPlaying = Readonly<{
	playlistName: Playlist["name"];
	media: Media | undefined;
	currentTime: number;
}>;

export type currentPlayingReducer_Action =
	| Readonly<{
			type: CurrentPlayingEnum.PLAY_THIS_MEDIA;
			playlistName: Playlist["name"];
			media: Media;
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
	| Readonly<{ type: CurrentPlayingEnum.RESUME }>
	| Readonly<{ type: CurrentPlayingEnum.PAUSE }>;

export enum CurrentPlayingEnum {
	PLAY_PREVIOUS_FROM_HISTORY,
	PLAY_PREVIOUS_FROM_PLAYLIST,
	PLAY_NEXT_FROM_PLAYLIST,
	PLAY_THIS_MEDIA,
	RESUME,
	PAUSE,
}

type CurrentPlayingAction = Readonly<{
	setCurrentPlaying(action: currentPlayingReducer_Action): void;
	currentPlaying: CurrentPlaying;
}>;
