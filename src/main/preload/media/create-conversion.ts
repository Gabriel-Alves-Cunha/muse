/* eslint-disable @typescript-eslint/no-non-null-assertion */

import type { Readable } from "node:stream";
import type { Path } from "@common/@types/generalTypes";

import { createReadStream } from "node:fs";
import { dirname, join } from "node:path";
import { error, log } from "node:console";
import Validator from "fastest-validator";
import sanitize from "sanitize-filename";

import { type AllowedMedias, dbg, getBasename } from "@common/utils";
import { ElectronToReactMessageEnum } from "@common/@types/electron-window";
import { deleteFile, pathExists } from "../file";
import { ProgressStatus } from "@common/enums";
import { fluent_ffmpeg } from "./ffmpeg";
import { dirs } from "@main/utils";

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Schemas for arguments verification

const v = new Validator();

/////////////////////////////////////////////

const checkArgsToConvertToAudio = v.compile<CreateConversion>({
	electronPort: { type: "class", instanceof: MessagePort },
	toExtension: "string", // Required. Not empty.
	path: "string",
	// $$strict: true, // No additional properties allowed.
});

/////////////////////////////////////////////

const checkForURL = v.compile({ url: { type: "url" } });

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////

const mediasConverting: Map<Path, Readable> = new Map();

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////

export async function createOrCancelConvert(
	{ electronPort, toExtension, destroy, path }: CreateConversion,
): Promise<void> {
	if (!path) return error("Missing required param 'path'!", arguments);

	if (!mediasConverting.has(path)) {
		if (!toExtension || !electronPort)
			return error("Missing required params!", arguments);

		return await convertToAudio({ path, toExtension, electronPort });
	} else if (destroy) mediasConverting.get(path)!.emit("destroy");
}

/////////////////////////////////////////////

export async function convertToAudio(
	{ electronPort, toExtension, path }: Required<
		Omit<CreateConversion, "destroy">
	>,
): Promise<void> {
	const titleWithExtension = sanitize(`${getBasename(path)}.${toExtension}`);

	{
		// Assert files don't have the same extension
		const pathWithNewExtension = join(dirname(path), titleWithExtension);

		// && that there already doesn't exists one:
		if (
			path.endsWith(toExtension) || (await pathExists(pathWithNewExtension))
		) {
			error(
				`File "${path}" already is "${toExtension}"! Canceling conversion.`,
			);

			// Send a msg saying that conversion failed;
			return sendFailedConversionMsg(path, electronPort);
		}
	}

	const saveSite = join(dirs.music, titleWithExtension);
	let interval: NodeJS.Timer | undefined = undefined;
	const readStream = createReadStream(path);

	dbg(`Creating stream for "${path}" to convert to "${toExtension}".`);

	fluent_ffmpeg(readStream)
		.on(
			"progress",
			({ targetSize, timemark }: { targetSize: number; timemark: number; }) => {
				// targetSize: current size of the target file in kilobytes
				// timemark: the timestamp of the current frame in seconds

				// To react:
				if (!interval) {
					// ^ Only in the firt time this setInterval is called!
					interval = setInterval(() =>
						electronPort.postMessage({
							sizeConverted: targetSize,
							timeConverted: timemark,
						}), 1_000);

					// Send a message to client that we're starting a conversion:
					sendMsgToClient({
						type: ElectronToReactMessageEnum.NEW_COVERSION_CREATED,
						path,
					});
				}
			},
		)
		.on("error", async err => {
			error(`Error converting file: "${titleWithExtension}"!\n\n`, err);

			// Delete the file if it's not converted successfully:
			if (await pathExists(saveSite)) await deleteFile(saveSite);

			// To react:
			electronPort.postMessage({
				status: ProgressStatus.FAILED,
				isConverting: false,
				error: err,
			});
			electronPort.close();
			clearInterval(interval);

			// I only found it to work when I send it with an Error:
			readStream.destroy(err);

			mediasConverting.delete(path);
			dbg(
				"Convertion threw an error. Deleting from mediasConverting:",
				mediasConverting,
				"Was file deleted?",
				await pathExists(saveSite),
			);

			sendFailedConversionMsg(path, electronPort);
		})
		.on("end", async () => {
			log(
				`%cFile "${titleWithExtension}" saved successfully!`,
				"color: green; font-weight: bold;",
			);

			// To react:
			electronPort.postMessage({
				status: ProgressStatus.SUCCESS,
				isConverting: false,
			});
			electronPort.close();
			clearInterval(interval);

			// Treat the successfully converted file as a new media...
			{
				sendMsgToClient({
					type: ElectronToReactMessageEnum.ADD_ONE_MEDIA,
					mediaPath: saveSite,
				});

				// ...and remove old one
				sendMsgToClient({
					type: ElectronToReactMessageEnum.REMOVE_ONE_MEDIA,
					mediaPath: path,
				});
			}

			readStream.close();

			mediasConverting.delete(path);
			dbg(
				"Convertion successfull. Deleting from mediasConverting:",
				mediasConverting,
			);
		})
		.on("destroy", async () => {
			log(
				`%cDestroy was called on readStream for converter! path: ${path}`,
				"color: blue; font-weight: bold; background-color: yellow; font-size: 0.8rem;",
			);

			// Delete the file if it's not converted successfully:
			if (await pathExists(saveSite)) await deleteFile(saveSite);

			electronPort.postMessage({
				status: ProgressStatus.CANCEL,
				isConverting: false,
			});
			electronPort.close();
			clearInterval(interval);

			// I only found it to work when I send it with an Error:
			readStream.destroy(
				new Error(
					"This readStream is being destroyed because the ffmpeg is being destroyed.",
				),
			);

			mediasConverting.delete(path);
			dbg(
				"Convertion was destroyed. Deleting from mediasConverting:",
				mediasConverting,
				"Was file deleted?",
				await pathExists(saveSite),
			);

			sendFailedConversionMsg(path, electronPort);
		})
		.save(saveSite);

	mediasConverting.set(path, readStream);
	dbg(`Added "${path}" to mediasConverting:`, mediasConverting);
}

export type CreateConversion = Readonly<
	{
		toExtension?: AllowedMedias;
		electronPort?: MessagePort;
		destroy?: boolean;
		path: Path;
	}
>;
