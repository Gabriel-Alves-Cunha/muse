import type { MediaBeingConverted } from "@components/Converting/helper";
import type { AllowedMedias } from "@common/utils";
import type { Readable } from "node:stream";
import type { Path } from "@common/@types/GeneralTypes";

import { createReadStream, existsSync } from "node:fs";
import { dirname, join } from "node:path";

import { ElectronToReactMessageEnum, ProgressStatusEnum } from "@common/enums";
import { log, error, throwErr } from "@common/log";
import { sendMsgToClient } from "@common/crossCommunication";
import { fluent_ffmpeg } from "./ffmpeg";
import { getBasename } from "@common/path";
import { deleteFile } from "../file";
import { sanitize } from "@main/sanitizeFilename/sanitizeFilename";
import { dirs } from "@main/utils";
import { dbg } from "@common/debug";

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Constants:

const mediasConverting: Map<Path, Readable> = new Map();

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////

export function createOrCancelConvert(args: CreateConversion): void {
	if (!args.path) throwErr(`'path' is required. Received: "${args.path}".`);

	if (!mediasConverting.has(args.path)) {
		if (!args.electronPort)
			throwErr(
				`'electronPort' is required. Received: \`${args.electronPort}\`.`,
			);

		if (!args.toExtension)
			throwErr(`'toExtension' is required. Received: "${args.toExtension}".`);

		if (!args.path) throwErr(`A path is required. Received: "${args.path}".`);

		convertToAudio(args as Required<CreateConversion>).then();
	} else if (args.destroy) mediasConverting.get(args.path)?.emit("destroy");
}

/////////////////////////////////////////////
// Main function:

export async function convertToAudio(
	// Treat args as NotNullable cause argument check was
	// (has to be) done before calling this function.
	{ electronPort, toExtension, path }: Required<CreateConversion>,
): Promise<void> {
	dbg(`Attempting to convert "${path}".`);

	const titleWithExtension = sanitize(`${getBasename(path)}.${toExtension}`);

	/////////////////////////////////////////////
	/////////////////////////////////////////////

	{
		// Assert files don't have the same extension:
		const pathWithNewExtension = join(dirname(path), titleWithExtension);

		// And that there already doesn't exists one:
		if (path.endsWith(toExtension) || existsSync(pathWithNewExtension)) {
			const err = new Error(
				`File "${path}" already is "${toExtension}"! Conversion canceled.`,
			);

			error(err);

			// Send a msg to the client that the download failed:
			const msg: Partial<MediaBeingConverted> & { error: Error } = {
				status: ProgressStatusEnum.FAILED,
				error: err,
			};
			electronPort.postMessage(msg);

			// Don't forget to throw away the MessagePort (clean up):
			electronPort.close();

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
			// targetSize: current size of file in kilobytes
			// timemark: the timestamp of the current frame in seconds

			// To react:
			if (!interval) {
				// ^ Only in the firt time this setInterval is called!
				interval = setInterval(
					() =>
						electronPort.postMessage({
							sizeConverted: targetSize,
							timeConverted: timemark,
						}),
					500,
				);

				// Send a message to client that we're starting a conversion:
				const msg: Partial<MediaBeingConverted> = {
					status: ProgressStatusEnum.ACTIVE,
				};
				electronPort.postMessage(msg);
			}
		})
		/////////////////////////////////////////////
		/////////////////////////////////////////////
		.on("error", (err) => {
			error(`Error converting file: "${titleWithExtension}"!`, err);

			// Delete the file since it errored:
			deleteFile(saveSite);

			// Tell the client the conversion threw an error:
			const msg: Partial<MediaBeingConverted> & { error: Error } = {
				status: ProgressStatusEnum.FAILED,
				error: new Error(err.message),
			};
			electronPort.postMessage(msg);

			// Clean up:
			mediasConverting.delete(path);
			readStream.destroy(err); // I only found it to work when I send it with an Error:
			clearInterval(interval);
			electronPort.close();

			dbg(
				"Convertion threw an error. Deleting from mediasConverting:",
				mediasConverting,
				"Was file deleted?",
				existsSync(saveSite),
			);
		})
		/////////////////////////////////////////////
		/////////////////////////////////////////////
		.on("end", () => {
			log(
				`%cFile "${titleWithExtension}" saved successfully!`,
				"color: green; font-weight: bold;",
			);

			// Tell the client the download was successfull:
			const msg: Partial<MediaBeingConverted> = {
				status: ProgressStatusEnum.SUCCESS,
			};
			electronPort.postMessage(msg);

			// Treat the successfully converted file as a new media...
			sendMsgToClient({
				type: ElectronToReactMessageEnum.ADD_ONE_MEDIA,
				mediaPath: saveSite,
			});

			// ...and remove old one
			sendMsgToClient({
				type: ElectronToReactMessageEnum.REMOVE_ONE_MEDIA,
				mediaPath: path,
			});

			dbg(
				"Convertion successfull. Deleting from mediasConverting:",
				mediasConverting,
			);

			// Clean up:
			mediasConverting.delete(path);
			clearInterval(interval);
			electronPort.close();
			readStream.close();
		})
		/////////////////////////////////////////////
		/////////////////////////////////////////////
		.on("destroy", () => {
			log(
				`%cDestroy was called on readStream for converter! path: ${path}`,
				"color: blue; font-weight: bold; background-color: yellow; font-size: 0.8rem;",
			);

			// Delete the file since it was canceled:
			deleteFile(saveSite);

			// Tell the client the conversion was successfully canceled:
			const msg: Partial<MediaBeingConverted> = {
				status: ProgressStatusEnum.CANCEL,
			};
			electronPort.postMessage(msg);

			// Clean up:
			mediasConverting.delete(path);
			readStream.destroy(
				// I only found it to work when I send it with an Error:
				new Error(
					"This readStream is being destroyed because the ffmpeg is being destroyed.",
				),
			);
			clearInterval(interval);
			electronPort.close();

			dbg(
				"Convertion was destroyed. Deleting from mediasConverting:",
				mediasConverting,
				"Was file deleted?",
				existsSync(saveSite),
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

export type CreateConversion = {
	toExtension?: AllowedMedias;
	electronPort?: MessagePort;
	destroy?: boolean;
	path: Path;
};

/////////////////////////////////////////////

type Progress = { targetSize: number; timemark: number };
