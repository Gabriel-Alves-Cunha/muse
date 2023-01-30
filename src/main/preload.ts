import type { Mutable } from "@common/@types/utils";
import type {
	MsgObjectReactToElectron,
	VisibleElectron,
} from "@common/@types/electron-window";

import { validateURL as isUrlValid, getBasicInfo } from "ytdl-core";

import { sendNotificationToElectronIpcMainProcess } from "./preload/notificationApi";
import { searchForLyricsAndImage } from "./preload/getLyrics";
import { transformPathsToMedias } from "./preload/media/create-media";
import { assertUnreachable } from "@utils/utils";
import { createServer } from "./preload/share/server";
import { writeTags } from "./preload/media/mutate-metadata";
import { clipboard } from "./preload/watchClipboard.js";
import { error } from "@common/log";
import { dirs } from "./utils";
import { dbg } from "@common/debug";
import {
	ElectronPreloadToMainElectronMessage,
	ElectronToReactMessage,
	ReactToElectronMessage,
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
const visibleElectronAPI: VisibleElectron = {
	fs: { getFullPathOfFilesForFilesInThisDirectory, deleteFile, readDir },
	notificationApi: { sendNotificationToElectronIpcMainProcess },
	media: { transformPathsToMedias, getBasicInfo },
	lyric: { searchForLyricsAndImage },
	share: { createServer },
	os: { dirs },
};

/////////////////////////////////////////////
/////////////////////////////////////////////
// This is to show a notification
// when we copy a link to the clipboard:
// This has to be imported after app is open.

clipboard.addEventListener("text-changed", async () => {
	const url = clipboard.previousText;

	if (!isUrlValid(url)) return;

	const {
		media: { artist = "" },
		thumbnails,
		title,
	} = (await getBasicInfo(url)).videoDetails;

	ipcRenderer.invoke(
		ElectronPreloadToMainElectronMessage.CLIPBOARD_TEXT_CHANGED,
		{
			thumbnail: thumbnails.at(-1)?.url ?? "",
			artist,
			title,
			url,
		} satisfies ClipboardTextChangeNotificationProps,
	);
});

clipboard.startWatching();

/////////////////////////////////////////////
/////////////////////////////////////////////

// Relay messages from ipcRenderer to the client:
ipcRenderer.on(
	ElectronToReactMessage.CREATE_A_NEW_DOWNLOAD,
	(_event, downloadValues) => sendMsgToClient({
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

window.addEventListener("message", (event: CrossWindowEvent): void => {
	if (event.data.source !== reactSource) return;

	dbg("Received message from React:", event.data);

	const [electronPort] = event.ports;
	const { msg } = event.data;

	switch (msg.type) {
		case ReactToElectronMessage.CREATE_A_NEW_DOWNLOAD: {
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

		case ReactToElectronMessage.CONVERT_MEDIA: {
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

		case ReactToElectronMessage.WRITE_TAG: {
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

		case ReactToElectronMessage.ERROR: {
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
});

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
