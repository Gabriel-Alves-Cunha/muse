import type { Mutable } from "@common/@types/Utils";
import type {
	MsgObjectReactToElectron,
	ElectronAPI,
} from "@common/@types/ElectronApi";

import { contextBridge, ipcRenderer } from "electron";
import { validateURL, getBasicInfo } from "ytdl-core";

import { sendNotificationToElectronIpcMainProcess } from "./preload/notificationApi";
import { searchForLyricsAndImage } from "./preload/getLyrics";
import { transformPathsToMedias } from "./preload/media/create-media";
import { assertUnreachable } from "@utils/utils";
import { ClipboardExtended } from "./preload/clipboardExtended.js";
import { createServer } from "./preload/share/server";
import { writeTags } from "./preload/media/mutate-metadata";
import { error } from "@common/log";
import { dirs } from "./utils";
import { dbg } from "@common/debug";
import {
	ElectronPreloadToMainElectronMessageEnum,
	ElectronToReactMessageEnum,
	ReactToElectronMessageEnum,
} from "@common/enums";
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
	type CreateDownload,
	createOrCancelDownload,
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
const electronApi: ElectronAPI = {
	fs: { getFullPathOfFilesForFilesInThisDirectory, deleteFile, readDir },
	notificationApi: { sendNotificationToElectronIpcMainProcess },
	media: { transformPathsToMedias, getBasicInfo },
	lyric: { searchForLyricsAndImage },
	share: { createServer },
	os: { dirs },
};

contextBridge.exposeInMainWorld("electronApi", electronApi);

/////////////////////////////////////////////
/////////////////////////////////////////////
// This is to make Electron show a notification
// when we copy a link to the clipboard:
// This has to be imported after app is open.
(async () => {
	const extendedClipboard = (await import("./preload/clipboardExtended.js"))
		.extendedClipboard as ClipboardExtended;

	extendedClipboard
		.on("text-changed", async () => {
			const url = extendedClipboard.readText("clipboard");

			if (!validateURL(url)) return;

			const {
				media: { artist = "" },
				thumbnails,
				title,
			} = (await getBasicInfo(url)).videoDetails;

			// Make Electron show a message
			ipcRenderer.invoke(
				ElectronPreloadToMainElectronMessageEnum.CLIPBOARD_TEXT_CHANGED,
				{
					thumbnail: thumbnails.at(-1)?.url ?? "",
					artist,
					title,
					url,
				} satisfies ClipboardTextChangeNotificationProps,
			);
		})
		.startWatching();
})();

/////////////////////////////////////////////
/////////////////////////////////////////////

// Relay messages from ipcRenderer to the client:
ipcRenderer.on(
	ElectronToReactMessageEnum.CREATE_A_NEW_DOWNLOAD,
	(_event, downloadInfo) => sendMsgToClient({
			type: ElectronToReactMessageEnum.CREATE_A_NEW_DOWNLOAD,
			downloadInfo,
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

function listenToMessagesFromFrontEnd(event: CrossWindowEvent): void {
	if (event.data.source !== reactSource) return;

	dbg("Received message from React:", event.data);

	const [electronPort] = event.ports;
	const { msg } = event.data;

	switch (msg.type) {
		case ReactToElectronMessageEnum.CREATE_A_NEW_DOWNLOAD: {
			if (!electronPort) {
				error("There should be an electronPort to download a media!");
				break;
			}

			electronPort.onmessage = ({ data }: { data: CreateDownload }) =>
				createOrCancelDownload({ ...data, electronPort });

			electronPort.addEventListener("close", logThatPortIsClosing);

			// MessagePortMain queues messages until the .start() method has been called.
			electronPort.start();
			break;
		}

		/////////////////////////////////////////////
		/////////////////////////////////////////////

		case ReactToElectronMessageEnum.CONVERT_MEDIA: {
			if (!electronPort) {
				error("There should be an electronPort to convert a media!");
				break;
			}

			electronPort.onmessage = ({ data }: { data: CreateConversion }) =>
				createOrCancelConvert({ ...data, electronPort });

			electronPort.addEventListener("close", logThatPortIsClosing);

			// MessagePortMain queues messages until the .start() method has been called.
			electronPort.start();
			break;
		}

		/////////////////////////////////////////////
		/////////////////////////////////////////////

		case ReactToElectronMessageEnum.WRITE_TAG: {
			const { mediaPath, thingsToChange } = msg;

			const data: Mutable<Parameters<typeof writeTags>[1]> = {};

			for (const { whatToChange, newValue } of thingsToChange)
				Reflect.set(data, whatToChange, newValue);

			dbg("On 'preload.ts' at electron-window.onmessage [WRITE_TAG]:", {
				msg,
			});

			writeTags(mediaPath, data);
			break;
		}

		/////////////////////////////////////////////
		/////////////////////////////////////////////

		case ReactToElectronMessageEnum.ERROR: {
			error("TODO: maybe do something with this error...?\n", msg.error);

			break;
		}

		/////////////////////////////////////////////
		/////////////////////////////////////////////

		default: {
			error(
				`There is no method to handle this event.data: (${typeof event.data}) '`,
				event.data,
				"'\nEvent =",
				event,
			);

			assertUnreachable(msg);
		}
	}
}

window.addEventListener("message", listenToMessagesFromFrontEnd);

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Types:

type CrossWindowEvent = Readonly<
	MessageEvent<MsgWithSource<MsgObjectReactToElectron>>
>;

/////////////////////////////////////////////

export interface ClipboardTextChangeNotificationProps {
	thumbnail: string;
	artist: string;
	title: string;
	url: string;
}
