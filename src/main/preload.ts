import type { DownloadInfo } from "@common/@types/generalTypes";
import type { Mutable } from "@common/@types/utils";
import type {
	MsgObjectReactToElectron,
	VisibleElectron,
} from "@common/@types/electron-window";

import { contextBridge, ipcRenderer, Notification } from "electron";
import { validateURL as isUrlValid, getBasicInfo } from "ytdl-core";

import { electronToReactMessage, reactToElectronMessage } from "@common/enums";
import { sendNotificationToElectronIpcMainProcess } from "./preload/notificationApi";
import { searchForLyricsAndImage } from "./preload/getLyrics";
import { transformPathsToMedias } from "./preload/media/create-media";
import { assertUnreachable } from "@utils/utils";
import { ClipboardExtended } from "./preload/clipboardExtended.js";
import { dirs, logoPath } from "./utils";
import { createServer } from "./preload/share/server";
import { emptyString } from "@common/empty";
import { writeTags } from "./preload/media/mutate-metadata";
import { dbg } from "@common/debug";
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

const { error } = console;

dbg("electron process.env.LYRIC_API_KEY =", process.env.LYRIC_API_KEY);

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

contextBridge.exposeInMainWorld("electron", visibleElectronAPI);

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

			if (!isUrlValid(url)) return;

			const {
				media: { artist = emptyString },
				thumbnails,
				title,
			} = (await getBasicInfo(url)).videoDetails;

			new Notification({
				title: "Click to download this media as 'mp3'",
				timeoutType: "never",
				urgency: "normal",
				icon: logoPath,
				silent: true,
				body: title,
			})
				.on("click", () => {
					const downloadInfo: DownloadInfo = {
						imageURL: thumbnails.at(-1)?.url ?? emptyString,
						extension: "mp3",
						artist,
						title,
						url,
					};

					// // Send msg to ipcMain, wich in turn will relay to ipcRenderer:
					sendMsgToClient({
						type: electronToReactMessage.CREATE_A_NEW_DOWNLOAD,
						downloadInfo,
					});

					dbg("Clicked notification and sent data:", downloadInfo);
				})
				.show();
		})
		.startWatching();
})();

/////////////////////////////////////////////
/////////////////////////////////////////////

// Relay messages from ipcRenderer to the client:
ipcRenderer.on(
	electronToReactMessage.CREATE_A_NEW_DOWNLOAD,
	(_event, downloadValues) => sendMsgToClient({
			type: electronToReactMessage.CREATE_A_NEW_DOWNLOAD,
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

window.addEventListener(
	"message",
	async (event: CrossWindowEvent): Promise<void> => {
		if (event.data.source !== reactSource) return;

		dbg("Received message from React:", event.data);

		const [electronPort] = event.ports;
		const { msg } = event.data;

		switch (msg.type) {
			case reactToElectronMessage.CREATE_A_NEW_DOWNLOAD: {
				if (!electronPort) {
					error("There should be an electronPort to download a media!");
					break;
				}

				electronPort.onmessage = async ({ data }: { data: CreateDownload }) =>
					await createOrCancelDownload({ ...data, electronPort });

				electronPort.addEventListener("close", logThatPortIsClosing);

				// MessagePortMain queues messages until the .start() method has been called.
				electronPort.start();
				break;
			}

			/////////////////////////////////////////////
			/////////////////////////////////////////////

			case reactToElectronMessage.CONVERT_MEDIA: {
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

			case reactToElectronMessage.WRITE_TAG: {
				const { mediaPath, thingsToChange } = msg;

				const data: Mutable<Parameters<typeof writeTags>[1]> = {};

				for (const { whatToChange, newValue } of thingsToChange)
					Reflect.set(data, whatToChange, newValue);

				dbg("On 'preload.ts' at electron-window.onmessage [WRITE_TAG]:", {
					msg,
				});

				await writeTags(mediaPath, data);
				break;
			}

			/////////////////////////////////////////////
			/////////////////////////////////////////////

			case reactToElectronMessage.ERROR: {
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
	},
);

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Types:

type CrossWindowEvent = Readonly<
	MessageEvent<MsgWithSource<MsgObjectReactToElectron>>
>;
