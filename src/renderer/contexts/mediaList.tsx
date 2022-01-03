import type { MediaList_ProviderProps, MediaList_ContextProps } from "./types";
import type { ListenToNotification } from "@common/@types/electron-window";
import type { Media, Path } from "@common/@types/types";

import { createContext, useContext, useEffect } from "react";

import { usePlaylists, useCurrentPlaying } from "@hooks";
import { assertUnreachable } from "@utils/utils";
import { dbg } from "@utils/app";
import {
	searchDirectoryResult,
	getAllowedMedias,
	getMediaFiles,
} from "./mediaListHelper";
const {
	media: { transformPathsToMedias },
	fs: { rm },
} = electron;

const MediaList_Context = createContext({} as MediaList_ContextProps);

function MediaList_Provider({ children }: MediaList_ProviderProps) {
	////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////
	const [playlists, dispatchPlaylists] = usePlaylists();
	const [currentPlaying] = useCurrentPlaying();

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

	return (
		<MediaList_Context.Provider
			value={{
				functions: {
					searchLocalComputerForMedias,
					searchForMedia,
					deleteMedia,
				},
				values: {
					currentPlaying,
				},
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
