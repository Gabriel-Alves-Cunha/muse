import type { MsgObjectElectronToReact } from "@common/@types/electron-window";
import type { Media, Path } from "@common/@types/generalTypes";

import { type MsgWithSource, electronSource } from "@common/crossCommunication";
import { electronToReactMessage } from "@common/enums";
import { assertUnreachable } from "./utils";
import { setDownloadInfo } from "@components/Downloading";
import { getMediaFiles } from "@contexts/usePlaylistsHelper";
import { getSettings } from "@contexts/settings";
import { emptyString } from "@common/empty";
import { deleteFile } from "./deleteFile";
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

function listenToDragoverEvent(event: Readonly<DragEvent>): void {
	event.stopPropagation();
	event.preventDefault();

	if (event.dataTransfer === null) return;

	event.dataTransfer.dropEffect = "copy";
	// ^ Style the drag-and-drop as a "copy file" operation.
}

//////////////////////////////////////////

function listenToDropEvent(event: Readonly<DragEvent>): void {
	event.stopPropagation();
	event.preventDefault();

	if (event.dataTransfer === null) return;

	const fileList = event.dataTransfer.files;
	const files = getMediaFiles(fileList);

	console.log({ fileList, files });
	console.error("@TODO: handle these files droped!", files);
}

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
} = electronToReactMessage;

//////////////////////////////////////////

export async function handleWindowMsgs(event: Event): Promise<void> {
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

			const newMediaInArray: readonly [Path, Media][] =
				await transformPathsToMedias(
					[mediaPath],
					assureMediaSizeIsGreaterThan60KB,
					ignoreMediaWithLessThan60Seconds,
				);

			const newMedia = newMediaInArray[0]?.[1];

			if (newMedia === undefined) {
				console.error(`Could not transform "${mediaPath}" to a media.`);
				break;
			}

			addToMainList(mediaPath, newMedia);
			break;
		}

		//////////////////////////////////////////

		case DELETE_ONE_MEDIA_FROM_COMPUTER: {
			const { mediaPath } = msg;

			dbg("[handleWindowMsgs()] Delete one media from computer:", mediaPath);

			if (!getMainList().has(mediaPath)) {
				console.error("Could not find media to delete.");
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
				console.error(
					`I wasn't able to find this path "${mediaPath}" to a media to be removed!`,
				);
				break;
			}

			removeMedia(mediaPath);
			break;
		}

		//////////////////////////////////////////

		case ERROR: {
			console.error("@TODO: ERROR", { error: msg.error });

			break;
		}

		//////////////////////////////////////////

		default: {
			console.error(
				`There is no method to handle this event.data: (${typeof msg}) '`,
				msg,
				"'\nEvent =",
				event,
			);

			assertUnreachable(msg);
		}
	}
}

//////////////////////////////////////////
//////////////////////////////////////////
//////////////////////////////////////////
// types:

type Event = Readonly<MessageEvent<MsgWithSource<MsgObjectElectronToReact>>>;
