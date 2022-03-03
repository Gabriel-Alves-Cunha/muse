import type { Playlist } from "@contexts";
import type { Media, Mutable } from "@common/@types/typesAndEnums";

import { persist, subscribeWithSelector } from "zustand/middleware";
import create from "zustand";
import merge from "deepmerge";

import { assertUnreachable, getRandomInt } from "@utils/utils";
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
} = global.electron;

const currentPlayingKey = keyPrefix + "current_playing";
const { getState: getPlayOptions } = usePlayOptions;
const { getState: getPlaylists } = usePlaylists;

// eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
const defaultPlaylist = defaultPlaylists.find(({ name }) => name === "none")!;
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
								if (action.playlist.name === "none")
									console.error("Received 'none' playlist to play from!");
								dbg("There is no media!");
								break;
							}

							// We need to update history:
							if (previousPlaying.media?.id !== action.media.id) {
								dbg("Adding media to history");

								getPlaylists().setPlaylists({
									type: PlaylistEnum.UPDATE_HISTORY,
									whatToDo: PlaylistActions.ADD_ONE_MEDIA,
									media: action.media,
								});
							}

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
							const head = playlists.find(({ name }) => name === "history")!
								.list[0];

							head
								? set({
										currentPlaying: {
											playlist: action.playlist,
											currentTime: 0,
											media: head,
										},
								  })
								: dbg("There is no media!");
							/////////

							const prevPlaylist = previousPlaying.playlist;
							if (previousPlaying.playlist.name === "none") {
								console.error(
									"Can't play previous media from the 'none' playlist!",
								);
								break;
							}

							const playOptions = getPlayOptions().playOptions;

							if (playOptions.loopThisMedia) {
								set({
									currentPlaying: { ...previousPlaying, currentTime: 0 },
								});
							} else if (playOptions.isRandom) {
								const randomIndex = getRandomInt(0, prevPlaylist.list.length);
								const randomMedia = prevPlaylist.list[randomIndex];

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
										"Can't play previous media if there isn't one selected already.",
									);
									break;
								}

								const mutList = prevPlaylist.list as Mutable<Media[]>;
								const prevMediaFromTheSameList = mutList.at(
									prevMedia.index - 1,
								);

								if (!prevMediaFromTheSameList) {
									// ^ In case it goes beyond the bounds of the list (it would receive undefined):
									const firstMediaFromTheSameList = prevPlaylist.list[0];

									set({
										currentPlaying: {
											media: firstMediaFromTheSameList,
											playlist: prevPlaylist,
											currentTime: 0,
										},
									});
									break;
								}

								set({
									currentPlaying: {
										media: prevMediaFromTheSameList,
										playlist: prevPlaylist,
										currentTime: 0,
									},
								});
							}
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

							const prevPlaylist = previousPlaying.playlist;
							if (previousPlaying.playlist.name === "none") {
								console.error(
									"Can't play next media from the 'none' playlist!",
								);
								break;
							}

							const playOptions = getPlayOptions().playOptions;

							if (playOptions.isRandom) {
								const randomIndex = getRandomInt(0, prevPlaylist.list.length);
								const randomMedia = prevPlaylist.list[randomIndex];

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

									set({
										currentPlaying: {
											media: firstMediaFromTheSameList,
											playlist: prevPlaylist,
											currentTime: 0,
										},
									});
									break;
								}

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
	currentTime: number;
	playlist: Playlist;
	media?: Media;
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
