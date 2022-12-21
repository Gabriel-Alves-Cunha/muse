import type { MsgObjectElectronToReact } from "@common/@types/electron-window";

import { type MsgWithSource, electronSource } from "@common/crossCommunication";
import { ElectronToReactMessage } from "@common/enums";
import { assertUnreachable } from "./utils";
import { setDownloadInfo } from "@components/Downloading";
import { getMediaFiles } from "@contexts/usePlaylistsHelper";
import { getSettings } from "@contexts/settings";
import { emptyString } from "@common/empty";
import { deleteFile } from "./deleteFile";
import { error } from "@common/log";
import { dbg } from "@common/debug";
import {
	searchLocalComputerForMedias,
	addToMainList,
	refreshMedia,
	getMainList,
	removeMedia,
} from "@contexts/usePlaylists";

const { transformPathsToMedias } = electron.media;

//////////////////////////////////////////
//////////////////////////////////////////
//////////////////////////////////////////
// Listen for files drop:

const listenToDragoverEvent = (event: DragEvent): void => {
	event.stopPropagation();
	event.preventDefault();

	if (!event.dataTransfer) return;

	event.dataTransfer.dropEffect = "link";
	// ^ Style the drag-and-drop as a "link file" operation.
};

//////////////////////////////////////////

const listenToDropEvent = (event: DragEvent): void => {
	event.stopPropagation();
	event.preventDefault();

	if (!event.dataTransfer) return;

	const fileList = event.dataTransfer.files;
	const files = getMediaFiles(fileList);

	if (files.length === 0) return;

	error("@TODO: handle these files droped!", { fileList, files });
};

//////////////////////////////////////////

window.addEventListener("dragover", listenToDragoverEvent);
window.addEventListener("drop", listenToDropEvent);

//////////////////////////////////////////
//////////////////////////////////////////
//////////////////////////////////////////
// Main function:

const {
	DELETE_ONE_MEDIA_FROM_COMPUTER,
	CREATE_A_NEW_DOWNLOAD,
	REFRESH_ALL_MEDIA,
	REFRESH_ONE_MEDIA,
	REMOVE_ONE_MEDIA,
	ADD_ONE_MEDIA,
	ERROR,
} = ElectronToReactMessage;

//////////////////////////////////////////

export const handleWindowMsgs = async (event: Event): Promise<void> => {
	if (event.data.source !== electronSource) return;

	dbg("Received message from Electron.\ndata =", event.data);
	const { msg } = event.data;

	switch (msg.type) {
		//////////////////////////////////////////

		case CREATE_A_NEW_DOWNLOAD: {
			dbg("[handleWindowMsgs()] Create a new download:", msg.downloadInfo);
			setDownloadInfo(msg.downloadInfo);
			break;
		}

		//////////////////////////////////////////

		case ADD_ONE_MEDIA: {
			const { mediaPath } = msg;
			const {
				assureMediaSizeIsGreaterThan60KB,
				ignoreMediaWithLessThan60Seconds,
			} = getSettings();

			dbg("[handleWindowMsgs()] Add one media:", mediaPath);

			const [newMedia] = await transformPathsToMedias(
				mediaPath,
				assureMediaSizeIsGreaterThan60KB,
				ignoreMediaWithLessThan60Seconds,
			);

			if (!newMedia) {
				error(`Could not transform "${mediaPath}" to a media.`);
				break;
			}

			addToMainList(newMedia[0], newMedia[1]);
			break;
		}

		//////////////////////////////////////////

		case DELETE_ONE_MEDIA_FROM_COMPUTER: {
			const { mediaPath } = msg;

			dbg("[handleWindowMsgs()] Delete one media from computer:", mediaPath);

			if (!getMainList().has(mediaPath)) {
				error("Could not find media to delete.");
				break;
			}

			await deleteFile(mediaPath);
			break;
		}

		//////////////////////////////////////////

		case REFRESH_ALL_MEDIA: {
			dbg("[handleWindowMsgs()] Refresh all media.");
			await searchLocalComputerForMedias();
			break;
		}

		//////////////////////////////////////////

		case REFRESH_ONE_MEDIA: {
			const { mediaPath } = msg;

			dbg("[handleWindowMsgs()] Refresh one media:", mediaPath);

			await refreshMedia(mediaPath, emptyString);
			break;
		}

		//////////////////////////////////////////

		case REMOVE_ONE_MEDIA: {
			const { mediaPath } = msg;

			dbg("[handleWindowMsgs()] Remove one media:", mediaPath);

			if (!getMainList().has(mediaPath)) {
				error(
					`I wasn't able to find this path "${mediaPath}" to a media to be removed!`,
				);
				break;
			}

			removeMedia(mediaPath);
			break;
		}

		//////////////////////////////////////////

		case ERROR: {
			error("@TODO: ERROR", { error: msg.error });
			break;
		}

		//////////////////////////////////////////

		default: {
			error(
				`There is no method to handle this event.data: (${typeof msg}) '`,
				msg,
				"'\nEvent =",
				event,
			);

			assertUnreachable(msg);
		}
	}
};

//////////////////////////////////////////
//////////////////////////////////////////
//////////////////////////////////////////
// types:

type Event = Readonly<MessageEvent<MsgWithSource<MsgObjectElectronToReact>>>;
