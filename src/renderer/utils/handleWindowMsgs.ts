import type { Media, Path } from "@common/@types/generalTypes";

import { downloadingList, setDownloadingList } from "@contexts/downloadList";
import { electronSource, type MsgWithSource } from "@common/crossCommunication";
import { convertingList, setConvertingList } from "@contexts/convertList";
import { assertUnreachable } from "./utils";
import { setDownloadInfo } from "@modules/Downloading";
import { ProgressStatus } from "@common/enums";
import { getMediaFiles } from "@contexts/mediaHandler/usePlaylistsHelper";
import { dbg } from "@common/utils";
import {
	searchLocalComputerForMedias,
	PlaylistActions,
	setPlaylists,
	deleteMedia,
	WhatToDo,
	mainList,
} from "@contexts/mediaHandler/usePlaylists";
import {
	type MsgObjectElectronToReact,
	ElectronToReactMessageEnum,
} from "@common/@types/electron-window";

const { transformPathsToMedias } = electron.media;

// listen for files drop
function listenToDragoverEvent(event: DragEvent) {
	event.stopPropagation();
	event.preventDefault();

	if (!event.dataTransfer) return;

	event.dataTransfer.dropEffect = "copy";
	// ^ Style the drag-and-drop as a "copy file" operation.
}

function listenToDropEvent(event: DragEvent) {
	event.stopPropagation();
	event.preventDefault();

	if (!event.dataTransfer) return;

	const fileList = event.dataTransfer.files;
	const files = getMediaFiles(fileList);

	console.log({ fileList, files });
	console.warn("@TODO: handle these files droped!", files);
}

window.addEventListener("dragover", listenToDragoverEvent);
window.addEventListener("drop", listenToDropEvent);

export async function handleWindowMsgs(
	event: MessageEvent<MsgWithSource<MsgObjectElectronToReact>>
): Promise<void> {
	if (event.data.source !== electronSource) return;

	dbg("Received message from Electron.\ndata =", event.data);
	const { msg } = event.data;

	switch (msg.type) {
		case ElectronToReactMessageEnum.CREATE_A_NEW_DOWNLOAD: {
			dbg("Create a new download.");
			setDownloadInfo(msg.downloadInfo);
			break;
		}

		case ElectronToReactMessageEnum.NEW_DOWNLOAD_CREATED: {
			dbg("New download created.");

			const downloadingList_ = downloadingList();
			// In here, there has to be a download WAITING:
			const download = downloadingList_.get(msg.url);

			dbg({ downloadingList_, url: msg.url, download });

			if (!download) {
				console.error(
					"There should be a download to be confirmed on `downloadingList`, but there is none!"
				);
				break;
			}

			setDownloadingList(
				downloadingList_.set(msg.url, {
					...download,
					status: ProgressStatus.ACTIVE,
				})
			);
			break;
		}

		case ElectronToReactMessageEnum.NEW_COVERSION_CREATED: {
			dbg("New conversion created.");

			const convertingList_ = convertingList();
			// In here, there has to be a conversion WAITING:
			const convertingMedia = convertingList_.get(msg.path);

			dbg({ convertingList_, path: msg.path, convertingMedia });

			// In here, there has to be a conversion WAITING
			if (!convertingMedia) {
				console.error(
					"There should be a convertion to be confirmed on `convertingList`, but there is none!"
				);
				break;
			}

			setConvertingList(
				convertingList_.set(msg.path, {
					...convertingMedia,
					status: ProgressStatus.ACTIVE,
				})
			);
			break;
		}

		case ElectronToReactMessageEnum.CREATE_CONVERSION_FAILED: {
			console.error("Create conversion failed!");

			const convertingList_ = convertingList();
			// In here, there has to be a conversion WAITING
			const convertingMedia = convertingList_.get(msg.path);

			dbg({ convertingList_, path: msg.path, convertingMedia });

			if (!convertingMedia) {
				console.error(
					"There should be a convertion to be confirmed on `convertingList`, but there is none!"
				);
				break;
			}

			setConvertingList(
				convertingList_.set(msg.path, {
					...convertingMedia,
					status: ProgressStatus.FAILED,
				})
			);
			break;
		}

		case ElectronToReactMessageEnum.CREATE_DOWNLOAD_FAILED: {
			console.error("Download failed!");

			const downloadingList_ = downloadingList();
			// In here, there has to be a download WAITING:
			const download = downloadingList_.get(msg.url);

			dbg({ downloadingList_, url: msg.url, download });

			if (!download) {
				console.error(
					"There should be a download to be confirmed on `downloadingList`, but there is none!"
				);
				break;
			}

			setDownloadingList(
				downloadingList_.set(msg.url, {
					...download,
					status: ProgressStatus.FAILED,
				})
			);
			break;
		}

		case ElectronToReactMessageEnum.ADD_ONE_MEDIA: {
			const { mediaPath } = msg;

			dbg("At ListenToNotification.ADD_MEDIA:", { mediaPath });

			const newMediaInArray: readonly [Path, Media][] =
				await transformPathsToMedias([mediaPath]);

			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			const newMedia = newMediaInArray[0]![1];

			if (!newMedia) {
				console.error(`Could not transform "${mediaPath}" to media.`);
				break;
			}

			setPlaylists({
				whatToDo: PlaylistActions.ADD_ONE_MEDIA,
				type: WhatToDo.UPDATE_MAIN_LIST,
				path: mediaPath,
				newMedia,
			});
			break;
		}

		case ElectronToReactMessageEnum.DELETE_ONE_MEDIA_FROM_COMPUTER: {
			const { mediaPath } = msg;

			dbg("At ListenToNotification.DELETE_ONE_MEDIA_FROM_COMPUTER:", {
				mediaPath,
			});

			if (!mainList().has(mediaPath)) {
				console.error("Could not find media to delete.");
				break;
			}

			deleteMedia(mediaPath)
				.then(() => console.log(`Media "${mediaPath}" deleted.`))
				.catch(console.error);
			break;
		}

		case ElectronToReactMessageEnum.REFRESH_ALL_MEDIA: {
			dbg("Refresh all media.");
			await searchLocalComputerForMedias();
			break;
		}

		case ElectronToReactMessageEnum.REFRESH_ONE_MEDIA: {
			const { mediaPath } = msg;

			dbg("At ElectronToReactMessageEnum.REFRESH_MEDIA:", { mediaPath });

			if (!mainList().has(mediaPath)) {
				console.warn(
					`There should be a media with path = "${mediaPath}" to be refreshed, but there isn't!\nRefreshing all media instead.`
				);
				await searchLocalComputerForMedias();
				break;
			}

			const refreshedMediaInArray: readonly [Path, Media][] =
				await transformPathsToMedias([mediaPath]);

			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			const refreshedMedia = refreshedMediaInArray[0]![1];

			if (!refreshedMedia) {
				console.error(
					`I wasn't able to transform this path (${mediaPath}) to a media to be refreshed!\nRefreshing all media.`
				);
				await searchLocalComputerForMedias();
				break;
			}

			setPlaylists({
				whatToDo: PlaylistActions.REFRESH_ONE_MEDIA_BY_PATH,
				type: WhatToDo.UPDATE_MAIN_LIST,
				newMedia: refreshedMedia,
				path: mediaPath,
			});
			break;
		}

		case ElectronToReactMessageEnum.REMOVE_ONE_MEDIA: {
			const { mediaPath } = msg;

			dbg("At ElectronToReactMessageEnum.REMOVE_MEDIA:", { mediaPath });

			if (!mainList().has(mediaPath)) {
				console.error(
					`I wasn't able to find this path "${mediaPath}" to a media to be removed!`
				);
				break;
			}

			setPlaylists({
				whatToDo: PlaylistActions.REMOVE_ONE_MEDIA_BY_PATH,
				type: WhatToDo.UPDATE_MAIN_LIST,
				path: mediaPath,
			});
			break;
		}

		case ElectronToReactMessageEnum.ERROR: {
			console.error("@TODO: ERROR", msg.error);

			break;
		}

		default: {
			console.error(
				`There is no method to handle this event.data: (${typeof msg}) '`,
				msg,
				"'\nEvent =",
				event
			);

			assertUnreachable(msg);
			break;
		}
	}
}
