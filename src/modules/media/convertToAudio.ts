import type { MediaBeingConverted } from "@components/Converting/helper";
import type { AllowedMedias } from "@utils/utils";
import type { Path } from "types/generalTypes";

import { exists, removeFile } from "@tauri-apps/api/fs";
import { dirname } from "@tauri-apps/api/path";
import sanitize from "sanitize-filename";

import { log, error, throwErr, dbg } from "@utils/log";
import { ProgressStatus } from "@utils/enums";
import { fluent_ffmpeg } from "./ffmpeg";
import { removeMedia } from "@contexts/usePlaylists";
import { getBasename } from "@utils/path";
import { dirs } from "@utils/utils";
import { join } from "@utils/file";

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Constants:

const mediasConverting: Map<Path, ReadableStream> = new Map();

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////

export function createOrCancelConvert(args: CreateConversion): void {
	if (!args.path) throwErr(`'path' is required. Received: "${args.path}".`);

	if (!mediasConverting.has(args.path)) {
		if (!args.downloaderPort)
			throwErr(
				`'electronPort' is required. Received: \`${args.downloaderPort}\`.`,
			);

		if (!args.toExtension)
			throwErr(`'toExtension' is required. Received: "${args.toExtension}".`);

		if (!args.path) throwErr(`A path is required. Received: "${args.path}".`);

		convertToAudio(args as Required<CreateConversion>).then();
	} else if (args.destroy) mediasConverting.get(args.path)!.emit("destroy");
}

/////////////////////////////////////////////
// Main function:

export async function convertToAudio(
	// Treat args as NotNullable cause argument check was
	// (has to be) done before calling this function.
	{ downloaderPort, toExtension, path }: Required<CreateConversion>,
): Promise<void> {
	dbg(`Attempting to convert "${path}".`);

	const titleWithExtension = sanitize(`${getBasename(path)}.${toExtension}`);

	/////////////////////////////////////////////
	/////////////////////////////////////////////

	{
		// Assert files don't have the same extension:
		const pathWithNewExtension = join(await dirname(path), titleWithExtension);

		// And that there already doesn't exists one:
		if (path.endsWith(toExtension) || (await exists(pathWithNewExtension))) {
			const err = new Error(
				`File "${path}" already is "${toExtension}"! Conversion canceled.`,
			);

			error(err);

			// Send a msg to the client that the download failed:
			const msg: Partial<MediaBeingConverted> & { error: Error } = {
				status: ProgressStatus.FAILED,
				error: err,
			};
			downloaderPort.postMessage(msg);

			// Don't forget to throw away the MessagePort (clean up):
			downloaderPort.close();

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
						downloaderPort!.postMessage({
							sizeConverted: targetSize,
							timeConverted: timemark,
						}),
					500,
				);

				// Send a message to client that we're starting a conversion:
				const msg: Partial<MediaBeingConverted> = {
					status: ProgressStatus.ACTIVE,
				};
				downloaderPort!.postMessage(msg);
			}
		})
		/////////////////////////////////////////////
		/////////////////////////////////////////////
		.on("error", async (err) => {
			error(`Error converting file: "${titleWithExtension}"!`, err);

			// Delete the file since it errored:
			await removeFile(saveSite);

			// Tell the client the conversion threw an error:
			const msg: Partial<MediaBeingConverted> & { error: Error } = {
				status: ProgressStatus.FAILED,
				error: new Error(err.message),
			};
			downloaderPort.postMessage(msg);

			// Clean up:
			mediasConverting.delete(path);
			readStream.destroy(err); // I only found it to work when I send it with an Error:
			clearInterval(interval);
			downloaderPort.close();

			dbg(
				"Convertion threw an error. Deleting from mediasConverting:",
				mediasConverting,
				"Was file deleted?",
				await exists(saveSite),
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
				status: ProgressStatus.SUCCESS,
			};
			downloaderPort.postMessage(msg);

			// Treat the successfully converted file as a new media...
			sendMsgToClient({
				type: ElectronToReactMessage.ADD_ONE_MEDIA,
				mediaPath: saveSite,
			});

			// ...and remove old one
			removeMedia(path);

			dbg(
				"Convertion successfull. Deleting from mediasConverting:",
				mediasConverting,
			);

			// Clean up:
			mediasConverting.delete(path);
			clearInterval(interval);
			downloaderPort.close();
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
			await removeFile(saveSite);

			// Tell the client the conversion was successfully canceled:
			const msg: Partial<MediaBeingConverted> = {
				status: ProgressStatus.CANCEL,
			};
			downloaderPort.postMessage(msg);

			// Clean up:
			mediasConverting.delete(path);
			readStream.destroy(
				// I only found it to work when I send it with an Error:
				new Error(
					"This readStream is being destroyed because the ffmpeg is being destroyed.",
				),
			);
			clearInterval(interval);
			downloaderPort.close();

			dbg(
				"Convertion was destroyed. Deleting from mediasConverting:",
				mediasConverting,
				"Was file deleted?",
				await exists(saveSite),
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
	downloaderPort?: MessagePort;
	toExtension?: AllowedMedias;
	destroy?: boolean;
	path: Path;
};

/////////////////////////////////////////////

type Progress = { targetSize: number; timemark: number };