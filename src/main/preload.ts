import { contextBridge, ipcRenderer } from "electron";
import { getBasicInfo } from "ytdl-core";

import { sendNotificationToElectronIpcMainProcess } from "./preload/notificationApi";
import { assertUnreachable } from "@utils/utils";
import { dirs } from "./utils";
import { dbg } from "@common/utils";
import {
	type MsgObjectReactToElectron,
	type VisibleElectron,
	ReactToElectronMessageEnum,
	ElectronToReactMessageEnum,
} from "@common/@types/electron-window";
import {
	type MsgWithSource,
	sendMsgToClient,
	reactSource,
} from "@common/crossCommunication";
import {
	type HandleConversion,
	type HandleDownload,
	handleCreateOrCancelDownload,
	handleCreateOrCancelConvert,
	transformPathsToMedias,
	writeTags,
} from "./preload/media";
import {
	getFullPathOfFilesForFilesInThisDirectory,
	deleteFile,
	readFile,
	readdir,
} from "./preload/file";
import { Mutable } from "@common/@types/generalTypes";

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
const electron: VisibleElectron = Object.freeze({
	fs: {
		getFullPathOfFilesForFilesInThisDirectory,
		deleteFile,
		readFile,
		readdir,
	},
	notificationApi: { sendNotificationToElectronIpcMainProcess },
	media: { transformPathsToMedias, getBasicInfo },
	os: { dirs },
});

contextBridge.exposeInMainWorld("electron", electron);

// Relay messages from the main process to the renderer process:
ipcRenderer.on(
	ElectronToReactMessageEnum.CREATE_A_NEW_DOWNLOAD,
	(_event, downloadValues) =>
		sendMsgToClient({
			type: ElectronToReactMessageEnum.CREATE_A_NEW_DOWNLOAD,
			downloadInfo: downloadValues,
		}),
);

window.addEventListener("message", handleMsgsFromRendererProcess);

// Handle messages from the renderer process:
async function handleMsgsFromRendererProcess(
	event: Readonly<MessageEvent<MsgWithSource<MsgObjectReactToElectron>>>,
): Promise<void> {
	if (event.data.source !== reactSource) return;

	dbg("Received message from React:", event.data);

	const electronPort = event.ports[0];
	const msg = event.data.msg;

	switch (msg.type) {
		case ReactToElectronMessageEnum.CREATE_A_NEW_DOWNLOAD: {
			if (!electronPort) {
				console.error("There should be a electronPort to download media!");
				break;
			}

			electronPort.onmessage = async ({ data }: { data: HandleDownload; }) =>
				await handleCreateOrCancelDownload({ ...data, electronPort });

			electronPort.addEventListener("close", handleClosePort);

			// MessagePortMain queues messages until the .start() method has been called.
			electronPort.start();
			break;
		} // 1

		case ReactToElectronMessageEnum.CONVERT_MEDIA: {
			if (!electronPort) {
				console.error("There should be a electronPort to convert media!");
				break;
			}

			electronPort.onmessage = ({ data }: { data: HandleConversion; }) =>
				handleCreateOrCancelConvert({ ...data, electronPort });

			electronPort.addEventListener("close", handleClosePort);

			// MessagePortMain queues messages until the .start() method has been called.
			electronPort.start();
			break;
		} // 2

		case ReactToElectronMessageEnum.WRITE_TAG: {
			const { mediaPath, thingsToChange } = msg;

			// const data: Parameters<typeof writeTags>[1] = {
			// 	[whatToChange]: newValue,
			// };
			const data: Mutable<Parameters<typeof writeTags>[1]> = {};
			thingsToChange.forEach(({ whatToChange, newValue }) =>
				Reflect.set(data, whatToChange, newValue)
			);

			dbg("On 'preload.ts' at electron-window.onmessage [WRITE_TAG]:", { msg });

			await writeTags(mediaPath, data);
			break;
		} // 3

		case ReactToElectronMessageEnum.ERROR: {
			console.error(
				"@TODO: maybe do something with this error...?\n",
				msg.error,
			);

			break;
		} // 4

		default: {
			console.error(
				`There is no method to handle this event.data: (${typeof event
					.data}) '`,
				event.data,
				"'\nEvent =",
				event,
			);

			assertUnreachable(msg);
			break;
		}
	}
}

const handleClosePort = (): void => dbg("Closing ports (electronPort).");
