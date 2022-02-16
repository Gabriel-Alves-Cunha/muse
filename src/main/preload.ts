import type { MsgObject, WriteTag } from "@common/@types/electron-window.d";
import type { AllowedMedias } from "@common/utils";
import type { Media, Path } from "@common/@types/typesAndEnums";
import type { videoInfo } from "ytdl-core";
import type { IPicture } from "node-taglib-sharp";
import type { Stream } from "./utils.js";

import { readdir, readFile, stat, unlink, rename } from "fs/promises";
import { contextBridge, ipcRenderer } from "electron";
import { path as _ffmpeg_path_ } from "@ffmpeg-installer/ffmpeg";
import { createReadStream } from "fs";
import { string2number } from "@main/hash";
import { join, dirname } from "path";
import { cpus } from "os";
import {
	File as MediaFile,
	PictureType,
	ByteVector,
	StringType,
	Picture,
} from "node-taglib-sharp";
import {
	ListenToNotification,
	NotificationType,
	ProgressStatus,
} from "@common/@types/typesAndEnums";
import fluent_ffmpeg from "fluent-ffmpeg";
import readline from "readline";
import ytdl from "ytdl-core";

import { homeDir, dirs, get, has, push, remove } from "./utils.js";
import { prettyBytes } from "@common/prettyBytes";
import { dbg } from "@common/utils";
import {
	formatDuration,
	isDevelopment,
	getExtension,
	getBasename,
} from "@common/utils";

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
		getFullPathOfFilesForFilesInThisDirectory: async function (dir: Path) {
			return (await readdir(dir)).map(filename => join(dir, filename));
		},
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

			console.log({ event }, "\n\n\n", { details, data });

			await writeTags(details.mediaPath, data);

			break;
		}

		case "async two way comm": {
			console.log("Window received 'async two way comm':", event);

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
	async function createMedia(
		path: string,
		index: number,
	): Promise<Media | undefined> {
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
				id: string2number(path),
				genres,
				album,
				index,
				path,
				img,
			};

			// dbg({
			// 	tag: { pictures, title, album, genres, albumArtists },
			// 	properties: { durationMilliseconds },
			// });
			dbg("%cmedia =", "background-color: #f9ca4c80;", media);
			return media;
		} catch (error) {
			console.error(error);
			return undefined;
		} finally {
			console.timeEnd(`for (const [${index}, "${path}"])`);
		}
	}

	console.time("Creating promises");
	const promises = paths.map((path, index) => createMedia(path, index));
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
	port.onmessage = async event => {
		const { data } = event;

		console.log("At addListeners on file 'preload.ts', line 309:", data);

		switch (data.type) {
			case "write tag": {
				// details: [mediaPath, whatToChange.whatToChange, value.trim()],
				const [mediaPath, whatToChange, value] = data.details;

				try {
					console.assert(mediaPath, whatToChange, value);

					await writeTags(mediaPath, { [whatToChange]: value });
				} catch (error) {
					console.error(error);
				}
				break;
			}

			default: {
				console.log(
					"Message received on electron side of 2way-comm, but there is no function to handle it:",
					data,
				);
				break;
			}
		}
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
		const stream = get(currentDownloads, url)?.stream;

		if (stream) {
			stream.emit("destroy");
			const readAnswer = stream.destroy(
				new Error("This readStream is being destroyed!"),
			);

			dbg("readStream 'destroy()' answer =", readAnswer);

			remove(currentDownloads, url);
			dbg(
				`Was "${url}" deleted from map?\ncurrentDownloads =`,
				currentDownloads,
			);
		} else
			console.error(
				`There is no stream on 'currentDownloads' with url: '${url}'`,
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
		const stream = get(mediasConverting, path)?.stream;

		if (stream) {
			stream.emit("destroy");
			const readAnswer = stream.destroy(
				new Error("This readStream is being destroyed!"),
			);

			dbg("readStream 'destroy()' answer =", readAnswer);

			remove(mediasConverting, path);
			dbg(
				`Was "${path}" deleted from map?\nmediasConverting =`,
				mediasConverting,
			);
		} else
			console.error(
				`There is no stream on 'mediasConverting' with path: '${path}'.`,
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
			remove(mediasConverting, mediaPath);
			dbg("Deleting from mediasConverting.\nconverting =", mediasConverting);
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
	dbg(`Added '${mediaPath}' to mediasConverting =`, mediasConverting);
}

export async function writeTags(mediaPath: Readonly<Path>, data: WriteTag) {
	const file = MediaFile.createFromPath(mediaPath);
	// dbg("File =", file);
	// dbg("File tags =", file.tag);

	if (data.imageURL) {
		// if imageURL === '0' => erase img so we don't keep
		// getting an error on the browser.
		if (data.imageURL === "0") {
			file.tag.pictures = [];
			console.log("(SHOULD BE EMPTY) file.tag.pictures =", file.tag.pictures);
		} else {
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

				picture.type = PictureType.Media;
				file.tag.pictures = [picture];
				picture.mimeType = mimeType;
			} catch (error) {
				console.error("There was an error getting the picture data.", error);
			}
		}
	}

	let fileNewPath = "";
	Object.entries(data).forEach(([tag, value]) => {
		try {
			if (tag !== "imageURL") {
				if (tag === "albumArtists") {
					dbg("On 'albumArtists' branch.");
					console.assert(typeof value === "string");
					const artists = (value as string).split(",");
					file.tag.albumArtists = artists;

					console.log(
						`file.tag.albumArtists = ${file.tag.albumArtists}\nartists = ${artists}`,
					);
				} else if (tag === "title") {
					const oldPath = mediaPath;
					const newPath = `${dirname(oldPath)}/${value}.${getExtension(
						oldPath,
					)}`;

					file.tag.title = value as string;

					console.log({ oldPath, newPath });

					if (getBasename(oldPath) === value) return;
					fileNewPath = newPath;
					(async (oldPath: string, newPath: string) => {
						try {
							await rename(oldPath, newPath);
						} catch (error) {
							console.error(error);
						}
					})(oldPath, newPath);
				} else {
					// @ts-ignore: tag is one of WriteTag, wich is based on MediaFile.Tag, so it's fine.
					file.tag[tag] = value;
					// @ts-ignore: tag is one of WriteTag, wich is based on MediaFile.Tag, so it's fine.
					console.log(`file.tag[${tag}] =`, file.tag[tag]);
				}
			}
		} catch (error) {
			console.error(error);
		}
	});

	file.save();

	dbg("File tags =", file.tag);

	file.dispose();

	if (fileNewPath) {
		// Since media has a new path, create a new media
		console.log("Adding new media:", {
			msg: ListenToNotification.ADD_MEDIA,
			path: fileNewPath,
		});
		window.twoWayComm_React_Electron?.postMessage({
			msg: ListenToNotification.ADD_MEDIA,
			path: fileNewPath,
		});

		// and remove old one
		console.log("Removing old media:", {
			msg: ListenToNotification.REMOVE_MEDIA,
			path: mediaPath,
		});
		window.twoWayComm_React_Electron?.postMessage({
			msg: ListenToNotification.REMOVE_MEDIA,
			path: mediaPath,
		});
	} else {
		// refresh media
		console.log("Refreshing media:", {
			msg: ListenToNotification.REFRESH_MEDIA,
			path: mediaPath,
		});
		window.twoWayComm_React_Electron?.postMessage({
			msg: ListenToNotification.REFRESH_MEDIA,
			path: mediaPath,
		});
	}
}
