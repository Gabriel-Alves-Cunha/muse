import type { MsgObject, WriteTag } from "@common/@types/electron-window.d";
import type { AllowedMedias } from "@common/utils";
import type { Media, Path } from "@common/@types/typesAndEnums";
import type { videoInfo } from "ytdl-core";
import type { IPicture } from "node-taglib-sharp";
import type { Stream } from "./utils.js";

import { NotificationType, ProgressStatus } from "@common/@types/typesAndEnums";
import { readdir, readFile, stat, unlink } from "fs/promises";
import { contextBridge, ipcRenderer } from "electron";
import { path as _ffmpeg_path_ } from "@ffmpeg-installer/ffmpeg";
import { createReadStream } from "fs";
import { join } from "path";
import { cpus } from "os";
import {
	File as MediaFile,
	PictureType,
	ByteVector,
	StringType,
	Picture,
} from "node-taglib-sharp";
import fluent_ffmpeg from "fluent-ffmpeg";
import readline from "readline";
import ytdl from "ytdl-core";

import { formatDuration, isDevelopment, getBasename } from "@common/utils";
import { homeDir, dirs, get, has, push, remove } from "./utils.js";
import { prettyBytes } from "@common/prettyBytes";
import { dbg } from "@common/utils";

const ffmpegPath = _ffmpeg_path_.replace("app.asar", "app.asar.unpacked");
fluent_ffmpeg.setFfmpegPath(ffmpegPath);

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("electron", {
	notificationApi: {
		sendNotificationToElectron,
		receiveMsgFromElectron,
	},
	fs: {
		getFullPathOfFilesForFilesInThisDirectory: async (dir: Path) =>
			(await readdir(dir)).map(filename => join(dir, filename)),
		readFile: async (path: Path) => await readFile(path),
		readdir: async (dir: Path) => await readdir(dir),
		rm: async (path: Path) => await unlink(path),
	},
	os: {
		homeDir,
		dirs,
	},
	media: {
		transformPathsToMedias,
		convertToAudio,
		writeTags,
		getInfo,
	},
});

window.onmessage = async event => {
	switch (event.data) {
		case "download media": {
			const electronPort = event.ports[0];
			if (!electronPort) {
				console.error(
					"There is no message port to handle 'download media' event!",
				);
				return;
			}

			electronPort.onmessage = ({
				data,
			}: {
				data: Readonly<{
					imageURL: string;
					destroy: boolean;
					title: string;
					url: string;
				}>;
			}) =>
				handleCreateOrCancelDownload(
					data.imageURL,
					data.destroy,
					data.url,
					data.title,
					electronPort,
				);

			electronPort.addEventListener("close", () =>
				dbg("Closing ports (electronPort)."),
			);

			// MessagePortMain queues messages until the .start() method has been called.
			electronPort.start();
			break;
		}

		case "convert media": {
			const electronPort = event.ports[0];
			if (!electronPort) {
				console.error(
					"There is no MessagePort to handle 'convert media' event!",
				);
				return;
			}

			electronPort.onmessage = ({
				data,
			}: {
				data: Readonly<{
					toExtension: AllowedMedias;
					destroy: boolean;
					path: Path;
				}>;
			}) =>
				handleCreateOrCancelConvert(
					data.destroy,
					data.toExtension,
					data.path,
					electronPort,
				);

			electronPort.addEventListener("close", () =>
				dbg("Closing ports (electronPort)."),
			);

			// MessagePortMain queues messages until the .start() method has been called.
			electronPort.start();
			break;
		}

		case "write tag": {
			const details: { mediaPath: Path; [whatToChange: string]: string } =
				event.data;
			const data = {};
			Object.entries(details).forEach(pair => Object.assign(data, pair));

			dbg({ event }, "\n\n\n", { details, data });

			await writeTags(details.mediaPath, data);

			break;
		}

		case "async two way comm": {
			dbg("Window received 'async two way comm':", event);

			const electronPort = event.ports[0];
			if (!electronPort) {
				console.error(
					"There should be an electronPort for 2-way communication with React!",
				);
				return;
			}

			window.twoWayComm_React_Electron = addListeners(electronPort);

			// MessagePortMain queues messages until the .start() method has been called.
			electronPort.start();
			break;
		}

		default: {
			console.error(
				`There is no method to handle this event: (${typeof event.data}) "${
					event.data
				}";\nEvent =`,
				event,
			);
			break;
		}
	}
};

const currentDownloads: Stream[] = [];
const mediasConverting: Stream[] = [];

function sendNotificationToElectron(
	object: Readonly<{
		type: NotificationType;
		msg?: string;
	}>,
): void {
	ipcRenderer.send("notify", object);
}

export function receiveMsgFromElectron(
	handleMsg: (msgObject: MsgObject) => void,
): void {
	ipcRenderer.on("async-msg", (_, msgObject: MsgObject) =>
		handleMsg(msgObject),
	);
}

async function getInfo(url: string): Promise<videoInfo | undefined> {
	try {
		return await ipcRenderer.invoke("get-info-ytdl", url);
	} catch (error) {
		console.error(error);
		return;
	}
}

export async function transformPathsToMedias(
	paths: readonly string[],
	assureMediaSizeIsGreaterThan60KB = true,
	ignoreMediaWithLessThan60Seconds = true,
): Promise<readonly (Media | undefined)[]> {
	const getMedia = async (
		path: string,
		index: number,
	): Promise<Media | undefined> => {
		try {
			console.time(`for (const [${index}, "${path}"])`);
			const {
				tag: { pictures, title, album, genres, albumArtists },
				properties: { durationMilliseconds },
			} = MediaFile.createFromPath(path);

			const duration = durationMilliseconds / 1_000;

			if (ignoreMediaWithLessThan60Seconds && duration < 60) {
				console.log(
					`Jumping "${path}" because time is ${duration} seconds (< 60 seconds)!`,
				);
				return undefined;
			}

			const { size: sizeInBytes } = await stat(path);
			if (assureMediaSizeIsGreaterThan60KB && sizeInBytes < 60_000) {
				console.log(
					`Jumping "${path}" because size is ${sizeInBytes} bytes! (< 60_000 bytes)`,
				);
				return undefined;
			}

			const picture: IPicture | undefined = pictures[0];
			const mimeType = picture?.mimeType;
			let img = "";
			if (picture && mimeType) {
				const str =
					// If the picture wasn't made by us. (That's the only way I found to
					// make this work, cause, when we didn't make the picture in
					// `writeTag`, we can't decode it!):
					picture.type === PictureType.NotAPicture ||
					picture.type === PictureType.Other
						? Buffer.from(picture.data.data).toString("base64")
						: picture?.data.toString();
				img = `data:${mimeType};base64,${str}`;
			}

			const media: Media = {
				duration: formatDuration(duration),
				title: title ?? getBasename(path),
				size: prettyBytes(sizeInBytes),
				artist: albumArtists[0] ?? "",
				dateOfArival: Date.now(),
				genres,
				album,
				index,
				path,
				img,
			};

			// dbg("%cmedia =", "background-color: #f9ca4c80;", media);
			return media;
		} catch (error) {
			console.error(error);
			return undefined;
		} finally {
			console.timeEnd(`for (const [${index}, "${path}"])`);
		}
	};

	console.time("Creating promises");
	const promises = paths
		.map((path, index) => getMedia(path, index))
		.filter(Boolean);
	console.timeEnd("Creating promises");

	console.time("Running promises");
	const promisesResolved = await Promise.allSettled(promises);
	console.timeEnd("Running promises");

	const medias = promisesResolved
		.map(p => (p.status === "fulfilled" ? p.value : undefined))
		.filter(Boolean);

	return medias;
}

const addListeners = (port: MessagePort): Readonly<MessagePort> => {
	port.onmessage = event => {
		const { data } = event;

		dbg(
			"Message received on electron side of 2way-comm (currently doing nothing!!):",
			data,
		);
	};

	return port;
};

export function handleCreateOrCancelDownload(
	imageURL: Readonly<string>,
	destroy: Readonly<boolean>,
	url: Readonly<string>,
	title: Readonly<string>,
	electronPort: Readonly<MessagePort>,
) {
	if (url && !has(currentDownloads, url))
		makeStream(imageURL, url, title, electronPort);
	else if (url && destroy) {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		const { stream } = get(currentDownloads, url)!;
		stream.emit("destroy");
		const readAnswer = stream.destroy(
			new Error("This readStream is being destroyed!"),
		);

		dbg("readStream 'destroy()' answer =", readAnswer);

		dbg(
			`Was "${url}" deleted from map? `,
			"\ncurrentDownloads =",
			remove(currentDownloads, url),
		);
	}
}

export function makeStream(
	imageURL: Readonly<string>,
	url: Readonly<string>,
	title: Readonly<string>,
	electronPort: Readonly<MessagePort>,
) {
	const extension: AllowedMedias = "mp3";
	const titleWithExtension = `${title}.${extension}`;
	const saveSite = `${dirs.music}/${titleWithExtension}`;
	const startTime = Date.now();

	let interval: NodeJS.Timer | undefined = undefined;
	let percentageToSend = "";

	// ytdl will 'end' the stream for me.
	const readStream = ytdl(url, {
		requestOptions: { maxRetries: 0 },
		quality: "highestaudio",
	})
		.once("destroy", () => {
			console.log(
				"%cDestroy was called on readStream!",
				"color: blue; font-weight: bold; background-color: yellow; font-size: 0.8rem;",
			);

			electronPort.postMessage({
				status: ProgressStatus.CANCEL,
				isDownloading: false,
			});
			electronPort.close();

			interval && clearInterval(interval);
		})
		.on("progress", (_, downloaded, total) => {
			const minutesDownloading = ((Date.now() - startTime) / 6e4).toFixed(2);
			const percentage = ((downloaded / total) * 100).toFixed(2);
			percentageToSend = percentage;
			const estimatedDownloadTime = (
				+minutesDownloading / (+percentage / 100) -
				+minutesDownloading
			).toFixed(2);

			// To react:
			if (!interval) {
				// ^ Only in the firt time this 'on progress' fn is called!

				interval = setInterval(
					() => electronPort.postMessage({ percentage: percentageToSend }),
					2_000,
				);
			}

			// To node console if is in development:
			if (isDevelopment) {
				readline.cursorTo(process.stdout, 0);
				process.stdout.write(
					`${percentage}% downloaded, (${prettyBytes(downloaded)}/${prettyBytes(
						total,
					)}). Running for: ${minutesDownloading} minutes. ETA: ${estimatedDownloadTime} minutes.`,
				);
			}
		})
		.once("end", async () => {
			console.log(
				`%cFile "${titleWithExtension}" saved successfully!`,
				"color: green; font-weight: bold;",
			);

			// To react:
			electronPort.postMessage({
				status: ProgressStatus.SUCCESS,
				isDownloading: false,
			});
			electronPort.close();

			interval && clearInterval(interval);

			try {
				await writeTags(saveSite, { imageURL });
				remove(currentDownloads, url);
			} catch (error) {
				console.error(error, { currentDownloads });
			}
		})
		.once("error", error => {
			console.error(`Error downloading file: "${titleWithExtension}"!`, error);

			// To react
			electronPort.postMessage({
				status: ProgressStatus.FAIL,
				isDownloading: false,
				error,
			});

			electronPort.close();

			interval && clearInterval(interval);
		});

	fluent_ffmpeg(readStream).toFormat(extension).save(saveSite);

	push(currentDownloads, { url, stream: readStream });
}

export function handleCreateOrCancelConvert(
	destroy: Readonly<boolean>,
	toExtension: AllowedMedias,
	path: Readonly<Path>,
	electronPort: Readonly<MessagePort>,
) {
	if (path && !has(mediasConverting, path))
		convertToAudio(path, toExtension, electronPort);
	else if (path && destroy) {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		const { stream } = get(mediasConverting, path)!;
		stream.emit("destroy");
		const readAnswer = stream.destroy(
			new Error("This readStream is being destroyed!"),
		);

		dbg("readStream 'destroy()' answer =", readAnswer);

		const wasRemoved = remove(mediasConverting, path);
		dbg(
			`Was "${path}" deleted from map? ${wasRemoved}\nmediasConverting =`,
			mediasConverting,
		);
	}
}

export function convertToAudio(
	mediaPath: Readonly<Path>,
	toExtension: AllowedMedias,
	electronPort: Readonly<MessagePort>,
) {
	const titleWithExtension = `${getBasename(mediaPath)}.${toExtension}`;
	const saveSite = `${dirs.music}/${titleWithExtension}`;
	const readStream = createReadStream(mediaPath);

	let interval: NodeJS.Timer | undefined = undefined;
	let timeConverted = "";
	let sizeConverted: 0;

	fluent_ffmpeg(readStream)
		.toFormat(toExtension)
		.save(saveSite)
		.addOptions(["-threads", String(cpus().length)])
		.on("progress", p => {
			// targetSize: current size of the target file in kilobytes
			// timemark: the timestamp of the current frame in seconds
			sizeConverted = p.targetSize;
			timeConverted = p.timemark;

			// To react:
			if (!interval) {
				// ^ Only in the firt time this 'on progress' fn is called!
				interval = setInterval(
					() => electronPort.postMessage({ sizeConverted, timeConverted }),
					2_000,
				);
			}
		})
		.once("error", error => {
			console.error(`Error Converting file: "${titleWithExtension}"!`, error);

			// To react:
			electronPort.postMessage({
				status: ProgressStatus.FAIL,
				isConverting: false,
				error,
			});

			electronPort.close();

			interval && clearInterval(interval);
		})
		.once("end", async () => {
			console.log(
				`%cFile "${titleWithExtension}" saved successfully!`,
				"color: green; font-weight: bold;",
			);

			// To react:
			electronPort.postMessage({
				status: ProgressStatus.SUCCESS,
				isConverting: false,
			});

			electronPort.close();

			interval && clearInterval(interval);

			////////////////////////////////////////
			console.log(
				"Deleting from map:",
				remove(mediasConverting, mediaPath),
				"\nconverting =",
				mediasConverting,
			);
		})
		.once("destroy", () => {
			console.log(
				"%cDestroy was called on readStream for converter!",
				"color: blue; font-weight: bold; background-color: yellow; font-size: 0.8rem;",
			);

			electronPort.postMessage({
				status: ProgressStatus.CANCEL,
				isConverting: false,
			});
			electronPort.close();

			interval && clearInterval(interval);
		});

	push(mediasConverting, { url: mediaPath, stream: readStream });
	dbg("Medias converting =", mediasConverting);
}

export async function writeTags(pathOfMedia: Readonly<Path>, data: WriteTag) {
	const file = MediaFile.createFromPath(pathOfMedia);
	// dbg("File =", file);
	// dbg("File tags =", file.tag);

	if (data.imageURL) {
		// Get picture:
		try {
			const imgAsString: `data:${string};base64,${string}` =
				await ipcRenderer.invoke("get-image", data.imageURL);

			const txtForByteVector = imgAsString.slice(
				imgAsString.indexOf(",") + 1,
				imgAsString.length,
			);
			const mimeType = imgAsString.slice(
				imgAsString.indexOf(":") + 1,
				imgAsString.indexOf(";"),
			);

			const picture = Picture.fromData(
				ByteVector.fromString(txtForByteVector, StringType.Latin1),
			);

			console.time("Setting image, mimeType and type");
			picture.type = PictureType.Media;
			file.tag.pictures = [picture];
			picture.mimeType = mimeType;
			console.timeEnd("Setting image, mimeType and type");
		} catch (error) {
			console.error("There was an error getting the picture data.", error);
		}
	}

	Object.entries(data).forEach(([tag, value]) => {
		if (tag !== "imageURL") {
			// @ts-ignore: tag is one of WriteTag, wich is based on MediaFile.Tag, so it's fine.
			file.tag[tag] = value;
			// @ts-ignore: tag is one of WriteTag, wich is based on MediaFile.Tag, so it's fine.
			console.log(`file.tag[${tag}] = ${file.tag[tag]}`);
		}
	});

	file.save();
	file.dispose();
}

// setTimeout(async () => {
// 	// dbg("Starting");

// 	// const imgAsString: string = await ipcRenderer.invoke(
// 	// 	"get-image",
// 	// 	"https://i.ytimg.com/vi/fO_uNc49iNE/hqdefault.jpg?sqp=-oaymwEbCKgBEF5IVfKriqkDDggBFQAAiEIYAXABwAEG&rs=AOn4CLAOD0x7klMGEfYr5h4z7sLI3iwx5A"
// 	// );
// 	// const match = imageTypeRegex.exec(imgAsString);

// 	// const data = ByteVector.fromString(imgAsString, StringType.Latin1);
// 	// const picture = Picture.fromData(data);
// 	// picture.mimeType = match?.[1] ?? "";
// 	// dbg({ picture });

// 	// const file = MediaFile.createFromPath(
// 	// 	"/home/gabriel/Music/BENEE - Same Effect (Official Audio).mp3"
// 	// );

// 	// file.tag.pictures = [picture];
// 	// dbg("File tags =", file.tag.pictures);

// 	const picture_ = (file.tag.pictures[0] as IPicture).data;
// 	dbg(
// 		"Picture decoded =\n\n",
// 		picture_.toString(picture_.length, StringType.Latin1)
// 	);

// 	file.save();
// 	file.dispose();
// }, 5_000);

// export function watchForDirectories(dirs: readonly string[]) {
// 	const wildcardList = dirs
// 		.map(dir =>
// 			allowedMedias.map(extension => normalize(dir + "/*." + extension)),
// 		)
// 		.flat();

// 	const watcher = watch(wildcardList, {
// 		awaitWriteFinish: { stabilityThreshold: 10_000, pollInterval: 10_000 },
// 		ignorePermissionErrors: true,
// 		followSymlinks: false,
// 		ignoreInitial: true,
// 		usePolling: false,
// 		alwaysStat: false,
// 		depth: 0,
// 	});

// 	const log = console.log.bind(console);
// 	// ^ Something to use when events are received.

// 	watcher
// 		.on("error", error =>
// 			console.error("%c[Chokidar]", logStyle, " Error happened", error),
// 		)
// 		.on("ready", () => {
// 			log(
// 				"%c[Chokidar]",
// 				logStyle,
// 				"Initial scan complete. Listening for changes.",
// 			);

// 			log(
// 				"%c[Chokidar]",
// 				logStyle,
// 				"Files being watched:",
// 				watcher.getWatched(),
// 			);
// 		})
// 		.on("unlink", path => {
// 			log(`%c[Chokidar] File "${path}" has been removed.`, logStyle);
// 			window.twoWayComm_React_Electron?.postMessage({
// 				msg: "remove media",
// 				path,
// 			});
// 		})
// 		.on("add", path => {
// 			log(`%c[Chokidar] File "${path}" has been added.`, logStyle);
// 			window.twoWayComm_React_Electron?.postMessage({ msg: "add media", path });
// 		});
// }

// watchForDirectories(Object.values(dirs));

// const logStyle =
// 	"background-color: green; font-size: 0.8rem; font-weight: bold; color: white;";

// dbg(
// 	`The 'preload.ts' script uses approximately ${
// 		process.memoryUsage().heapUsed / 1_024 / 1_024
// 	} MB`,
// );
