import type { AxiosRequestConfig, AxiosResponse } from "axios";
import type { Media, Path } from "@common/@types/types";
import type { videoInfo } from "ytdl-core";
import type { Readable } from "stream";
import type {
	NotificationType,
	MsgObject,
	WriteTag,
} from "@common/@types/electron-window.d";

import { File as MediaFile, Picture, ByteVector } from "node-taglib-sharp";
import { readdir, readFile, stat, unlink } from "fs/promises";
import { contextBridge, ipcRenderer } from "electron";
import { path as _ffmpeg_path_ } from "@ffmpeg-installer/ffmpeg";
import { createReadStream } from "fs";
import { parseFile } from "music-metadata";
import { normalize } from "path";
import { watch } from "chokidar";
import { join } from "path";
import { cpus } from "os";
import fluent_ffmpeg from "fluent-ffmpeg";
import readline from "readline";
import axios from "axios";
import ytdl from "ytdl-core";

import { homeDir, dirs } from "./utils";
import { prettyBytes } from "@common/prettyBytes";
import {
	isDevelopment,
	allowedMedias,
	getBasename,
	formatTime,
} from "@common/utils";

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("electron", {
	notificationApi: {
		sendNotificationToElectron,
		receiveMsgFromElectron,
		getInfo,
		request,
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
	},
});

const ffmpegPath = _ffmpeg_path_.replace("app.asar", "app.asar.unpacked");
fluent_ffmpeg.setFfmpegPath(ffmpegPath);

watchForDirectories(Object.values(dirs));

type StreamMap = Readonly<Map<string, Readable>>;
const currentDownloads: StreamMap = new Map();
const mediasConverting: StreamMap = new Map();

function sendNotificationToElectron(
	object: Readonly<{
		type: NotificationType;
		msg?: string;
	}>
): void {
	ipcRenderer.send("notify", object);
}

function receiveMsgFromElectron(
	handleMsg: (msgObject: MsgObject) => void
): void {
	ipcRenderer.on("async-msg", (_, msgObject: MsgObject) =>
		handleMsg(msgObject)
	);
}

async function request<ConfigType>(
	config: AxiosRequestConfig<ConfigType>
): Promise<AxiosResponse<unknown, ConfigType> | undefined> {
	try {
		return await ipcRenderer.invoke("request", config);
	} catch (error) {
		console.error(error);
		return;
	}
}

async function getInfo(url: string): Promise<videoInfo | undefined> {
	try {
		return await ipcRenderer.invoke("get-info-ytdl", url);
	} catch (error) {
		console.error(error);
		return;
	}
}

async function transformPathsToMedias(
	paths: readonly string[],
	assureMediaSizeIsGreaterThan60KB = true,
	ignoreMediaWithLessThan60Seconds = true
) {
	const medias: Media[] = [];

	for (const [index, path] of paths.entries()) {
		console.time(`Reading metadata of "${path}"`);
		const {
			common: { picture, title, album, genre, artist },
			format: { duration },
		} = await parseFile(path, { duration: true });
		console.timeEnd(`Reading metadata of "${path}"`);

		console.log("file parsed by metadata:", {
			duration,
			picture,
			artist,
			title,
			album,
			genre,
		});

		if (ignoreMediaWithLessThan60Seconds && duration && duration < 60) {
			console.log(`Jumping "${path}" because time is ${duration} seconds!`);
			continue;
		}

		const { size: sizeInBytes } = await stat(path);
		if (assureMediaSizeIsGreaterThan60KB && sizeInBytes < 60_000) {
			console.log(`Jumping "${path}" because size is ${sizeInBytes} bytes!`);
			continue;
		}

		const format = picture?.[0].format;
		const data = picture?.[0].data;
		const img =
			data && format
				? {
						data: `data:${format};base64,${data.toString("base64")}`,
						// ^ Would love some better way of doing this...
						format,
				  }
				: undefined;

		const media: Media = {
			title: title ?? getBasename(path),
			duration: formatTime(duration),
			size: prettyBytes(sizeInBytes),
			dateOfArival: new Date(),
			genres: genre,
			artist,
			album,
			index,
			path,
			img,
		};

		medias.push(media);
	}

	return medias;
}

window.onmessage = event => {
	switch (event.data) {
		case "download media": {
			const electronPort = event.ports[0];
			if (!electronPort) {
				console.error(
					"There is no message port to handle 'download media' event!"
				);
				return;
			}

			electronPort.onmessage = ({
				data,
			}: {
				data: Readonly<{
					destroy: boolean;
					title: string;
					url: string;
				}>;
			}) =>
				handleCreateOrCancelDownload(
					data.destroy,
					data.url,
					data.title,
					electronPort
				);

			electronPort.addEventListener("close", () =>
				console.log("Closing ports (electronPort).")
			);

			// MessagePortMain queues messages until the .start() method has been called.
			electronPort.start();
			break;
		}

		case "convert media": {
			const electronPort = event.ports[0];
			if (!electronPort) {
				console.error(
					"There is no MessagePort to handle 'convert media' event!"
				);
				return;
			}

			electronPort.onmessage = ({
				data,
			}: {
				data: Readonly<{
					toExtension: typeof allowedMedias[number];
					destroy: boolean;
					path: Path;
				}>;
			}) =>
				handleCreateOrCancelConvert(
					data.destroy,
					data.toExtension,
					data.path,
					electronPort
				);

			electronPort.addEventListener("close", () =>
				console.log("Closing ports (electronPort).")
			);

			// MessagePortMain queues messages until the .start() method has been called.
			electronPort.start();
			break;
		}

		case "async two way comm": {
			console.log("Window received 'async two way comm':", event);

			const electronPort = event.ports[0];
			if (!electronPort) {
				console.error(
					"There should be an electronPort for 2-way communication with React!"
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
				event
			);
			break;
		}
	}
};

const addListeners = (port: MessagePort): Readonly<MessagePort> => {
	port.onmessage = event => {
		const { data } = event;

		console.log(
			"Message received on electron side of 2way-comm (currently doing nothing!!):",
			data
		);
	};

	return port;
};

function handleCreateOrCancelDownload(
	destroy: Readonly<boolean>,
	url: Readonly<string>,
	title: Readonly<string>,
	electronPort: Readonly<MessagePort>
) {
	if (url && !currentDownloads.has(url)) makeStream(url, title, electronPort);
	else if (url && destroy) {
		const stream = currentDownloads.get(url);
		stream?.emit("destroy");
		const readAnswer = stream?.destroy(
			new Error("This readStream is being destroyed!")
		);

		console.log("readStream 'destroy()' answer =", readAnswer);

		console.log(
			`Was "${url}" deleted from map? `,
			currentDownloads.delete(url),
			"\ncurrentDownloads =",
			currentDownloads
		);
	}
}

function makeStream(
	url: Readonly<string>,
	title: Readonly<string>,
	electronPort: Readonly<MessagePort>
) {
	const extension: Readonly<typeof allowedMedias[number]> = "mp3";
	const titleWithExtension = `${title}.${extension}`;
	const saveSite = `${dirs.music}/${titleWithExtension}`;
	const startTime = Date.now();
	let interval: NodeJS.Timer | undefined = undefined;
	let percentageToSend = "";
	let prettyTotal = "";

	// ytdl will 'end' the stream for me.
	const readStream = ytdl(url, {
		requestOptions: { maxRetries: 0 },
		quality: "highestaudio",
	})
		.once("destroy", () => {
			console.log(
				"%cDestroy was called on readStream!",
				"color: blue; font-weight: bold; background-color: yellow; font-size: 0.8rem;"
			);

			electronPort.postMessage({
				isDownloading: false,
				status: "cancel",
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

			// to react:
			if (!interval) {
				// ^ Only in the firt time this 'on progress' fn is called!
				prettyTotal = prettyBytes(total);

				interval = setInterval(
					() => electronPort.postMessage({ percentage: percentageToSend }),
					2_000
				);
			}

			// to node console:
			if (isDevelopment) {
				readline.cursorTo(process.stdout, 0);
				process.stdout.write(
					`${percentage}% downloaded (${prettyBytes(
						downloaded
					)} of ${prettyTotal}). Running for: ${minutesDownloading} minutes. ETA: ${estimatedDownloadTime} minutes `
				);
			}
		})
		.once("end", async () => {
			console.log(
				`%cFile "${titleWithExtension}" saved successfully!`,
				"color: green; font-weight: bold;"
			);

			// to react:
			electronPort.postMessage({
				isDownloading: false,
				status: "success",
				saveSite,
			});
			electronPort.close();

			interval && clearInterval(interval);
		})
		.once("error", error => {
			console.error(`Error downloading file: "${titleWithExtension}"!`, error);

			// to react
			electronPort.postMessage({
				isDownloading: false,
				status: "fail",
				error,
			});

			electronPort.close();

			interval && clearInterval(interval);
		});

	fluent_ffmpeg(readStream).toFormat(extension).save(saveSite);

	currentDownloads.set(url, readStream);
}

function handleCreateOrCancelConvert(
	destroy: Readonly<boolean>,
	toExtension: Readonly<typeof allowedMedias[number]>,
	path: Readonly<Path>,
	electronPort: Readonly<MessagePort>
) {
	if (path && !mediasConverting.has(path))
		convertToAudio(path, toExtension, electronPort);
	else if (path && destroy) {
		const stream = mediasConverting.get(path);
		stream?.emit("destroy");
		const readAnswer = stream?.destroy(
			new Error("This readStream is being destroyed!")
		);

		console.log("readStream 'destroy()' answer =", readAnswer);

		console.log(
			`Was "${path}" deleted from map? `,
			mediasConverting.delete(path),
			"\nmediasConverting =",
			mediasConverting
		);
	}
}

function convertToAudio(
	mediaPath: Readonly<Path>,
	toExtension: Readonly<typeof allowedMedias[number]>,
	electronPort: Readonly<MessagePort>
) {
	const titleWithExtension = `${getBasename(mediaPath)}.${toExtension}`;
	const saveSite = `${dirs.music}/${titleWithExtension}`;
	const readStream = createReadStream(mediaPath);

	const msgToSend = { timeConverted: "", sizeConverted: 0 };
	let interval: NodeJS.Timer | undefined = undefined;

	fluent_ffmpeg(readStream)
		.toFormat(toExtension)
		.save(saveSite)
		.addOptions(["-threads", String(cpus().length)])
		.on("start", cmdLine =>
			console.log(`Started ffmpeg with command: "${cmdLine}"`)
		)
		.on("progress", p => {
			// targetSize: current size of the target file in kilobytes
			// timemark: the timestamp of the current frame in seconds
			msgToSend.sizeConverted = p.targetSize;
			msgToSend.timeConverted = p.timemark;

			// To react:
			if (!interval) {
				// ^ Only in the firt time this 'on progress' fn is called!
				interval = setInterval(
					() => electronPort.postMessage(msgToSend),
					2_000
				);
			}
		})
		.once("error", error => {
			console.error(`Error Converting file: "${titleWithExtension}"!`, error);

			// To react:
			electronPort.postMessage({
				isConverting: false,
				status: "fail",
				error,
			});

			electronPort.close();

			interval && clearInterval(interval);
		})
		.once("end", async () => {
			console.log(
				`%cFile "${titleWithExtension}" saved successfully!`,
				"color: green; font-weight: bold;"
			);

			// To react:
			electronPort.postMessage({
				isConverting: false,
				status: "success",
			});
			electronPort.close();

			interval && clearInterval(interval);

			////////////////////////////////////////
			console.log(
				"Deleting from map:",
				mediasConverting.delete(mediaPath),
				"\n\nconverting =",
				mediasConverting
			);
		})
		.once("destroy", () => {
			console.log(
				"%cDestroy was called on readStream for converter!",
				"color: blue; font-weight: bold; background-color: yellow; font-size: 0.8rem;"
			);

			electronPort.postMessage({
				isConverting: false,
				status: "cancel",
			});
			electronPort.close();

			interval && clearInterval(interval);
		});

	mediasConverting.set(mediaPath, readStream);
	console.log("Medias converting =", mediasConverting);
}

async function writeTags(pathOfMedia: Readonly<Path>, data: WriteTag) {
	const file = MediaFile.createFromPath(pathOfMedia);
	// console.log("File =", file);
	// console.log("File tags =", file.tag);

	if (data.imageURL) {
		// Get picture:
		try {
			console.log({ imageUrl: data.imageURL });
			const res = await axios.get(data.imageURL);

			const pictureByteVector = ByteVector.fromByteArray(Buffer.from(res.data));
			console.log("pictureByteVector =", pictureByteVector);
			file.tag.pictures.push(Picture.fromData(pictureByteVector));
		} catch (error) {
			console.error("There was an error getting the picture data.", error);
		}
	}

	Object.entries(data).forEach(([tag, value]) => {
		if (tag !== "imageURL") {
			// @ts-ignore: tag is one of WriteTag, wich is based on MediaFile.Tag
			file.tag[tag] = value;
			// @ts-ignore: tag is one of WriteTag, wich is based on MediaFile.Tag
			console.log(`file.tag[${tag}] = ${file.tag[tag]}`);
		}
	});

	file.save();
	file.dispose();
}

function watchForDirectories(dirs: readonly string[]) {
	const wildcardList = dirs
		.map(dir =>
			allowedMedias.map(extension => normalize(dir + "/**/*." + extension))
		)
		.flat();

	const watcher = watch(wildcardList, {
		awaitWriteFinish: { stabilityThreshold: 10_000, pollInterval: 10_000 },
		ignorePermissionErrors: true,
		followSymlinks: false,
		ignoreInitial: true,
		usePolling: false,
		alwaysStat: false,
		depth: 0,
	});

	const log = console.log.bind(console);
	// ^ Something to use when events are received.

	watcher
		.on("error", error =>
			console.error("%c[Chokidar]", logStyle, " Error happened", error)
		)
		.on("ready", () => {
			log(
				"%c[Chokidar]",
				logStyle,
				" Initial scan complete. Listening for changes."
			);

			console.log(
				"%c[Chokidar]",
				logStyle,
				" Files being watched:\n",
				watcher.getWatched()
			);
		})
		.on("unlink", path => {
			log(`%c[Chokidar] File "${path}" has been removed.`, logStyle);
			window.twoWayComm_React_Electron?.postMessage({
				msg: "remove media",
				path,
			});
		})
		.on("add", path => {
			log(`%c[Chokidar] File "${path}" has been added.`, logStyle);
			window.twoWayComm_React_Electron?.postMessage({ msg: "add media", path });
		});
}

const logStyle =
	"background-color: green; font-size: 0.8rem; font-weight: bold; color: white;";
