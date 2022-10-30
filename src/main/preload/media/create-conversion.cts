/* eslint-disable @typescript-eslint/no-non-null-assertion */

import type { MediaBeingConverted } from "@components/Converting/helper";
import type { Readable } from "node:stream";
import type { Path } from "@common/@types/generalTypes";

import { createReadStream } from "node:fs";
import { dirname, join } from "node:path";
import sanitize from "sanitize-filename";

import { deleteFile, doesPathExists } from "../file.cjs";
import { checkOrThrow, validator } from "@common/args-validator";
import { electronToReactMessage } from "@common/enums";
import { type AllowedMedias } from "@common/utils";
import { sendMsgToClient } from "@common/crossCommunication";
import { progressStatus } from "@common/enums";
import { fluent_ffmpeg } from "./ffmpeg.cjs";
import { getBasename } from "@common/path";
import { dirs } from "@main/utils.cjs";
import { dbg } from "@common/debug";

const { error, log } = console;

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Schemas For Arguments Verification

const checkArgsToConvertToAudio = validator.compile<CreateConversion>({
	// All Required. Not empty.
	electronPort: "object",
	toExtension: "string",
	path: "string",
	// $$strict: true, // No additional properties allowed.
});

/////////////////////////////////////////////

const checkForPath = validator.compile({ path: "string" });

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Constants:

const mediasConverting: Map<Path, Readable> = new Map();

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////

export async function createOrCancelConvert(
	args: CreateConversion,
): Promise<void> {
	checkOrThrow(checkForPath(args));

	if (!mediasConverting.has(args.path)) {
		checkOrThrow(checkArgsToConvertToAudio(args));

		return await convertToAudio(args);
	} else if (args.destroy) mediasConverting.get(args.path)!.emit("destroy");
}

/////////////////////////////////////////////
// Main function:

export async function convertToAudio(
	// Treat args as NotNullable cause argument check was
	// (has to be) done before calling this function.
	{ electronPort, toExtension, path }: CreateConversion,
): Promise<void> {
	dbg(`Attempting to covert "${path}".`);

	const titleWithExtension = sanitize(`${getBasename(path)}.${toExtension}`);

	/////////////////////////////////////////////
	/////////////////////////////////////////////

	{
		// Assert files don't have the same extension:
		const pathWithNewExtension = join(dirname(path), titleWithExtension);

		// And that there already doesn't exists one:
		if (
			path.endsWith(toExtension!) ||
			(await doesPathExists(pathWithNewExtension))
		) {
			const info =
				`File "${path}" already is "${toExtension}"! Conversion canceled.`;

			error(info);

			// Send a msg to the client that the download failed:
			const msg: Partial<MediaBeingConverted> & { error: Error; } = {
				status: progressStatus.FAILED,
				error: new Error(info),
			};
			electronPort!.postMessage(msg);

			// Don't forget to throw away the MessagePort (clean up):
			electronPort!.close();

			return;
		}
	}

	/////////////////////////////////////////////
	/////////////////////////////////////////////

	const saveSite = join(dirs.music, titleWithExtension);
	const readStream = createReadStream(path);
	let interval: NodeJS.Timer | undefined;

	dbg(`Creating stream for "${path}" to convert to "${toExtension}".`);

	/////////////////////////////////////////////
	/////////////////////////////////////////////

	// Receive the readStream of path and act with ffmpeg on it:
	fluent_ffmpeg(readStream)
		/////////////////////////////////////////////
		/////////////////////////////////////////////
		.on("progress", ({ targetSize, timemark }: Progress) => {
			// targetSize: current size of the target file in kilobytes
			// timemark: the timestamp of the current frame in seconds

			// To react:
			if (interval === undefined) {
				// ^ Only in the firt time this setInterval is called!
				interval = setInterval(() =>
					electronPort!.postMessage({
						sizeConverted: targetSize,
						timeConverted: timemark,
					}), 500);

				// Send a message to client that we're starting a conversion:
				const msg: Partial<MediaBeingConverted> = {
					status: progressStatus.ACTIVE,
				};
				electronPort!
					.postMessage(msg);
			}
		})
		/////////////////////////////////////////////
		/////////////////////////////////////////////
		.on("error", async err => {
			error(`Error converting file: "${titleWithExtension}"!`, err);

			// Delete the file since it errored:
			await deleteFile(saveSite);

			// Tell the client the conversion threw an error:
			const msg: Partial<MediaBeingConverted> & { error: Error; } = {
				status: progressStatus.FAILED,
				error: new Error(err.message),
			};
			electronPort!.postMessage(msg);

			// Clean up:
			mediasConverting.delete(path);
			readStream.destroy(err); // I only found it to work when I send it with an Error:
			clearInterval(interval);
			electronPort!.close();

			dbg(
				"Convertion threw an error. Deleting from mediasConverting:",
				mediasConverting,
				"Was file deleted?",
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
			const msg: Partial<MediaBeingConverted> = {
				status: progressStatus.SUCCESS,
			};
			electronPort!.postMessage(msg);

			// Treat the successfully converted file as a new media...
			sendMsgToClient({
				type: electronToReactMessage.ADD_ONE_MEDIA,
				mediaPath: saveSite,
			});

			// ...and remove old one
			sendMsgToClient({
				type: electronToReactMessage.REMOVE_ONE_MEDIA,
				mediaPath: path,
			});

			dbg(
				"Convertion successfull. Deleting from mediasConverting:",
				mediasConverting,
			);

			// Clean up:
			mediasConverting.delete(path);
			clearInterval(interval);
			electronPort!.close();
			readStream.close();
		})
		/////////////////////////////////////////////
		/////////////////////////////////////////////
		.on("destroy", async () => {
			log(
				`%cDestroy was called on readStream for converter! path: ${path}`,
				"color: blue; font-weight: bold; background-color: yellow; font-size: 0.8rem;",
			);

			// Delete the file since it was canceled:
			await deleteFile(saveSite);

			// Tell the client the conversion was successfully canceled:
			const msg: Partial<MediaBeingConverted> = {
				status: progressStatus.CANCEL,
			};
			electronPort!.postMessage(msg);

			// Clean up:
			mediasConverting.delete(path);
			// I only found it to work when I send it with an Error:
			readStream.destroy(
				new Error(
					"This readStream is being destroyed because the ffmpeg is being destroyed.",
				),
			);
			clearInterval(interval);
			electronPort!.close();

			dbg(
				"Convertion was destroyed. Deleting from mediasConverting:",
				mediasConverting,
				"Was file deleted?",
				await doesPathExists(saveSite),
			);
		})
		/////////////////////////////////////////////
		/////////////////////////////////////////////
		.save(saveSite);

	/////////////////////////////////////////////

	mediasConverting.set(path, readStream);
	dbg(`Added "${path}" to mediasConverting:`, mediasConverting);
}

////////////////////////////////////////////
////////////////////////////////////////////
////////////////////////////////////////////
// Types:

export type CreateConversion = Readonly<
	{
		toExtension?: AllowedMedias;
		electronPort?: MessagePort;
		destroy?: boolean;
		path: Path;
	}
>;

/////////////////////////////////////////////

type Progress = Readonly<{ targetSize: number; timemark: number; }>;
