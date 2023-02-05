import type { MediaBeingDownloaded } from "@components/Downloading";
import type { AllowedMedias } from "@utils/utils";
import type { MediaUrl } from "@contexts/downloadList";
import type { Readable } from "node:stream";

import { exists, removeFile } from "@tauri-apps/api/fs";
import { join } from "node:path";
import sanitize from "sanitize-filename";
import ytdl from "ytdl-core";

import { error, log, throwErr, dbg } from "@utils/log";
import { ProgressStatus } from "@utils/enums";
import { addToMainList } from "@contexts/usePlaylists";
import { fluent_ffmpeg } from "./ffmpeg";
import { writeTags } from "./writeTags";
import { dirs } from "@utils/utils";

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Constants:

const currentDownloads: Map<MediaUrl, Readable> = new Map();

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Entry function:

export function createOrCancelDownload(args: CreateDownload): void {
	if (!args.url) throwErr(`'url' is required. Received: "${args.url}".`);

	if (!currentDownloads.has(args.url)) {
		if (!args.downloaderMsgPort)
			throwErr(
				`'electronPort' is required. Received: \`${args.downloaderMsgPort}\`.`,
			);

		if (!args.extension)
			throwErr(`'toExtension' is required. Received: "${args.extension}".`);

		if (!args.imageURL)
			throwErr(`'imageURL' is required. Received: "${args.imageURL}".`);

		if (!args.title)
			throwErr(`'title' is required. Received: "${args.title}".`);

		if (!args.url) throwErr(`'url' is required. Received: "${args.url}".`);

		createDownload(args as Required<CreateDownload>).then();
	} else if (args.destroy) currentDownloads.get(args.url)!.emit("destroy");
}

/////////////////////////////////////////////
// Main function:

async function createDownload(
	// Treat args as NotNullable cause argument check was
	// (has to be) done before calling this function.
	{
		downloaderMsgPort,
		artist = "",
		extension,
		imageURL,
		title,
		url,
	}: Required<CreateDownload>,
): Promise<void> {
	dbg(`Attempting to create a stream for "${title}" to download.`);

	const titleWithExtension = sanitize(`${title}.${extension}`);
	const saveSite = join(dirs.music, titleWithExtension);

	// Assert file doesn't already exists:
	if (await exists(saveSite)) {
		const err = new Error(
			`File "${saveSite}" already exists! Canceling download.`,
		);

		error(err);

		// Send a msg to the client that the download failed:
		const msg: Partial<MediaBeingDownloaded> & { error: Error } = {
			status: ProgressStatus.FAILED,
			error: err,
		};
		downloaderMsgPort.postMessage(msg);

		// Don't forget to throw away the MessagePort (clean up):
		downloaderMsgPort.close();

		return;
	}

	/////////////////////////////////////////////

	let timerToNotifyClient: NodeJS.Timer | undefined;
	let percentageToSend = 0;

	/////////////////////////////////////////////

	// ytdl will 'end' the stream for me.
	const readStream = ytdl(url, {
		requestOptions: { maxRetries: 1 },
		quality: "highestaudio",
	})
		/////////////////////////////////////////////
		/////////////////////////////////////////////
		// On progress, send percentage of download to client:
		.on("progress", (_, downloaded: number, total: number) => {
			const percentage = (downloaded / total) * 100;
			percentageToSend = percentage;

			if (!timerToNotifyClient) {
				// ^ Only in the firt time this 'on progress' fn is called!
				timerToNotifyClient = setInterval(
					() => downloaderMsgPort.postMessage({ percentage: percentageToSend }),
					500,
				);

				// Send a message to client that we're successfully starting a download:
				const msg: Partial<MediaBeingDownloaded> = {
					status: ProgressStatus.ACTIVE,
				};
				downloaderMsgPort.postMessage(msg);
			}
		})
		/////////////////////////////////////////////
		/////////////////////////////////////////////
		// Handle download cancelation:
		.on("destroy", async () => {
			log(
				`%cDestroy was called on readStream! title: ${title}`,
				"color: blue; font-weight: bold; background: yellow; font-size: 0.8rem;",
			);

			// Delete the file since it was canceled:
			await removeFile(saveSite);

			// Tell the client the download was successfully canceled:
			const msg: Partial<MediaBeingDownloaded> = {
				status: ProgressStatus.CANCEL,
			};
			downloaderMsgPort.postMessage(msg);

			// Clean up:
			currentDownloads.delete(url);
			clearInterval(timerToNotifyClient);
			downloaderMsgPort.close();

			dbg(
				"Download was destroyed. Deleting stream from currentDownloads:",
				currentDownloads,
				"Does the downloaded file still exists?",
				await exists(saveSite),
			);
		})
		/////////////////////////////////////////////
		/////////////////////////////////////////////
		.on("end", async () => {
			log(
				`%cFile "${titleWithExtension}" saved successfully!`,
				"color: green; font-weight: bold;",
			);

			// Tell the client the download was successfull:
			const msg: Partial<MediaBeingDownloaded> = {
				status: ProgressStatus.SUCCESS,
			};
			downloaderMsgPort.postMessage(msg);

			// Download media image and put it on the media metadata:
			await writeTags(saveSite, {
				albumArtists: [artist],
				imageURL: imageURL,
				downloadImg: true,
				isNewMedia: true,
				title: title,
			});

			await addToMainList(saveSite);

			// Clean up:
			currentDownloads.delete(url);
			clearInterval(timerToNotifyClient);
			downloaderMsgPort.close();
		})
		/////////////////////////////////////////////
		/////////////////////////////////////////////
		.on("error", async (err) => {
			error(`Error downloading file: "${titleWithExtension}"!`, err);

			// Delete the file since it errored:
			await removeFile(saveSite);

			// Tell the client the download threw an error:
			const msg: Partial<MediaBeingDownloaded> & { error: Error } = {
				status: ProgressStatus.FAILED,
				error: new Error(err.message),
			};
			downloaderMsgPort!.postMessage(msg);

			// Clean up:
			clearInterval(timerToNotifyClient);
			currentDownloads.delete(url);
			downloaderMsgPort!.close();
			readStream.destroy(err); // I only found it to work when I send it with an Error.

			dbg(
				"Download threw an error. Deleting stream from currentDownloads:",
				currentDownloads,
				"Does the downloaded file still exists?",
				await exists(saveSite),
			);
		});

	/////////////////////////////////////////////

	fluent_ffmpeg(readStream).toFormat(extension!).saveToFile(saveSite);

	/////////////////////////////////////////////

	currentDownloads.set(url, readStream);
	dbg(`Added "${url}" to currentDownloads =`, currentDownloads);
}

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Types:

export type CreateDownload = {
	downloaderMsgPort?: MessagePort;
	extension?: AllowedMedias;
	imageURL?: string;
	destroy?: boolean;
	artist?: string;
	title?: string;
	url: string;
};
