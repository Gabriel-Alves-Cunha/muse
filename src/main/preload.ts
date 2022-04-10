import type { HandleConversion, HandleDownload } from "./preload/media";

import { contextBridge } from "electron";
import { getBasicInfo } from "ytdl-core";

import {
	MsgObject,
	ReactElectronAsyncMessageEnum,
} from "@common/@types/electron-window";
import { receiveMsgFromElectron } from "./preload/notificationApi";
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

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("electron", {
	notificationApi: {
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

setTimeout(() => {
	window.postMessage(
		{ message: "Testing if message from Electron arrives on client (React)!" },
		"*",
	);
}, 5_000);

window.onmessage = async (event: MessageEvent<MsgObject>) => {
	// @ts-ignore event is actually `event: MessageEvent<MsgObject | any>`,
	// but I'm doing this to have type safety on the switch statement.
	if (event.data?.source?.includes("react-devtools")) return;

	const electronPort = event.ports[0];

	switch (event.data.type) {
		case ReactElectronAsyncMessageEnum.DELETE_ONE_MEDIA_FROM_COMPUTER: {
			console.error("@TODO: DELETE_ONE_MEDIA_FROM_COMPUTER");

			break;
		} // 1

		case ReactElectronAsyncMessageEnum.REFRESH_ALL_MEDIA: {
			console.error("@TODO: REFRESH_ALL_MEDIA");

			break;
		} // 2

		case ReactElectronAsyncMessageEnum.REFRESH_ONE_MEDIA: {
			console.error("@TODO: REFRESH_ONE_MEDIA");

			break;
		} // 3

		case ReactElectronAsyncMessageEnum.REMOVE_ONE_MEDIA: {
			console.error("@TODO: REMOVE_ONE_MEDIA");

			break;
		} // 4

		case ReactElectronAsyncMessageEnum.DOWNLOAD_MEDIA: {
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
		} // 5

		case ReactElectronAsyncMessageEnum.ADD_ONE_MEDIA: {
			console.error("@TODO: ADD_ONE_MEDIA");

			break;
		} // 6

		case ReactElectronAsyncMessageEnum.CONVERT_MEDIA: {
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
		} // 7

		case ReactElectronAsyncMessageEnum.WRITE_TAG: {
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
		} // 8

		case ReactElectronAsyncMessageEnum.ERROR: {
			console.error("@TODO: ERROR");

			break;
		} // 9

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
