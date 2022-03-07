import type { Playlist } from "@contexts";
import type { Media } from "@common/@types/typesAndEnums";

import { persist, subscribeWithSelector } from "zustand/middleware";
import create from "zustand";
import merge from "deepmerge";

import { assertUnreachable, getRandomInt } from "@utils/utils";
import { HISTORY, MEDIA_LIST } from "./usePlaylistsHelper";
import { usePlayOptions } from "@contexts/mediaHandler/usePlayOptions";
import { keyPrefix } from "@utils/app";
import { dbg } from "@common/utils";
import {
	defaultPlaylists,
	PlaylistActions,
	PlaylistEnum,
	usePlaylists,
} from "@contexts/mediaHandler/usePlaylists";

const {
	fs: { readFile },
} = electron;

const currentPlayingKey = keyPrefix + "current_playing";
const { getState: getPlayOptions } = usePlayOptions;
const { getState: getPlaylists } = usePlaylists;

// eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
const defaultPlaylist = defaultPlaylists.find(p => p.name === MEDIA_LIST)!;
const defaultCurrentPlaying: CurrentPlaying = Object.freeze({
	playlist: defaultPlaylist,
	media: undefined,
	currentTime: 0,
});

export const useCurrentPlaying = create<CurrentPlayingAction>(
	subscribeWithSelector(
		persist(
			(set, get) => ({
				currentPlaying: defaultCurrentPlaying,
				setCurrentPlaying: (action: currentPlayingReducer_Action) => {
					const previousPlaying = get().currentPlaying;
					const playlists = getPlaylists().playlists;

					switch (action.type) {
						case CurrentPlayingEnum.PLAY_THIS_MEDIA: {
							dbg("setCurrentPlaying 'play this media' action =", action);
							// debugger;

							if (!action.media) {
								// ^ In case it received the [0] item from a Media[] that is empty.
								console.error("There is no media to play!");
								break;
							}

							// We need to update history:
							dbg("Adding media to history");
							getPlaylists().setPlaylists({
								whatToDo: PlaylistActions.ADD_ONE_MEDIA,
								type: PlaylistEnum.UPDATE_HISTORY,
								media: action.media,
							});

							set({
								currentPlaying: {
									playlist: action.playlist,
									media: action.media,
									currentTime: 0,
								},
							});
							break;
						}

						case CurrentPlayingEnum.PLAY_PREVIOUS: {
							dbg("setCurrentPlaying 'play previous' action =", action);

							// eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
							const head = playlists.find(({ name }) => name === HISTORY)!
								.list[0];

							if (head) {
								// We need to update history:
								dbg("Adding media to history");
								getPlaylists().setPlaylists({
									whatToDo: PlaylistActions.ADD_ONE_MEDIA,
									type: PlaylistEnum.UPDATE_HISTORY,
									media: head,
								});

								set({
									currentPlaying: {
										playlist: action.playlist,
										currentTime: 0,
										media: head,
									},
								});
							} else console.error("There is no previous media!");
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

							set({
								currentPlaying: {
									playlist: previousPlaying.playlist,
									currentTime: audio.currentTime,
									media: previousPlaying.media,
								},
							});
							break;
						}

						case CurrentPlayingEnum.PLAY_NEXT: {
							dbg("currentPlaying 'playNext' action =", action);

							const prevList = previousPlaying.playlist.list;

							if (prevList.length === 0) {
								console.error("Media list size is 0! Can't play next media.");
								break;
							}

							const prevPlaylist = previousPlaying.playlist;

							if (getPlayOptions().playOptions.isRandom) {
								const randomMedia = prevList[getRandomInt(0, prevList.length)];

								// We need to update history:
								dbg("Adding media to history");
								getPlaylists().setPlaylists({
									whatToDo: PlaylistActions.ADD_ONE_MEDIA,
									type: PlaylistEnum.UPDATE_HISTORY,
									media: randomMedia,
								});

								set({
									currentPlaying: {
										playlist: prevPlaylist,
										media: randomMedia,
										currentTime: 0,
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
									prevPlaylist.list[prevMedia.index + 1];

								if (!nextMediaFromTheSameList) {
									// ^ In case it is in the final of the list (it would receive undefined):
									const firstMediaFromTheSameList = prevPlaylist.list[0];

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
											playlist: prevPlaylist,
											currentTime: 0,
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
										playlist: prevPlaylist,
										currentTime: 0,
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
				partialize: state => ({ currentPlaying: state.currentPlaying }),
				serialize: state => JSON.stringify(state.state.currentPlaying),
				deserialize: state => JSON.parse(state),
				merge: (persistedState, currentState) =>
					merge(persistedState, currentState),
			},
		),
	),
);

const { getState: getCurrentPlaying } = useCurrentPlaying;

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

export type CurrentPlaying = Readonly<{
	media: Media | undefined;
	currentTime: number;
	playlist: Playlist;
}>;

export type currentPlayingReducer_Action =
	| Readonly<{
			type: CurrentPlayingEnum.PLAY_THIS_MEDIA;
			playlist: Playlist;
			media: Media;
	  }>
	| Readonly<{ type: CurrentPlayingEnum.PLAY_PREVIOUS; playlist: Playlist }>
	| Readonly<{ type: CurrentPlayingEnum.PLAY_NEXT; playlist: Playlist }>
	| Readonly<{ type: CurrentPlayingEnum.RESUME }>
	| Readonly<{ type: CurrentPlayingEnum.PAUSE }>;

export enum CurrentPlayingEnum {
	PLAY_THIS_MEDIA,
	PLAY_PREVIOUS,
	PLAY_NEXT,
	RESUME,
	PAUSE,
}

type CurrentPlayingAction = {
	setCurrentPlaying(action: currentPlayingReducer_Action): void;
	currentPlaying: CurrentPlaying;
};
