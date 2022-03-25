import type { AllowedMedias } from "@common/utils";
import type { Path } from "@common/@types/typesAndEnums";

import { contextBridge } from "electron";

import { homeDir, dirs } from "./utils";
import { dbg } from "@common/utils";
import {
	handleCreateOrCancelDownload,
	handleCreateOrCancelConvert,
	transformPathsToMedias,
	convertToAudio,
	writeTags,
	getInfo,
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
		convertToAudio,
		writeTags,
		getInfo,
	},
});

const addListeners = (port: MessagePort): Readonly<MessagePort> => {
	port.onmessage = async event => {
		const { data } = event;

		console.log("At addListeners on file 'preload.ts', line 330:", data);

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
				return;
			}

			electronPort.onmessage = ({
				data,
			}: {
				data: Readonly<{
					imageURL: string;
					destroy: boolean;
					title: string;
					url: string;
				}>;
			}) =>
				handleCreateOrCancelDownload(
					data.imageURL,
					data.destroy,
					data.url,
					data.title,
					electronPort,
				);

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
				return;
			}

			electronPort.onmessage = ({
				data,
			}: {
				data: Readonly<{
					toExtension: AllowedMedias;
					destroy: boolean;
					path: Path;
				}>;
			}) =>
				handleCreateOrCancelConvert(
					data.destroy,
					data.toExtension,
					data.path,
					electronPort,
				);

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

			console.log({ event }, "\n\n\n", { details, data });

			await writeTags(details.mediaPath, data);

			break;
		}

		case "async two way comm": {
			console.log("Electron received 'async two way comm':", event);

			const electronPort = event.ports[0];
			if (!electronPort) {
				console.error(
					"There should be an electronPort for 2-way communication with React!",
				);
				return;
			}

			window.twoWayComm_React_Electron = addListeners(electronPort);

			// MessagePortMain queues messages until the .start() method has been called.
			electronPort.start();
			break;
		}

		default: {
			console.error(
				`There is no method to handle this event: (${typeof event.data}) "${
					event.data
				}";\nEvent =`,
				event,
			);
			break;
		}
	}
};
