import type { HandleConversion, HandleDownload } from "./preload/media";
import type { Path } from "@common/@types/typesAndEnums";

import { contextBridge } from "electron";
import { getBasicInfo } from "ytdl-core";

import { ListenToNotification } from "@common/@types/typesAndEnums";
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

// For window.twoWayComm_React_Electron:
const addListeners = (port: MessagePort): Readonly<MessagePort> => {
	port.onmessage = async event => {
		const { data } = event;

		console.log("At addListeners on file 'preload.ts', line 57:", data);

		switch (data.type) {
			case "write tag": {
				// details: [mediaPath, whatToChange.whatToChange, value.trim()],
				const [mediaPath, whatToChange, value] = data.details;

				try {
					console.assert(mediaPath, whatToChange, value);

					await writeTags(mediaPath, { [whatToChange]: value });
				} catch (error) {
					console.error(error);
				}
				break;
			}

			// TODO: handle this and other cases from writeTag!
			case ListenToNotification.ADD_ONE_MEDIA: {
				break;
			}

			default: {
				console.log(
					"Message received on electron side of 2way-comm, but there is no function to handle it:",
					data,
				);
				break;
			}
		}
	};

	return port;
};

window.onmessage = async event => {
	switch (event.data) {
		case "download media": {
			const electronPort = event.ports[0];
			if (!electronPort) {
				console.error(
					"There is no message port to handle 'download media' event!",
				);
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
		}

		case "convert media": {
			const electronPort = event.ports[0];
			if (!electronPort) {
				console.error(
					"There is no MessagePort to handle 'convert media' event!",
				);
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
			const electronPort = event.ports[0];
			if (!electronPort) {
				console.error(
					"There should be an electronPort for 2-way communication with React!",
				);
				break;
			}

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
