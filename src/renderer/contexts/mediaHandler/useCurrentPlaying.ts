import type { Playlist } from "@contexts";
import type { Media } from "@common/@types/typesAndEnums";

import { persist } from "zustand/middleware";
import create from "zustand";
import merge from "deepmerge";

import { assertUnreachable, getRandomInt } from "@utils/utils";
import { usePlayOptions } from "@contexts/mediaHandler/usePlayOptions";
import { keyPrefix } from "@utils/app";
import { dbg } from "@common/utils";
import {
	defaultPlaylists,
	PlaylistActions,
	PlaylistType,
	usePlaylists,
} from "@contexts/mediaHandler/usePlaylists";

const {
	fs: { readFile },
} = electron;

const currentPlayingKey = keyPrefix + "current_playing";
const { getState: getPlayOptions } = usePlayOptions;
const { getState: getPlaylists } = usePlaylists;

// eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
const defaultPlaylist = defaultPlaylists.find(({ name }) => name === "none")!;
console.assert(defaultPlaylist.name === "none");
const defaultCurrentPlaying: CurrentPlaying = Object.freeze({
	playlist: defaultPlaylist,
	media: undefined,
	currentTime: 0,
});

export const useCurrentPlaying = create<CurrentPlayingAction>(
	persist(
		(set, get) => ({
			currentPlaying: defaultCurrentPlaying,
			setCurrentPlaying: (action: currentPlayingReducer_Action) => {
				const previousPlaying = get().currentPlaying;
				const playlists = getPlaylists().playlists;

				switch (action.type) {
					case CurrentPlayingType.PLAY_THIS_MEDIA: {
						dbg("setCurrentPlaying 'play this media' action =", action);
						// debugger;

						if (!action.media) {
							// ^ In case it received the [0] item from a Media[] that is empty.
							if (action.playlist.name === "none")
								console.error("Received 'none' playlist to play from!");
							dbg("There is no media!");
						}

						// We need to update history:
						if (
							previousPlaying.media &&
							previousPlaying.media.title !== action.media.title
						)
							getPlaylists().setPlaylists({
								type: PlaylistType.UPDATE_HISTORY,
								whatToDo: PlaylistActions.ADD,
								media: previousPlaying.media,
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

					case CurrentPlayingType.PLAY_PREVIOUS: {
						dbg("setCurrentPlaying 'play previous' action =", action);

						// eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
						const head = playlists.find(({ name }) => name === "history")!
							.list[0];

						head
							? set({
									currentPlaying: {
										currentTime: 0,
										playlist: action.playlist,
										media: head,
									},
							  })
							: dbg("There is no media!");
						break;
					}

					case CurrentPlayingType.RESUME: {
						(async () =>
							await (
								document.getElementById("audio") as HTMLAudioElement
							).play())();
						break;
					}

					case CurrentPlayingType.PAUSE: {
						const audio = document.getElementById("audio") as HTMLAudioElement;

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

					case CurrentPlayingType.PLAY_NEXT: {
						dbg("currentPlaying 'playNext' action =", action);

						const prevPlaylist = previousPlaying.playlist;
						if (previousPlaying.playlist.name === "none") {
							console.error("Can't play next media from the 'none' playlist!");
							dbg("There is no media!");
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
									"Can't play next media if there isn't one selected already.",
								);
								dbg("There is no media!");
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
			serialize: state => JSON.stringify(state.state.currentPlaying),
			deserialize: state => JSON.parse(state),
			partialize: state => ({ currentPlaying: state.currentPlaying }),
			merge: (persistedState, currentState) =>
				merge(persistedState, currentState),
		},
	),
);

useCurrentPlaying.subscribe(async function setAudioToHTMLAudioElement() {
	const { getState: getCurrentPlaying } = useCurrentPlaying;
	const { currentPlaying } = getCurrentPlaying();

	if (!window || !currentPlaying.media) return;

	console.time("Reading <audio> file");
	const url = URL.createObjectURL(
		new Blob([await readFile(currentPlaying.media.path)]),
	);
	console.timeEnd("Reading <audio> file");

	const audio = document.getElementById("audio") as HTMLAudioElement;
	audio.src = url;

	audio.addEventListener("canplay", () => {
		console.log("Audio can play.");
		dbg({
			currentTime: audio.currentTime,
			duration: audio.duration,
		});
	});
	audio.addEventListener("loadedmetadata", () => {
		console.log("Audio was loadedmetadata. Setting currentTime...");
		audio.currentTime = currentPlaying.currentTime;
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
	audio.addEventListener("error", e => console.error("Audio error:", e));
	audio.addEventListener("abort", e => console.log("Audio was aborted:", e));
	// debugger;
});

export type CurrentPlaying = Readonly<{
	currentTime: number;
	playlist: Playlist;
	media?: Media;
}>;

export type currentPlayingReducer_Action =
	| Readonly<{
			type: CurrentPlayingType.PLAY_THIS_MEDIA;
			media: Media;
			playlist: Playlist;
	  }>
	| Readonly<{ type: CurrentPlayingType.PLAY_PREVIOUS; playlist: Playlist }>
	| Readonly<{ type: CurrentPlayingType.PLAY_NEXT; playlist: Playlist }>
	| Readonly<{ type: CurrentPlayingType.RESUME }>
	| Readonly<{ type: CurrentPlayingType.PAUSE }>;

export enum CurrentPlayingType {
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
