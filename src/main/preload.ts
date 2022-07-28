import type { Mutable } from "@common/@types/generalTypes";

import { contextBridge, ipcRenderer } from "electron";
import { getBasicInfo } from "ytdl-core";

import { sendNotificationToElectronIpcMainProcess } from "./preload/notificationApi";
import { makeItOnlyOneFile, turnServerOn } from "./preload/share";
import { transformPathsToMedias } from "./preload/media/create-media";
import { assertUnreachable } from "@utils/utils";
import { searchForLyricsAndImage } from "./preload/getLyrics";
import { writeTags } from "./preload/media/mutate-metadata";
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
	type CreateConversion,
	createOrCancelConvert,
} from "./preload/media/create-conversion";
import {
	createOrCancelDownload,
	type CreateDownload,
} from "./preload/media/download-media";
import {
	getFullPathOfFilesForFilesInThisDirectory,
	deleteFile,
	readDir,
} from "./preload/file";

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////

// Expose methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object:
const electron: VisibleElectron = Object.freeze({
	fs: { getFullPathOfFilesForFilesInThisDirectory, deleteFile, readDir },
	notificationApi: { sendNotificationToElectronIpcMainProcess },
	media: { transformPathsToMedias, getBasicInfo },
	share: { turnServerOn, makeItOnlyOneFile },
	lyric: { searchForLyricsAndImage },
	os: { dirs },
});

contextBridge.exposeInMainWorld("electron", electron);

/////////////////////////////////////////////

// Relay messages from ipcRenderer to the client:
ipcRenderer.on(
	ElectronToReactMessageEnum.CREATE_A_NEW_DOWNLOAD,
	(_event, downloadValues) =>
		sendMsgToClient({
			type: ElectronToReactMessageEnum.CREATE_A_NEW_DOWNLOAD,
			downloadInfo: downloadValues,
		}),
);

/////////////////////////////////////////////
// Helper functions:

const logThatPortIsClosing = (): void => dbg("Closing ports (electronPort).");

/////////////////////////////////////////////

window.addEventListener("message", handleMsgsFromRendererProcess);

// Handle messages from the renderer process:
async function handleMsgsFromRendererProcess(
	event: CrossWindowEvent,
): Promise<void> {
	if (event.data.source !== reactSource) return;

	dbg("Received message from React:", event.data);

	const electronPort = event.ports[0];
	const msg = event.data.msg;

	switch (msg.type) {
		case ReactToElectronMessageEnum.CREATE_A_NEW_DOWNLOAD: {
			if (!electronPort) {
				console.error("There should be an electronPort to download a media!");
				break;
			}

			// TODO: see if artist is being sent
			electronPort.onmessage = async ({ data }: { data: CreateDownload; }) =>
				await createOrCancelDownload({ ...data, electronPort });

			electronPort.addEventListener("close", logThatPortIsClosing);

			// MessagePortMain queues messages until the .start() method has been called.
			electronPort.start();
			break;
		} // 1

		case ReactToElectronMessageEnum.CONVERT_MEDIA: {
			if (!electronPort) {
				console.error("There should be an electronPort to convert a media!");
				break;
			}

			electronPort.onmessage = ({ data }: { data: CreateConversion; }) =>
				createOrCancelConvert({ ...data, electronPort });

			electronPort.addEventListener("close", logThatPortIsClosing);

			// MessagePortMain queues messages until the .start() method has been called.
			electronPort.start();
			break;
		} // 2

		case ReactToElectronMessageEnum.WRITE_TAG: {
			const { mediaPath, thingsToChange } = msg;

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
