import type { PlaylistsReducer_Action, Playlist } from "./usePlaylists";
import type { PlayOptions } from "./usePlayOptions";
import type { Dispatch } from "react";
import type { Media } from "@common/@types/typesAndEnums";

import { useEffect, useReducer } from "react";

import { assertUnreachable, getRandomInt } from "@renderer/utils/utils";
import { useLocalStorage } from "@hooks";
import { keyPrefix } from "@renderer/utils/app";
import { dbg } from "@common/utils";
import {
	Actions as PlaylistActions,
	Type as PlaylistType,
	defaultPlaylists,
} from "./usePlaylists";
const {
	fs: { readFile },
} = electron;

const currentPlayingKey = keyPrefix + "current_playing";

export function useCurrentPlaying({
	dispatchPlaylists,
	playOptions,
	playlists,
}: Props) {
	const [cachedCurrentPlaying, setCachedCurrentPlaying] = useLocalStorage(
		currentPlayingKey,
		defaultCurrentPlaying,
	);

	const [currentPlaying, dispatchCurrentPlaying] = useReducer(
		currentPlayingReducer,
		cachedCurrentPlaying,
	);

	function currentPlayingReducer(
		previousPlaying: CurrentPlaying,
		action: currentPlayingReducer_Action,
	): CurrentPlaying {
		switch (action.type) {
			case Type.THERE_IS_NO_MEDIA: {
				dbg("there is no media");

				setCachedCurrentPlaying(defaultCurrentPlaying);

				return cachedCurrentPlaying;
				break;
			}

			case Type.NEW: {
				dbg("currentPlaying 'new' action =", action);

				if (!action.media) return previousPlaying;
				if (action.playlist.name === "none") {
					console.error(
						"Received 'none' playlist to play (from 'new' currentPlaying)!",
					);

					return currentPlayingReducer(previousPlaying, {
						type: Type.THERE_IS_NO_MEDIA,
					});
				}

				// We need to update history:
				if (
					previousPlaying.media &&
					previousPlaying.media.title !== action.media.title
				)
					dispatchPlaylists({
						type: PlaylistType.UPDATE_HISTORY,
						whatToDo: PlaylistActions.ADD,
						media: previousPlaying.media,
					});

				const newCurrentPlaying: CurrentPlaying = {
					playlist: action.playlist,
					media: action.media,
					currentTime: 0,
				};

				setCachedCurrentPlaying(newCurrentPlaying);

				return newCurrentPlaying;
				break;
			}

			case Type.PLAY_THIS_MEDIA: {
				dbg("currentPlaying 'play this media' action =", action);
				// debugger;

				if (!action.media) {
					// ^ In case it received the [0] item from a Media[] that is empty.
					if (action.playlist.name !== "none")
						return currentPlayingReducer(previousPlaying, {
							playlist: action.playlist,
							media: action.media,
							type: Type.NEW,
						});
					else
						return currentPlayingReducer(previousPlaying, {
							type: Type.THERE_IS_NO_MEDIA,
						});
				}

				return currentPlayingReducer(previousPlaying, {
					playlist: action.playlist,
					media: action.media,
					type: Type.NEW,
				});
				break;
			}

			case Type.PLAY_PREVIOUS: {
				dbg("currentPlaying 'play previous' action =", action);

				// eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
				const head = playlists.find(({ name }) => name === "history")!.list[0];

				if (head)
					return currentPlayingReducer(previousPlaying, {
						playlist: action.playlist,
						type: Type.PLAY_THIS_MEDIA,
						media: head,
					});
				else
					return currentPlayingReducer(previousPlaying, {
						type: Type.THERE_IS_NO_MEDIA,
					});
				break;
			}

			case Type.RESUME: {
				(async () =>
					await (
						document.getElementById("audio") as HTMLAudioElement
					).play())();

				return previousPlaying;
				break;
			}

			case Type.PAUSE: {
				const audio = document.getElementById("audio") as HTMLAudioElement;

				audio.pause();

				const newCurrentPlaying: CurrentPlaying = {
					playlist: previousPlaying.playlist,
					currentTime: audio.currentTime,
					media: previousPlaying.media,
				};

				setCachedCurrentPlaying(newCurrentPlaying);

				return newCurrentPlaying;
				break;
			}

			case Type.PLAY_NEXT: {
				dbg("currentPlaying 'playNext' action =", action);

				const prevPlaylist = previousPlaying.playlist;
				if (previousPlaying.playlist.name === "none") {
					console.error("Can't play next media from the 'none' playlist!");

					return currentPlayingReducer(previousPlaying, {
						type: Type.THERE_IS_NO_MEDIA,
					});
				}

				const prevMedia = previousPlaying.media;

				if (playOptions.loopThisMedia) {
					if (!prevMedia)
						return currentPlayingReducer(previousPlaying, {
							type: Type.THERE_IS_NO_MEDIA,
						});
					else
						return currentPlayingReducer(previousPlaying, {
							type: Type.PLAY_THIS_MEDIA,
							playlist: prevPlaylist,
							media: prevMedia,
						});
				}

				if (playOptions.isRandom) {
					const randomIndex = getRandomInt(0, prevPlaylist.list.length);
					const randomMedia = prevPlaylist.list[randomIndex];

					return currentPlayingReducer(previousPlaying, {
						type: Type.PLAY_THIS_MEDIA,
						playlist: prevPlaylist,
						media: randomMedia,
					});
				} else {
					if (!prevMedia) {
						console.error(
							"Can't play next media if there isn't one selected already!",
						);

						return currentPlayingReducer(previousPlaying, {
							type: Type.THERE_IS_NO_MEDIA,
						});
					}

					const nextMediaFromTheSameList =
						prevPlaylist.list[prevMedia.index + 1];

					if (!nextMediaFromTheSameList) {
						// ^ In case it is in the final of the list (it would receive undefined):
						const firstMediaFromTheSameList = prevPlaylist.list[0];

						return currentPlayingReducer(previousPlaying, {
							media: firstMediaFromTheSameList,
							type: Type.PLAY_THIS_MEDIA,
							playlist: prevPlaylist,
						});
					}

					return currentPlayingReducer(previousPlaying, {
						media: nextMediaFromTheSameList,
						type: Type.PLAY_THIS_MEDIA,
						playlist: prevPlaylist,
					});
					break;
				}
			}

			default:
				return assertUnreachable(action);
		}
	}

	useEffect(() => {
		(async function setAudioToHTMLAudioElement() {
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
			audio.addEventListener("abort", e =>
				console.log("Audio was aborted:", e),
			);
			// debugger;
		})();
	}, [currentPlaying]);

	return [currentPlaying, dispatchCurrentPlaying] as const;
}

useCurrentPlaying.whyDidYouRender = {
	customName: "useCurrentPlaying",
	logOnDifferentValues: false,
};

const defaultCurrentPlaying: CurrentPlaying = {
	// eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
	playlist: defaultPlaylists.find(({ name }) => name === "none")!,
	media: undefined,
	currentTime: 0,
};

export type CurrentPlaying = Readonly<{
	currentTime: number;
	playlist: Playlist;
	media?: Media;
}>;

export type currentPlayingReducer_Action =
	| Readonly<{ type: Type.PLAY_THIS_MEDIA; media: Media; playlist: Playlist }>
	| Readonly<{ type: Type.NEW; media: Media; playlist: Playlist }>
	| Readonly<{ type: Type.PLAY_PREVIOUS; playlist: Playlist }>
	| Readonly<{ type: Type.PLAY_NEXT; playlist: Playlist }>
	| Readonly<{ type: Type.THERE_IS_NO_MEDIA }>
	| Readonly<{ type: Type.RESUME }>
	| Readonly<{ type: Type.PAUSE }>;

export enum Type {
	THERE_IS_NO_MEDIA,
	PLAY_THIS_MEDIA,
	PLAY_PREVIOUS,
	PLAY_NEXT,
	RESUME,
	PAUSE,
	NEW,
}

type Props = Readonly<{
	dispatchPlaylists: Dispatch<PlaylistsReducer_Action>;
	playlists: readonly Playlist[];
	playOptions: PlayOptions;
}>;
