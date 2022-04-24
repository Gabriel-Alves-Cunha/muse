import type { HandleConversion, HandleDownload } from "./preload/media";

import { contextBridge, ipcRenderer } from "electron";
import { getBasicInfo } from "ytdl-core";

import { sendNotificationToElectronIpcMainProcess } from "./preload/notificationApi";
import { ReactToElectronMessageEnum } from "@common/@types/electron-window";
import { assertUnreachable } from "@utils/utils";
import { homeDir, dirs } from "./utils";
import { dbg } from "@common/utils";
import {
	type MsgWithSource,
	sendMsgToClient,
	reactSource,
} from "@common/crossCommunication";
import {
	handleCreateOrCancelDownload,
	handleCreateOrCancelConvert,
	transformPathsToMedias,
	convertToAudio,
	writeTags,
} from "./preload/media";
import {
	getFullPathOfFilesForFilesInThisDirectory,
	deleteFile,
	readFile,
	readdir,
} from "./preload/file";
import {
	type MsgObjectReactToElectron,
	ElectronToReactMessageEnum,
} from "@common/@types/electron-window";

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("electron", {
	notificationApi: {
		sendNotificationToElectronIpcMainProcess,
	},
	fs: {
		getFullPathOfFilesForFilesInThisDirectory,
		deleteFile,
		readFile,
		readdir,
	},
	os: {
		homeDir,
		dirs,
	},
	media: {
		transformPathsToMedias,
		convertToAudio,
		getBasicInfo,
		writeTags,
	},
});

// Relay messages from the main process to the renderer process:
ipcRenderer.on(
	ElectronToReactMessageEnum.DISPLAY_DOWNLOADING_MEDIAS,
	(_event, downloadValues) =>
		sendMsgToClient({
			type: ElectronToReactMessageEnum.DISPLAY_DOWNLOADING_MEDIAS,
			downloadValues,
		}),
);

window.onmessage = async (
	event: MessageEvent<MsgWithSource<MsgObjectReactToElectron>>,
) => {
	if (event.data.source !== reactSource) return;

	dbg("Received message from React:", event.data);

	const electronPort = event.ports[0];
	const msg = event.data.msg;

	switch (msg.type) {
		case ReactToElectronMessageEnum.DOWNLOAD_MEDIA: {
			if (!electronPort) {
				console.error("There should be a electronPort to download media!");
				break;
			}

			electronPort.onmessage = ({ data }: HandleCreateOrCancelDownload) =>
				handleCreateOrCancelDownload({ ...data, electronPort });

			electronPort.addEventListener("close", () =>
				dbg("Closing ports (electronPort)."),
			);

			// MessagePortMain queues messages until the .start() method has been called.
			electronPort.start();
			break;
		} // 1

		case ReactToElectronMessageEnum.CONVERT_MEDIA: {
			if (!electronPort) {
				console.error("There should be a electronPort to convert media!");
				break;
			}

			electronPort.onmessage = ({ data }: HandleCreateOrCancelConvert) =>
				handleCreateOrCancelConvert({ ...data, electronPort });

			electronPort.addEventListener("close", () =>
				dbg("Closing ports (electronPort)."),
			);

			// MessagePortMain queues messages until the .start() method has been called.
			electronPort.start();

			break;
		} // 2

		case ReactToElectronMessageEnum.WRITE_TAG: {
			const { mediaPath, whatToChange, newValue } = msg.params;

			const data: Parameters<typeof writeTags>[1] = {
				[whatToChange]: newValue,
			};

			dbg("On 'preload.ts' at electron-window.onmessage [WRITE_TAG]:", {
				params: msg.params,
				data,
			});

			await writeTags(mediaPath, data);
			break;
		} // 3

		case ReactToElectronMessageEnum.ERROR: {
			console.error("@TODO: ERROR", msg.error);

			break;
		} // 4

		default: {
			console.error(
				`There is no method to handle this event.data: (${typeof event.data}) '`,
				event.data,
				"'\nEvent =",
				event,
			);

			assertUnreachable(msg);
			break;
		}
	}
};

type HandleCreateOrCancelDownload = {
	data: HandleDownload & { destroy?: boolean };
};

type HandleCreateOrCancelConvert = {
	data: HandleConversion & { destroy?: boolean };
};
