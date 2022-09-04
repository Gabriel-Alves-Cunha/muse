/* eslint-disable @typescript-eslint/no-non-null-assertion */

import type { MediaBeingDownloaded } from "@components/Downloading";
import type { MediaUrl } from "@contexts/downloadList";
import type { Readable } from "node:stream";

import { cursorTo, clearLine } from "node:readline";
import { join } from "node:path";
import sanitize from "sanitize-filename";
import ytdl from "ytdl-core";

import { type AllowedMedias, dbg, isDev } from "@common/utils";
import { ElectronToReactMessageEnum } from "@common/enums";
import { deleteFile, doesPathExists } from "../file";
import { checkOrThrow, validator } from "@common/args-validator";
import { sendMsgToClient } from "@common/crossCommunication";
import { ProgressStatus } from "@common/enums";
import { fluent_ffmpeg } from "./ffmpeg";
import { prettyBytes } from "@common/prettyBytes";
import { writeTags } from "./mutate-metadata";
import { dirs } from "@main/utils";

const { error, log } = console;

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Schemas For Arguments Verification

const checkArgsToCreateDownload = validator.compile<CreateDownload>({
	// All Required. Not empty.
	electronPort: "object",
	extension: "string",
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
// Entry function:

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
	{ electronPort, extension, imageURL, title, url, artist = "" }:
		CreateDownload,
): Promise<void> {
	dbg(`Attempting to create a stream for "${title}" to download.`);

	const titleWithExtension = sanitize(`${title}.${extension}`);
	const saveSite = join(dirs.music, titleWithExtension);

	// Assert file doesn't already exists:
	if (await doesPathExists(saveSite)) {
		const info = `File "${saveSite}" already exists! Canceling download.`;

		error(info);

		// Send a msg to the client that the download failed:
		const msg: Partial<MediaBeingDownloaded> & { error: Error; } = {
			status: ProgressStatus.FAILED,
			error: new Error(info),
		};
		electronPort!.postMessage(msg);

		// Don't forget to throw away the MessagePort (clean up):
		electronPort!.close();

		return;
	}

	/////////////////////////////////////////////

	let interval: NodeJS.Timer | undefined;
	const startTime = Date.now();
	let percentageToSend = 0;
	let prettyTotal = "";

	/////////////////////////////////////////////

	// ytdl will 'end' the stream for me.
	const readStream = ytdl(url, {
		requestOptions: { maxRetries: 0 },
		quality: "highestaudio",
	})
		/////////////////////////////////////////////
		/////////////////////////////////////////////
		// On progress, send percentage of download to client:
		.on("progress", (_, downloaded: number, total: number) => {
			const percentage = (downloaded / total) * 100;
			percentageToSend = percentage;

			// To client:
			if (interval === undefined) {
				// ^ Only in the firt time this 'on progress' fn is called!
				interval = setInterval(
					() => electronPort!.postMessage({ percentage: percentageToSend }),
					500,
				);

				// Save download size to prettyTotal to not keep recalculating
				// it every time (right now, this is used only below for
				// development, but it can be sent to the client easily):
				prettyTotal = prettyBytes(total);

				// Send a message to client that we're successfully starting a download:
				const msg: Partial<MediaBeingDownloaded> = {
					status: ProgressStatus.ACTIVE,
				};
				electronPort!.postMessage(msg);
			}

			// Log progress to node console if in development:
			if (isDev) {
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
		/////////////////////////////////////////////
		/////////////////////////////////////////////
		// Handle download cancelation:
		.on("destroy", async () => {
			log(
				`%cDestroy was called on readStream! title: ${title}`,
				"color: blue; font-weight: bold; background: yellow; font-size: 0.8rem;",
			);

			// Delete the file since it was canceled:
			await deleteFile(saveSite);

			// Tell the client the download was successfully canceled:
			const msg: Partial<MediaBeingDownloaded> = {
				status: ProgressStatus.CANCEL,
			};
			electronPort!.postMessage(msg);

			// Clean up:
			currentDownloads.delete(url);
			clearInterval(interval);
			electronPort!.close();

			dbg(
				"Download was destroyed. Deleting stream from currentDownloads:",
				currentDownloads,
				"Does the downloaded file still exists?",
				await doesPathExists(saveSite),
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
			electronPort!.postMessage(msg);

			// Download media image and put it on the media metadata:
			try {
				await writeTags(saveSite, {
					albumArtists: [artist],
					imageURL: imageURL!,
					downloadImg: true,
					isNewMedia: true,
					title: title!,
				});
			} catch (err) {
				error(err);
			}

			// Tell client to add a new media...
			sendMsgToClient({
				type: ElectronToReactMessageEnum.ADD_ONE_MEDIA,
				mediaPath: saveSite,
			});

			// Clean up:
			currentDownloads.delete(url);
			clearInterval(interval);
			electronPort!.close();
		})
		/////////////////////////////////////////////
		/////////////////////////////////////////////
		.on("error", async err => {
			error(`Error downloading file: "${titleWithExtension}"!`, err);

			// Delete the file since it errored:
			await deleteFile(saveSite);

			// Tell the client the download threw an error:
			const msg: Partial<MediaBeingDownloaded> & { error: Error; } = {
				status: ProgressStatus.FAILED,
				error: new Error(err.message),
			};
			electronPort!.postMessage(msg);

			// Clean up:
			currentDownloads.delete(url);
			readStream.destroy(err); // I only found it to work when I send it with an Error.
			clearInterval(interval);
			electronPort!.close();

			dbg(
				"Download threw an error. Deleting stream from currentDownloads:",
				currentDownloads,
				"Does the downloaded file still exists?",
				await doesPathExists(saveSite),
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

export type CreateDownload = Readonly<
	{
		electronPort?: MessagePort;
		extension?: AllowedMedias;
		imageURL?: string;
		destroy?: boolean;
		artist?: string;
		title?: string;
		url: string;
	}
>;
