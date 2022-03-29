import type { HandleConversion, HandleDownload } from "./preload/media";
import type { Path } from "@common/@types/typesAndEnums";

import { contextBridge } from "electron";
import { getBasicInfo } from "ytdl-core";

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
	sendNotificationToElectron,
	receiveMsgFromElectron,
	addListeners,
} from "./preload/notificationApi";

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("electron", {
	notificationApi: {
		sendNotificationToElectron,
		receiveMsgFromElectron,
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
		getInfo: getBasicInfo,
		convertToAudio,
		writeTags,
	},
});

window.onmessage = async event => {
	const electronPort = event.ports[0];

	switch (event.data) {
		case "download media": {
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
		}

		case "convert media": {
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
		}

		case "write tag": {
			const details: { mediaPath: Path; [whatToChange: string]: string } =
				event.data;
			const data = {};
			Object.entries(details).forEach(pair => Object.assign(data, pair));

			console.log("On 'preload.ts' at window.onmessage:", { event }, "\n\n\n", {
				details,
				data,
			});

			await writeTags(details.mediaPath, data);
			break;
		}

		case "async two way comm": {
			window.twoWayComm_React_Electron = addListeners(electronPort);

			dbg({ twoWayComm_React_Electron: window.twoWayComm_React_Electron });

			// MessagePortMain queues messages until the .start() method has been called.
			electronPort.start();
			break;
		}

		default: {
			console.error(
				`There is no method to handle this event.data: (${typeof event.data}) "${
					event.data
				}";\nEvent =`,
				event,
			);
			break;
		}
	}
};
