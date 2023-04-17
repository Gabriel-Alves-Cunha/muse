import type { MsgObjectElectronToReact } from "@common/@types/ElectronApi";

import { type MsgWithSource, electronSource } from "@common/crossCommunication";
import { ElectronToReactMessageEnum } from "@common/enums";
import { isAModifierKeyPressed } from "./keyboard";
import { createNewDownload } from "@components/Downloading/helper";
import { assertUnreachable } from "./utils";
import { togglePlayPause } from "@contexts/currentPlaying";
import { getMediaFiles } from "@contexts/playlistsHelper";
import { getSettings } from "@contexts/settings";
import { deleteFile } from "./deleteFile";
import { error } from "@common/log";
import { dbg } from "@common/debug";
import {
	searchLocalComputerForMedias,
	addToMainList,
	getPlaylists,
	rescanMedia,
	removeMedia,
} from "@contexts/playlists";

const { transformPathsToMedias } = electronApi.media;

//////////////////////////////////////////
//////////////////////////////////////////
//////////////////////////////////////////
// Listen for files drop:

function listenToDragoverEvent(event: DragEvent): void {
	event.stopPropagation();
	event.preventDefault();

	if (!event.dataTransfer) return;

	event.dataTransfer.dropEffect = "link";
	// ^ Style the drag-and-drop as a "link file" operation.
}

//////////////////////////////////////////

function listenToDropEvent(event: DragEvent): void {
	event.stopPropagation();
	event.preventDefault();

	if (!event.dataTransfer) return;

	const fileList = event.dataTransfer.files;
	const files = getMediaFiles(fileList);

	if (files.length === 0) return;

	error("@TODO: handle these files droped!", { fileList, files });
}

//////////////////////////////////////////

window.addEventListener("dragover", listenToDragoverEvent);
window.addEventListener("drop", listenToDropEvent);

//////////////////////////////////////////

function playOrPauseOnSpaceKey(e: KeyboardEvent): void {
	if (e.key === " " && !isAModifierKeyPressed(e)) togglePlayPause();
}

window.addEventListener("keyup", playOrPauseOnSpaceKey);

//////////////////////////////////////////
//////////////////////////////////////////
//////////////////////////////////////////
// Main function:

const {
	DELETE_ONE_MEDIA_FROM_COMPUTER,
	CREATE_A_NEW_DOWNLOAD,
	RESCAN_ALL_MEDIA,
	RESCAN_ONE_MEDIA,
	REMOVE_ONE_MEDIA,
	ADD_ONE_MEDIA,
	ERROR,
} = ElectronToReactMessageEnum;

//////////////////////////////////////////

export async function handleWindowMsgsFromElectron(
	event: Event,
): Promise<void> {
	if (event.data.source !== electronSource) return;

	dbg("Received message from Electron.\ndata =", event.data);
	const { msg } = event.data;

	switch (msg.type) {
		//////////////////////////////////////////

		case CREATE_A_NEW_DOWNLOAD: {
			dbg("[handleWindowMsgs()] Create a new download:", msg.downloadInfo);
			createNewDownload(msg.downloadInfo);
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
				error(`Transforming "${mediaPath}" to a media failed!`);
				break;
			}

			dbg("before =", getPlaylists().sortedByTitleAndMainList);
			addToMainList(newMedia[0], newMedia[1]);
			dbg("after =", getPlaylists().sortedByTitleAndMainList);
			break;
		}

		//////////////////////////////////////////

		case DELETE_ONE_MEDIA_FROM_COMPUTER: {
			const { mediaPath } = msg;

			dbg("[handleWindowMsgs()] Delete one media from computer:", mediaPath);

			if (!getPlaylists().sortedByDate.has(mediaPath)) {
				error("Could not find media to delete.");
				break;
			}

			await deleteFile(mediaPath);
			break;
		}

		//////////////////////////////////////////

		case RESCAN_ALL_MEDIA: {
			dbg("[handleWindowMsgs()] Refresh all media.");
			await searchLocalComputerForMedias();
			break;
		}

		//////////////////////////////////////////

		case RESCAN_ONE_MEDIA: {
			const { mediaPath } = msg;

			dbg("[handleWindowMsgs()] Rescan one media:", mediaPath);

			await rescanMedia(mediaPath);
			break;
		}

		//////////////////////////////////////////

		case REMOVE_ONE_MEDIA: {
			const { mediaPath } = msg;

			dbg("[handleWindowMsgs()] Remove one media:", mediaPath);

			if (!getPlaylists().sortedByTitleAndMainList.has(mediaPath)) {
				error(
					`Media %c"${mediaPath}" was not found to be removed!`,
					"color: blue",
					{ sortedByTitleAndMainList: getPlaylists().sortedByTitleAndMainList },
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
}

//////////////////////////////////////////
//////////////////////////////////////////
//////////////////////////////////////////
// types:

type Event = Readonly<MessageEvent<MsgWithSource<MsgObjectElectronToReact>>>;
