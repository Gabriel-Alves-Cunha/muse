/* eslint-disable @typescript-eslint/no-non-null-assertion */

import type { ImgString, WriteTag } from "@common/@types/electron-window.d";
import type { Media, Path } from "@common/@types/typesAndEnums";

import { path as _ffmpeg_path_ } from "@ffmpeg-installer/ffmpeg";
import ytdl, { type videoInfo } from "ytdl-core";
import { join, dirname } from "@tauri-apps/api/path";
import { fetch } from "@tauri-apps/api/http";
import {
	type FileEntry,
	removeFile,
	renameFile,
	readDir,
} from "@tauri-apps/api/fs";
import {
	type IPicture,
	File as MediaFile,
	PictureType,
	ByteVector,
	StringType,
	Picture,
} from "node-taglib-sharp";
import fluent_ffmpeg from "fluent-ffmpeg";
import sanitize from "sanitize-filename";

import { string2number } from "@common/hash";
import { dirs, remove } from "./utils.js";
import { prettyBytes } from "@common/prettyBytes";
import { dbg } from "@common/utils";
import {
	type AllowedMedias,
	getLastExtension,
	formatDuration,
	getBasename,
} from "@common/utils";
import {
	ListenToNotification,
	ProgressStatus,
} from "@common/@types/typesAndEnums";

const ffmpegPath = _ffmpeg_path_.replace("app.asar", "app.asar.unpacked");
fluent_ffmpeg.setFfmpegPath(ffmpegPath);

// Expose protected methods that allow the renderer process to use
// notificationApi: {
// 	sendNotificationToElectron,
// 	receiveMsgFromElectron,
// },
// fs: {
// 	getFullPathOfFilesForFilesInThisDirectory,
// 	readFile,
// 	readdir,
// 	rm,
// },
// os: {
// 	homeDir,
// 	dirs,
// },
// media: {
// 	transformPathsToMedias,
// 	convertToAudio,
// 	writeTags,
// 	getInfo,
// }

export async function getFullPathOfFilesForFilesInThisDirectory(
	dir: Readonly<Path>,
): Promise<readonly string[]> {
	console.time("getFullPathOfFilesForFilesInThisDirectory");
	const dirs = await readdir(dir);
	const promises = dirs.map(async ({ path }) => await join(dir, path));
	const fullPaths = await Promise.all(promises);
	console.timeEnd("getFullPathOfFilesForFilesInThisDirectory");

	console.log({ fullPaths });

	return fullPaths;
}

export async function readFile(
	path: Readonly<Path>,
): Promise<Readonly<Buffer>> {
	return await readFile(path);
}

export async function readdir(dir: Readonly<Path>): Promise<FileEntry[]> {
	return await readDir(dir);
}

export async function rm(path: Readonly<Path>): Promise<void> {
	await removeFile(path);
}

export async function getVideoInfo(url: string): Promise<videoInfo> {
	return (await fetch<videoInfo>(url)).data;
}

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
				data: DownloadProps & { destroy: boolean };
			}) => handleCreateOrCancelDownload({ ...data, electronPort });

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
			console.log("Electron received 'async two way comm':", event);

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

const currentDownloads: string[] = [];
const mediasConverting: string[] = [];

// function sendNotificationToElectron(
// 	object: Readonly<{
// 		type: NotificationEnum;
// 		msg?: string;
// 	}>,
// ): void {
// 	ipcRenderer.send("notify", object);
// }

// export function receiveMsgFromElectron(
// 	handleMsg: (msgObject: MsgObject) => void,
// ): void {
// 	ipcRenderer.on("async-msg", (_, msgObject: MsgObject) =>
// 		handleMsg(msgObject),
// 	);
// }

export async function transformPathsToMedias(
	paths: readonly Path[],
	assureMediaSizeIsGreaterThan60KB = true,
	ignoreMediaWithLessThan60Seconds = true,
): Promise<readonly Media[]> {
	const createMedia = async (
		path: Path,
		index: number,
	): Promise<Media | undefined> => {
		const basename = getBasename(path);

		try {
			console.time(`Nº ${index}, "${basename}" took`);
			const {
				fileAbstraction: {
					readStream: { length: sizeInBytes },
				},
				tag: { pictures, title, album, genres, albumArtists },
				properties: { durationMilliseconds },
			} = MediaFile.createFromPath(path);

			const duration = durationMilliseconds / 1_000;

			if (ignoreMediaWithLessThan60Seconds && duration < 60) {
				console.log(
					`Skipping "${path}" because time is ${duration} seconds (< 60 seconds)!`,
				);
				return undefined;
			}

			if (assureMediaSizeIsGreaterThan60KB && sizeInBytes < 60_000) {
				console.log(
					`Skipping "${path}" because size is ${sizeInBytes} bytes! (< 60_000 bytes)`,
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
				size: prettyBytes(sizeInBytes),
				artist: albumArtists[0] ?? "",
				dateOfArival: Date.now(),
				title: title ?? basename,
				id: string2number(path),
				genres,
				album,
				index,
				path,
				img,
			};

			dbg(title, {
				tag: { pictures, album, genres, albumArtists },
				properties: { durationMilliseconds },
			});
			// dbg("%cmedia =", "background-color: #f9ca4c80;", media);
			return media;
		} catch (error) {
			console.error(error);
			return undefined;
		} finally {
			console.timeEnd(`Nº ${index}, "${basename}" took`);
		}
	};

	const medias: Array<Media | undefined> = [];
	console.time("Runnig 'for' on all medias");
	for (const [index, path] of paths.entries())
		medias.push(await createMedia(path, index));

	console.timeEnd("Runnig 'for' on all medias");

	return medias.filter(Boolean) as Media[];
}

const addListeners = (port: MessagePort): Readonly<MessagePort> => {
	port.onmessage = async event => {
		const { data } = event;

		console.log("At addListeners on file 'preload.ts', line 330:", data);

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

type DownloadProps = Readonly<{
	electronPort: Readonly<MessagePort>;
	imageURL: Readonly<string>;
	title: Readonly<string>;
	url: Readonly<string>;
}>;

export function handleCreateOrCancelDownload(
	downloadProps: DownloadProps & { destroy: boolean },
) {
	if (downloadProps.url && !currentDownloads.includes(downloadProps.url))
		makeStream(downloadProps);
	else if (downloadProps.url && downloadProps.destroy) {
		// const stream = get(currentDownloads, downloadProps.url);
		// TODO
	}
}

export function makeStream({
	electronPort,
	imageURL,
	title,
	url,
}: DownloadProps) {
	const extension: AllowedMedias = "mp3";
	const titleWithExtension = `${title}.${extension}`;
	const saveSite = `${dirs.music}/${sanitize(titleWithExtension)}`;
	// const startTime = Date.now();

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

			const readAnswer = readStream.destroy(
				new Error("This readStream is being destroyed!"),
			);
			dbg("readStream 'destroy()' answer =", readAnswer);

			remove(currentDownloads, url);
			dbg(
				`Was "${url}" deleted from map?\ncurrentDownloads =`,
				currentDownloads,
			);
		})
		.on("progress", (_, downloaded, total) => {
			// const minutesDownloading = ((Date.now() - startTime) / 6e4).toFixed(2);
			const percentage = ((downloaded / total) * 100).toFixed(2);
			percentageToSend = percentage;
			// const estimatedDownloadTime = (
			// 	+minutesDownloading / (+percentage / 100) -
			// 	+minutesDownloading
			// ).toFixed(2);

			// To react:
			if (!interval) {
				// ^ Only in the firt time this 'on progress' fn is called!

				interval = setInterval(
					() => electronPort.postMessage({ percentage: percentageToSend }),
					2_000,
				);
			}

			// // To node console if is in development:
			// if (isDevelopment) {
			// 	readline.cursorTo(process.stdout, 0);
			// 	process.stdout.write(
			// 		`${percentage}% downloaded, (${prettyBytes(downloaded)}/${prettyBytes(
			// 			total,
			// 		)}). Running for: ${minutesDownloading} minutes. ETA: ${estimatedDownloadTime} minutes.`,
			// 	);
			// }
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
				console.log("Going to writeTags");
				await writeTags(saveSite, { imageURL, isNewMedia: true });
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

	fluent_ffmpeg(readStream).toFormat(extension).saveToFile(saveSite);

	currentDownloads.push(url);
	dbg(`Added "${url}" to currentDownloads =`, currentDownloads);
}

export function handleCreateOrCancelConvert(
	destroy: Readonly<boolean>,
	toExtension: AllowedMedias,
	path: Readonly<Path>,
	electronPort: Readonly<MessagePort>,
) {
	if (path && !mediasConverting.includes(path))
		convertToAudio(path, toExtension, electronPort);
	else if (path && destroy) {
		// const stream = get(mediasConverting, path);
		// TODO
	}
}

export function convertToAudio(
	mediaPath: Readonly<Path>,
	toExtension: AllowedMedias,
	electronPort: Readonly<MessagePort>,
) {
	const titleWithExtension = `${getBasename(mediaPath)}.${toExtension}`;
	const saveSite = `${dirs.music}/${sanitize(titleWithExtension)}`;
	// const readStream = ;

	let interval: NodeJS.Timer | undefined = undefined;
	let timeConverted = "";
	let sizeConverted: 0;

	fluent_ffmpeg()
		.toFormat(toExtension)
		.save(saveSite)
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

			// const readAnswer = readStream.destroy(
			// 	new Error("This readStream is being destroyed!"),
			// );

			// dbg("readStream 'destroy()' answer =", readAnswer);

			remove(mediasConverting, mediaPath);
			dbg(
				`Was "${mediaPath}" deleted from map?\nmediasConverting =`,
				mediasConverting,
			);
		})
		.saveToFile(mediaPath);

	mediasConverting.push(mediaPath);
	dbg(`Added '${mediaPath}' to mediasConverting =`, mediasConverting);
}

export async function writeTags(
	mediaPath: Readonly<Path>,
	data: Readonly<WriteTag & { isNewMedia?: boolean }>,
) {
	const file = MediaFile.createFromPath(mediaPath);
	// dbg("File =", file);
	// dbg("File tags =", file.tag);
	dbg({ data });

	let fileNewPath = "";

	try {
		Object.entries(data).forEach(async ([tag, value]) => {
			switch (tag) {
				case "imageURL": {
					if (data.imageURL === "erase img") {
						// if imageURL === 'erase img' => erase img so we don't keep
						// getting an error on the browser.
						file.tag.pictures = [];
						console.warn(
							"(SHOULD BE EMPTY) file.tag.pictures =",
							file.tag.pictures,
						);
					} else {
						dbg("Downloading picture");
						try {
							const imgAsString = (await fetch<ImgString>(data.imageURL!)).data;

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
							picture.description =
								"This image was download when this media downloaded.";
							picture.filename = `${getBasename(mediaPath)}`;
							picture.type = PictureType.Media;
							picture.mimeType = mimeType;

							file.tag.pictures = [picture];

							console.log({ fileTagPictures: file.tag.pictures, picture });
						} catch (error) {
							console.error(
								"There was an error getting the picture data.",
								error,
							);
						}
					}

					break;
				}

				case "albumArtists": {
					dbg("On 'albumArtists' branch.");
					console.assert(typeof value === "string");

					const artists = (value as string).split(",");
					file.tag.albumArtists = artists;

					console.log(
						`file.tag.albumArtists = ${file.tag.albumArtists}\nartists = ${artists}`,
					);

					break;
				}

				case "title": {
					const oldPath = mediaPath;
					const newPath = `${await dirname(oldPath)}/${sanitize(
						`${value}.${getLastExtension(oldPath)}`,
					)}`;

					file.tag.title = value as string;

					console.log({ oldPath, newPath });

					if (getBasename(oldPath) === value) break;
					fileNewPath = newPath;

					try {
						dbg("Renaming file...");
						await renameFile(oldPath, newPath);
					} catch (error) {
						console.error(error);
					}

					break;
				}

				case "isNewMedia":
					break;

				default: {
					// @ts-ignore: tag is one of WriteTag, wich is based on MediaFile.Tag, so it's fine.
					file.tag[tag] = value;
					// @ts-ignore: tag is one of WriteTag, wich is based on MediaFile.Tag, so it's fine.
					console.log(`file.tag[${tag}] =`, file.tag[tag]);

					break;
				}
			}
		});

		dbg("File tags =", file.tag);

		file.save();
		file.dispose();
	} catch (error) {
		console.error(error);
	} finally {
		if (fileNewPath) {
			// Since media has a new path, create a new media
			console.log("Adding new media:", {
				msg: "ListenToNotification.ADD_MEDIA",
				path: fileNewPath,
			});
			window.twoWayComm_React_Electron?.postMessage({
				msg: ListenToNotification.ADD_ONE_MEDIA,
				path: fileNewPath,
			});

			// and remove old one
			console.log("Removing old media:", {
				msg: "ListenToNotification.REMOVE_MEDIA",
				path: mediaPath,
			});
			window.twoWayComm_React_Electron?.postMessage({
				msg: ListenToNotification.REMOVE_ONE_MEDIA,
				path: mediaPath,
			});
		} else if (data.isNewMedia) {
			// Add media
			window.twoWayComm_React_Electron?.postMessage({
				msg: ListenToNotification.ADD_ONE_MEDIA,
				path: mediaPath,
			});
		} else {
			// refresh media
			console.log("Refreshing media:", {
				msg: "ListenToNotification.REFRESH_MEDIA",
				path: mediaPath,
				fileNewPath,
			});
			window.twoWayComm_React_Electron?.postMessage({
				msg: ListenToNotification.REFRESH_ONE_MEDIA,
				path: mediaPath,
			});
		}
	}
}
