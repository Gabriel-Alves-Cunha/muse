/* eslint-disable @typescript-eslint/no-non-null-assertion */

import type { MediaUrl } from "@contexts/downloadList";
import type { Readable } from "node:stream";

import { cursorTo, clearLine } from "node:readline";
import { error, log } from "node:console";
import { join } from "node:path";
import sanitize from "sanitize-filename";
import ytdl from "ytdl-core";

import { type AllowedMedias, dbg, isDevelopment } from "@common/utils";
import { ElectronToReactMessageEnum } from "@common/@types/electron-window";
import { checkOrThrow, validator } from "@common/args-validator";
import { deleteFile, pathExists } from "../file";
import { sendMsgToClient } from "@common/crossCommunication";
import { ProgressStatus } from "@common/enums";
import { fluent_ffmpeg } from "./ffmpeg";
import { prettyBytes } from "@common/prettyBytes";
import { writeTags } from "./mutate-metadata";
import { dirs } from "@main/utils";

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Schemas For Arguments Verification

const checkArgsToCreateDownload = validator.compile<CreateDownload>({
	electronPort: { type: "class", instanceof: MessagePort },
	extension: "string", // Required. Not empty.
	imageURL: "string",
	title: "string",
	url: "string",
	// $$strict: true, // No additional properties allowed.
});

/////////////////////////////////////////////

const checkForURL = validator.compile({ url: { type: "url" } });

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Constants:

const currentDownloads: Map<MediaUrl, Readable> = new Map();

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////

export async function createOrCancelDownload(
	args: CreateDownload,
): Promise<void> {
	checkOrThrow(checkForURL(args));

	if (!currentDownloads.has(args.url)) {
		checkOrThrow(checkArgsToCreateDownload(args));

		return await createDownload(args);
	} else if (args.destroy) currentDownloads.get(args.url)!.emit("destroy");
}

/////////////////////////////////////////////
// Main function:

export async function createDownload(
	// Treat args as NotNullable cause argument check was
	// (has to be) done before calling this function.
	{ electronPort, extension, imageURL, title, url }: CreateDownload,
): Promise<void> {
	dbg(`Attempting to create a stream for "${title}" to download.`);

	const titleWithExtension = sanitize(`${title}.${extension}`);
	const saveSite = join(dirs.music, titleWithExtension);

	// Assert file doesn't already exists:
	if (await pathExists(saveSite)) {
		error(`File "${saveSite}" already exists! Canceling download.`);

		// Send a msg to the client that the download failed:
		sendMsgToClient({
			type: ElectronToReactMessageEnum.CREATE_DOWNLOAD_FAILED,
			url,
		});

		// Don't forget to throw away the MessagePort (clean up):
		electronPort!.close();

		return;
	}

	let interval: NodeJS.Timer | undefined;
	const startTime = Date.now();
	let percentageToSend = 0;
	let prettyTotal = "";

	// ytdl will 'end' the stream for me.
	const readStream = ytdl(url, {
		requestOptions: { maxRetries: 0 },
		quality: "highestaudio",
	})
		// On progress, send percentage of download to client:
		.on("progress", (_, downloaded: number, total: number) => {
			const percentage = (downloaded / total) * 100;
			percentageToSend = percentage;

			// To react:
			if (!interval) {
				// ^ Only in the firt time this 'on progress' fn is called!
				interval = setInterval(
					() => electronPort!.postMessage({ percentage: percentageToSend }),
					750,
				);

				// Save download size to prettyTotal to not keep recalculating
				// it every time (right now, this is used only below for
				// development, but it can be sent to the client easily):
				prettyTotal = prettyBytes(total);

				// Send a message to client that we're successfully starting a download:
				sendMsgToClient({
					type: ElectronToReactMessageEnum.NEW_DOWNLOAD_CREATED,
					url,
				});
			}

			// Log progress to node console if in development:
			if (isDevelopment) {
				const secondsDownloading = (Date.now() - startTime) / 1_000;
				const estimatedDownloadTime =
					(secondsDownloading / (percentage / 100) - secondsDownloading)
						.toFixed(2);

				cursorTo(process.stdout, 0);
				clearLine(process.stdout, 0);

				process.stdout.write(`${
					percentage.toFixed(2)
				}% downloaded, (${
					prettyBytes(downloaded)
				} / ${prettyTotal}). Running for: ${
					secondsDownloading.toFixed(2)
				} seconds. ETA: ${estimatedDownloadTime} seconds.`);
			}
		})
		// Handle download cancelation:
		.on("destroy", async () => {
			log(
				`%cDestroy was called on readStream! title: ${title}`,
				"color: blue; font-weight: bold; background: yellow; font-size: 0.8rem;",
			);

			// Delete the file since it was canceled:
			await deleteFile(saveSite);

			// TODO: unify these two below:
			// Tell the client the download was successfully canceled:
			sendMsgToClient({
				type: ElectronToReactMessageEnum.DOWNLOAD_CANCELED_SUCCESSFULLY,
				url,
			});
			electronPort!.postMessage({
				status: ProgressStatus.CANCEL,
				isDownloading: false,
			});

			// Clean up:
			currentDownloads.delete(url);
			clearInterval(interval);
			electronPort!.close();

			dbg(
				"Download was destroyed. Deleting stream from currentDownloads:",
				currentDownloads,
				"Does the downloaded file still exists?",
				await pathExists(saveSite),
			);
		})
		.on("end", async () => {
			log(
				`%cFile "${titleWithExtension}" saved successfully!`,
				"color: green; font-weight: bold;",
			);

			// Tell the client the download was successfull:
			electronPort!.postMessage({
				status: ProgressStatus.SUCCESS,
				isDownloading: false,
			});

			// Download media image and put it on the media metadata:
			await writeTags(saveSite, {
				downloadImg: true,
				isNewMedia: true,
				imageURL,
			});

			// Clean up:
			currentDownloads.delete(url);
			clearInterval(interval);
			electronPort!.close();
		})
		.on("error", async err => {
			error(`Error downloading file: "${titleWithExtension}"!`, err);

			// Delete the file since it errored:
			await deleteFile(saveSite);

			// TODO: unify these two below:
			// Tell the client the download threw an error:
			sendMsgToClient({
				type: ElectronToReactMessageEnum.DOWNLOAD_CANCELED_SUCCESSFULLY,
				url,
			});
			electronPort!.postMessage({
				status: ProgressStatus.FAILED,
				isDownloading: false,
				error: err,
			});

			// Clean up:
			currentDownloads.delete(url);
			readStream.destroy(err); // I only found it to work when I send it with an Error.
			clearInterval(interval);
			electronPort!.close();

			dbg(
				"Download threw an error. Deleting stream from currentDownloads:",
				currentDownloads,
				"Does the downloaded file still exists?",
				await pathExists(saveSite),
			);
		});

	fluent_ffmpeg(readStream).toFormat(extension!).saveToFile(saveSite);

	currentDownloads.set(url, readStream);
	dbg(`Added "${url}" to currentDownloads =`, currentDownloads);
}

/////////////////////////////////////////////
// Types:

export type CreateDownload = Readonly<
	{
		electronPort?: MessagePort;
		extension?: AllowedMedias;
		imageURL?: string;
		destroy?: boolean;
		title?: string;
		url: string;
	}
>;