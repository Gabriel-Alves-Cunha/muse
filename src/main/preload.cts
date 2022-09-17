import type { Mutable } from "@common/@types/utils";
import type {
	MsgObjectReactToElectron,
	VisibleElectron,
} from "@common/@types/electron-window";

import { contextBridge, ipcRenderer } from "electron";
import { getBasicInfo } from "ytdl-core";

import { ElectronToReactMessage, ReactToElectronMessage } from "@common/enums";
import { sendNotificationToElectronIpcMainProcess } from "./preload/notificationApi.cjs";
import { searchForLyricsAndImage } from "./preload/getLyrics.cjs";
import { transformPathsToMedias } from "./preload/media/create-media.cjs";
import { assertUnreachable } from "@utils/utils";
import { createServer } from "./preload/share/server.cjs";
import { writeTags } from "./preload/media/mutate-metadata.cjs";
import { dirs } from "./utils.cjs";
import { dbg } from "@common/utils";
import {
	type MsgWithSource,
	sendMsgToClient,
	reactSource,
} from "@common/crossCommunication";
import {
	type CreateConversion,
	createOrCancelConvert,
} from "./preload/media/create-conversion.cjs";
import {
	type CreateDownload,
	createOrCancelDownload,
} from "./preload/media/download-media.cjs";
import {
	getFullPathOfFilesForFilesInThisDirectory,
	deleteFile,
	readDir,
} from "./preload/file.cjs";

// @ts-ignore => will test if it exists
dbg("process.env.LYRIC_API_KEY =", process.env.LYRIC_API_KEY);

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////

// Expose methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object:
const visibleElectronAPI: VisibleElectron = Object.freeze({
	fs: { getFullPathOfFilesForFilesInThisDirectory, deleteFile, readDir },
	notificationApi: { sendNotificationToElectronIpcMainProcess },
	media: { transformPathsToMedias, getBasicInfo },
	lyric: { searchForLyricsAndImage },
	share: { createServer },
	os: { dirs },
});

contextBridge.exposeInMainWorld("electron", visibleElectronAPI);

/////////////////////////////////////////////
/////////////////////////////////////////////

// Relay messages from ipcRenderer to the client:
ipcRenderer.on(
	ElectronToReactMessage.CREATE_A_NEW_DOWNLOAD,
	(_event, downloadValues) =>
		sendMsgToClient({
			type: ElectronToReactMessage.CREATE_A_NEW_DOWNLOAD,
			downloadInfo: downloadValues,
		}),
);

/////////////////////////////////////////////
/////////////////////////////////////////////
// Helper functions:

const logThatPortIsClosing = (): void => dbg("Closing ports (electronPort).");

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Handle messages from the renderer process:

window.addEventListener("message", handleMsgsFromRendererProcess);

async function handleMsgsFromRendererProcess(
	event: CrossWindowEvent,
): Promise<void> {
	if (event.data.source !== reactSource) return;

	dbg("Received message from React:", event.data);

	const [electronPort] = event.ports;
	const msg = event.data.msg;

	switch (msg.type) {
		/////////////////////////////////////////////
		/////////////////////////////////////////////

		case ReactToElectronMessage.CREATE_A_NEW_DOWNLOAD: {
			if (electronPort === undefined) {
				console.error("There should be an electronPort to download a media!");
				break;
			}

			electronPort.onmessage = async ({ data }: { data: CreateDownload; }) =>
				await createOrCancelDownload({ ...data, electronPort });

			electronPort.addEventListener("close", logThatPortIsClosing);

			// MessagePortMain queues messages until the .start() method has been called.
			electronPort.start();
			break;
		}

		/////////////////////////////////////////////
		/////////////////////////////////////////////

		case ReactToElectronMessage.CONVERT_MEDIA: {
			if (electronPort === undefined) {
				console.error("There should be an electronPort to convert a media!");
				break;
			}

			electronPort.onmessage = ({ data }: { data: CreateConversion; }) =>
				createOrCancelConvert({ ...data, electronPort });

			electronPort.addEventListener("close", logThatPortIsClosing);

			// MessagePortMain queues messages until the .start() method has been called.
			electronPort.start();
			break;
		}

		/////////////////////////////////////////////
		/////////////////////////////////////////////

		case ReactToElectronMessage.WRITE_TAG: {
			const { mediaPath, thingsToChange } = msg;

			const data: Mutable<Parameters<typeof writeTags>[1]> = {};
			thingsToChange.forEach(({ whatToChange, newValue }) =>
				Reflect.set(data, whatToChange, newValue)
			);

			dbg("On 'preload.ts' at electron-window.onmessage [WRITE_TAG]:", { msg });

			await writeTags(mediaPath, data);
			break;
		}

		/////////////////////////////////////////////
		/////////////////////////////////////////////

		case ReactToElectronMessage.ERROR: {
			console.error(
				"TODO: maybe do something with this error...?\n",
				msg.error,
			);

			break;
		}

		/////////////////////////////////////////////
		/////////////////////////////////////////////

		default: {
			console.error(
				`There is no method to handle this event.data: (${typeof event
					.data}) '`,
				event.data,
				"'\nEvent =",
				event,
			);

			assertUnreachable(msg);
		}
	}
}

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Types:

type CrossWindowEvent = Readonly<
	MessageEvent<MsgWithSource<MsgObjectReactToElectron>>
>;
