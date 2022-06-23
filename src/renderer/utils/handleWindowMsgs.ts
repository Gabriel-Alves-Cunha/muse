import type { Media, Path } from "@common/@types/generalTypes";

import { getDownloadingList, setDownloadingList } from "@contexts/downloadList";
import { getConvertingList, setConvertingList } from "@contexts/convertList";
import { electronSource, type MsgWithSource } from "@common/crossCommunication";
import { assertUnreachable } from "./utils";
import { setDownloadInfo } from "@components/Downloading";
import { ProgressStatus } from "@common/enums";
import { getMediaFiles } from "@contexts/mediaHandler/usePlaylistsHelper";
import { getSettings } from "@contexts/settings";
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

//////////////////////////////////////////
//////////////////////////////////////////
//////////////////////////////////////////

// listen for files drop
function listenToDragoverEvent(event: Readonly<DragEvent>): void {
	event.stopPropagation();
	event.preventDefault();

	if (!event.dataTransfer) return;

	event.dataTransfer.dropEffect = "copy";
	// ^ Style the drag-and-drop as a "copy file" operation.
}

function listenToDropEvent(event: Readonly<DragEvent>): void {
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

//////////////////////////////////////////
//////////////////////////////////////////
//////////////////////////////////////////

const {
	DELETE_ONE_MEDIA_FROM_COMPUTER,
	CREATE_CONVERSION_FAILED,
	CREATE_DOWNLOAD_FAILED,
	CREATE_A_NEW_DOWNLOAD,
	NEW_COVERSION_CREATED,
	NEW_DOWNLOAD_CREATED,
	REFRESH_ALL_MEDIA,
	REFRESH_ONE_MEDIA,
	REMOVE_ONE_MEDIA,
	ADD_ONE_MEDIA,
	ERROR,
} = ElectronToReactMessageEnum;

export async function handleWindowMsgs(event: Event): Promise<void> {
	if (event.data.source !== electronSource) return;

	dbg("Received message from Electron.\ndata =", event.data);
	const { msg } = event.data;

	switch (msg.type) {
		case CREATE_A_NEW_DOWNLOAD: {
			dbg("Create a new download.");
			setDownloadInfo(msg.downloadInfo);
			break;
		}

		case NEW_DOWNLOAD_CREATED: {
			dbg("New download created.");

			const { downloadingList } = getDownloadingList();
			// In here, there has to be a download WAITING:
			const download = downloadingList.get(msg.url);

			dbg({ downloadingList_: downloadingList, url: msg.url, download });

			if (!download) {
				console.error(
					"There should be a download to be confirmed on `downloadingList`, but there is none!",
				);
				break;
			}

			setDownloadingList({
				downloadingList: new Map(downloadingList).set(msg.url, {
					...download,
					status: ProgressStatus.ACTIVE,
				}),
			});
			break;
		}

		case NEW_COVERSION_CREATED: {
			dbg("New conversion created.");

			const { convertingList } = getConvertingList();
			const { path } = msg;
			// In here, there has to be a conversion WAITING:
			const convertingMedia = convertingList.get(path);

			dbg({ convertingList, path, convertingMedia });

			// In here, there has to be a conversion WAITING
			if (!convertingMedia) {
				console.error(
					"There should be a convertion to be confirmed on `convertingList`, but there is none!",
				);
				break;
			}

			setConvertingList({
				convertingList: new Map(convertingList).set(path, {
					...convertingMedia,
					status: ProgressStatus.ACTIVE,
				}),
			});
			break;
		}

		case CREATE_CONVERSION_FAILED: {
			console.error("Create conversion failed!");

			const { convertingList } = getConvertingList();
			const { path } = msg;
			// In here, there has to be a conversion WAITING
			const convertingMedia = convertingList.get(path);

			dbg({ convertingList, path, convertingMedia });

			if (!convertingMedia) {
				console.error(
					"There should be a convertion to be confirmed on `convertingList`, but there is none!",
				);
				break;
			}

			setConvertingList({
				convertingList: new Map(convertingList).set(path, {
					...convertingMedia,
					status: ProgressStatus.FAILED,
				}),
			});
			break;
		}

		case CREATE_DOWNLOAD_FAILED: {
			console.error("Download failed!");

			const { downloadingList } = getDownloadingList();
			const { url } = msg;
			// In here, there has to be a download WAITING:
			const download = downloadingList.get(url);

			dbg({ downloadingList, url, download });

			if (!download) {
				console.error(
					"There should be a download to be confirmed on `downloadingList`, but there is none!",
				);
				break;
			}

			setDownloadingList({
				downloadingList: new Map(downloadingList).set(url, {
					...download,
					status: ProgressStatus.FAILED,
				}),
			});
			break;
		}

		case ADD_ONE_MEDIA: {
			const { mediaPath } = msg;

			dbg("At ListenToNotification.ADD_ONE_MEDIA:", { mediaPath });

			const {
				assureMediaSizeIsGreaterThan60KB,
				ignoreMediaWithLessThan60Seconds,
			} = getSettings();
			const newMediaInArray: readonly [Path, Media][] =
				await transformPathsToMedias(
					[mediaPath],
					assureMediaSizeIsGreaterThan60KB,
					ignoreMediaWithLessThan60Seconds,
				);

			const newMedia = newMediaInArray[0]?.[1];

			if (!newMedia) {
				console.error(`Could not transform "${mediaPath}" to a media.`);
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

		case DELETE_ONE_MEDIA_FROM_COMPUTER: {
			const { mediaPath } = msg;

			dbg("At ListenToNotification.DELETE_ONE_MEDIA_FROM_COMPUTER:", {
				mediaPath,
			});

			if (!mainList().has(mediaPath)) {
				console.error("Could not find media to delete.");
				break;
			}

			deleteMedia(mediaPath).then(() =>
				console.log(`Media "${mediaPath}" deleted.`)
			).catch(console.error);
			break;
		}

		case REFRESH_ALL_MEDIA: {
			dbg("Refresh all media.");
			await searchLocalComputerForMedias();
			break;
		}

		case REFRESH_ONE_MEDIA: {
			const { mediaPath } = msg;

			dbg("At REFRESH_ONE_MEDIA:", { mediaPath });

			if (!mainList().has(mediaPath)) {
				console.warn(
					`There should be a media with path = "${mediaPath}" to be refreshed, but there isn't!\nRefreshing all media instead.`,
				);
				await searchLocalComputerForMedias();
				break;
			}

			const {
				assureMediaSizeIsGreaterThan60KB,
				ignoreMediaWithLessThan60Seconds,
			} = getSettings();
			const refreshedMediaInArray: readonly [Path, Media][] =
				await transformPathsToMedias(
					[mediaPath],
					assureMediaSizeIsGreaterThan60KB,
					ignoreMediaWithLessThan60Seconds,
				);

			const refreshedMedia = refreshedMediaInArray[0]?.[1];

			if (!refreshedMedia) {
				console.error(
					`I wasn't able to transform this path (${mediaPath}) to a media to be refreshed!\nRefreshing all media instead.`,
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

		case REMOVE_ONE_MEDIA: {
			const { mediaPath } = msg;

			dbg("At REMOVE_ONE_MEDIA:", { mediaPath });

			if (!mainList().has(mediaPath)) {
				console.error(
					`I wasn't able to find this path "${mediaPath}" to a media to be removed!`,
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

		case ERROR: {
			console.error("@TODO: ERROR", msg.error);

			break;
		}

		default: {
			console.error(
				`There is no method to handle this event.data: (${typeof msg}) '`,
				msg,
				"'\nEvent =",
				event,
			);

			assertUnreachable(msg);
			break;
		}
	}
}

type Event = Readonly<MessageEvent<MsgWithSource<MsgObjectElectronToReact>>>;
