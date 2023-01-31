import type { DownloadInfo, Path } from "types/generalTypes";
import type { Event } from "@tauri-apps/api/event";

import { listen } from "@tauri-apps/api/event";

import { isAModifierKeyPressed } from "./keyboard";
import { MessageToFrontend } from "./enums";
import { togglePlayPause } from "@contexts/useCurrentPlaying";
import { setDownloadInfo } from "@components/Downloading";
import { getMediaFiles } from "@contexts/usePlaylistsHelper";
import { stringifyJson } from "./utils";
import { getSettings } from "@contexts/settings";
import { deleteFile } from "./deleteFile";
import { error, dbg } from "./log";
import { on } from "./window";
import {
	searchLocalComputerForMedias,
	addToMainList,
	rescanMedia,
	getMainList,
	removeMedia,
} from "@contexts/usePlaylists";

// const { transformPathsToMedias } = electron.media;

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

on("dragover", listenToDragoverEvent);
on("drop", listenToDropEvent);

//////////////////////////////////////////

function playOrPauseOnSpaceKey(e: KeyboardEvent): void {
	if (e.key === " " && !isAModifierKeyPressed(e)) togglePlayPause();
}

on("keyup", playOrPauseOnSpaceKey);

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
} = MessageToFrontend;

//////////////////////////////////////////

export async function listenToAllBackendMessages(): Promise<void> {
	await listen(
		CREATE_A_NEW_DOWNLOAD,
		(
			event: Event<{
				downloadInfo: DownloadInfo;
			}>,
		) => {
			dbg(
				"Received message from backend at CREATE_A_NEW_DOWNLOAD.\nevent =",
				stringifyJson(event),
			);

			setDownloadInfo(event.payload.downloadInfo);
		},
	);

	//////////////////////////////////////////
	//////////////////////////////////////////

	await listen(
		ADD_ONE_MEDIA,
		(
			event: Event<{
				mediaPath: Path;
			}>,
		) => {
			dbg(
				"Received message from backend at ADD_ONE_MEDIA.\nevent =",
				stringifyJson(event),
			);

			const { mediaPath } = event.payload;
			const {
				assureMediaSizeIsGreaterThan60KB,
				ignoreMediaWithLessThan60Seconds,
			} = getSettings();

			const [newMedia] = [undefined]; // await transformPathsToMedias(
			// 	mediaPath,
			// 	assureMediaSizeIsGreaterThan60KB,
			// 	ignoreMediaWithLessThan60Seconds,
			// );

			if (!newMedia)
				return error(`Transforming "${mediaPath}" to a media failed!`);

			addToMainList(newMedia[0], newMedia[1]);
		},
	);

	//////////////////////////////////////////
	//////////////////////////////////////////

	await listen(
		DELETE_ONE_MEDIA_FROM_COMPUTER,
		(
			event: Event<{
				mediaPath: Path;
			}>,
		) => {
			dbg(
				"Received message from backend at DELETE_ONE_MEDIA_FROM_COMPUTER.\nevent =",
				stringifyJson(event),
			);

			const { mediaPath } = event.payload;

			if (!getMainList().has(mediaPath))
				return error("Could not find media to delete.");

			deleteFile(mediaPath).then();
		},
	);

	//////////////////////////////////////////
	//////////////////////////////////////////

	await listen(
		RESCAN_ALL_MEDIA,
		(
			event: Event<{
				mediaPath: Path;
			}>,
		) => {
			dbg(
				"Received message from backend at RESCAN_ALL_MEDIA.\nevent =",
				stringifyJson(event),
			);

			searchLocalComputerForMedias().then();
		},
	);

	//////////////////////////////////////////
	//////////////////////////////////////////

	await listen(
		RESCAN_ONE_MEDIA,
		(
			event: Event<{
				mediaPath: Path;
			}>,
		) => {
			dbg(
				"Received message from backend at RESCAN_ONE_MEDIA.\nevent =",
				stringifyJson(event),
			);

			rescanMedia(event.payload.mediaPath).then();
		},
	);

	//////////////////////////////////////////
	//////////////////////////////////////////

	await listen(
		REMOVE_ONE_MEDIA,
		(
			event: Event<{
				mediaPath: Path;
			}>,
		) => {
			dbg(
				"Received message from backend at REMOVE_ONE_MEDIA.\nevent =",
				stringifyJson(event),
			);

			const { mediaPath } = event.payload;

			if (!getMainList().has(mediaPath))
				return error(`"${mediaPath}" not found!`);

			removeMedia(mediaPath);
		},
	);

	//////////////////////////////////////////
	//////////////////////////////////////////

	await listen(
		ERROR,
		(
			event: Event<{
				error: Error;
			}>,
		) => {
			dbg(
				"Received message from backend at ERROR.\nevent =",
				stringifyJson(event),
			);

			error("@TODO: ERROR", event.payload.error);
		},
	);
}
