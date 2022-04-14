import type { HandleConversion, HandleDownload } from "./preload/media";
import type { MsgObjectReactToElectron } from "@common/@types/electron-window";

import { contextBridge } from "electron";
import { getBasicInfo } from "ytdl-core";

import { ReactToElectronMessageEnum } from "@common/@types/electron-window";
import { assertUnreachable } from "@utils/utils";
import { homeDir, dirs } from "./utils";
import { dbg } from "@common/utils";
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
	sendNotificationToElectronIpcMainProcess,
	receiveMsgFromElectronWindow,
} from "./preload/notificationApi";

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("electron", {
	notificationApi: {
		sendNotificationToElectronIpcMainProcess,
		receiveMsgFromElectronWindow,
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

window.onmessage = async (event: MessageEvent<MsgObjectReactToElectron>) => {
	// @ts-ignore event is actually `event: MessageEvent<MsgObject | any>`,
	// but I'm doing this to have type safety on the switch statement.
	if (event.data?.source?.includes("react-devtools")) return;

	const electronPort = event.ports[0];

	switch (event.data.type) {
		case ReactToElectronMessageEnum.DOWNLOAD_MEDIA: {
			if (!electronPort) {
				console.error("There should be a electronPort to download media!");
				break;
			}

			electronPort.onmessage = ({
				data,
			}: {
				data: HandleDownload & { destroy: boolean };
			}) => handleCreateOrCancelDownload({ ...data, electronPort });

			electronPort.addEventListener("close", () =>
				dbg("Closing ports (electronPort)."),
			);

			// MessagePortMain queues messages until the .start() method has been called.
			electronPort.start();
			break;
		} // 1

		case ReactToElectronMessageEnum.CONVERT_MEDIA: {
			if (!electronPort) {
				console.error("There should be a electronPort to download media!");
				break;
			}

			electronPort.onmessage = ({
				data,
			}: {
				data: HandleConversion & { destroy: boolean };
			}) => handleCreateOrCancelConvert({ ...data, electronPort });

			electronPort.addEventListener("close", () =>
				dbg("Closing ports (electronPort)."),
			);

			// MessagePortMain queues messages until the .start() method has been called.
			electronPort.start();
			break;
		} // 2

		case ReactToElectronMessageEnum.WRITE_TAG: {
			const { mediaPath, whatToChange, newValue } = event.data.params;

			const data: Parameters<typeof writeTags>[1] = {
				[whatToChange]: newValue,
			};

			dbg("On 'preload.ts' at window.onmessage:", { event }, "\n\n\n", {
				params: event.data.params,
				data,
			});

			await writeTags(mediaPath, data);
			break;
		} // 3

		case ReactToElectronMessageEnum.ERROR: {
			console.error("@TODO: ERROR", event.data.error);

			break;
		} // 4

		default: {
			assertUnreachable(event.data);

			console.error(
				`There is no method to handle this event.data: (${typeof event.data}) '`,
				event.data,
				"'\nEvent =",
				event,
			);
			break;
		}
	}
};
