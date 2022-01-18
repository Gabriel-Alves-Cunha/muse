import type { PlaylistsReducer_Action, Playlist } from "./usePlaylists";
import type { PlayOptions } from "./usePlayOptions";
import type { Dispatch } from "react";
import type { Media } from "@common/@types/types";

import { useEffect, useReducer } from "react";

import { assertUnreachable, getRandomInt } from "@renderer/utils/utils";
import { defaultPlaylists } from "./usePlaylists";
import { useLocalStorage } from "@hooks";
import { keyPrefix } from "@renderer/utils/app";
import { dbg } from "@common/utils";
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
						"Received 'none' playlist to play (from 'new' currentPlaying)!",
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
					dispatchPlaylists({
						media: previousPlaying.media,
						type: "update history",
						whatToDo: "add",
					});

				const newCurrentPlaying: CurrentPlaying = {
					playlist: action.playlist,
					media: action.media,
					currentTime: 0.0,
				};

				setCachedCurrentPlaying(newCurrentPlaying);

				return newCurrentPlaying;
				break;
			}

			case "play this media": {
				dbg("currentPlaying 'play this media' action =", action);
				// debugger;

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

				return previousPlaying;
				break;
			}

			case "pause": {
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
							"Can't play next media if there isn't one selected already!",
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
				console.log("Audio can play");
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
	currentTime: 0.0,
	media: undefined,
};

export type CurrentPlaying = Readonly<{
	currentTime: number;
	playlist: Playlist;
	media?: Media;
}>;

export type currentPlayingReducer_Action =
	| Readonly<{ type: "play this media"; media: Media; playlist: Playlist }>
	| Readonly<{ type: "new"; media: Media; playlist: Playlist }>
	| Readonly<{ type: "play previous"; playlist: Playlist }>
	| Readonly<{ type: "play next"; playlist: Playlist }>
	| Readonly<{ type: "there is no media" }>
	| Readonly<{ type: "resume" }>
	| Readonly<{ type: "pause" }>;

type Props = Readonly<{
	dispatchPlaylists: Dispatch<PlaylistsReducer_Action>;
	playlists: readonly Playlist[];
	playOptions: PlayOptions;
}>;
