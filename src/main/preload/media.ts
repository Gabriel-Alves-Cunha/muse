/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable prefer-rest-params */

import type { ImgString, WriteTag } from "@common/@types/electron-window";
import type { AllowedMedias } from "@common/utils";
import type { Media, Path } from "@common/@types/typesAndEnums";
import type { IPicture } from "node-taglib-sharp";
import type { Readable } from "node:stream";

import { rename as renameFile, access } from "node:fs/promises";
import { path as _ffmpeg_path_ } from "@ffmpeg-installer/ffmpeg";
import { createReadStream } from "node:fs";
import { dirname, join } from "node:path";
import { get } from "node:https";
import {
	File as MediaFile,
	PictureType,
	ByteVector,
	StringType,
	Picture,
} from "node-taglib-sharp";
import fluent_ffmpeg from "fluent-ffmpeg";
import sanitize from "sanitize-filename";
import readline from "readline";
import ytdl from "ytdl-core";

import { getLastExtension, formatDuration, getBasename } from "@common/utils";
import { ElectronToReactMessageEnum } from "@common/@types/electron-window";
import { dbg, isDevelopment } from "@common/utils";
import { sendMsgToClient } from "@common/crossCommunication";
import { ProgressStatus } from "@common/@types/typesAndEnums";
import { prettyBytes } from "@common/prettyBytes";
import { deleteFile } from "./file";
import { hash } from "@common/hash";
import { dirs } from "../utils";

const { log, error } = console;

const ffmpegPath = _ffmpeg_path_.replace("app.asar", "app.asar.unpacked");
fluent_ffmpeg.setFfmpegPath(ffmpegPath);

const currentDownloads: Map<string, Readable> = new Map();
const mediasConverting: Map<Path, Readable> = new Map();

const pathExists = async (path: Path): Promise<boolean> =>
	access(path)
		.then(() => true)
		.catch(() => false);

const createMedia = async (
	path: Path,
	assureMediaSizeIsGreaterThan60KB: boolean,
	ignoreMediaWithLessThan60Seconds: boolean
): Promise<Media> =>
	new Promise((resolve, reject) => {
		const start = performance.now();

		const {
			fileAbstraction: {
				readStream: { length },
			},
			tag: { pictures, title, album, genres, albumArtists },
			properties: { durationMilliseconds },
		} = MediaFile.createFromPath(path);

		const duration = durationMilliseconds / 1_000;
		const basename = getBasename(path);

		if (ignoreMediaWithLessThan60Seconds && duration < 60) {
			log(
				`Skipping "${path}" because the duration is ${duration.toPrecision(
					3
				)} s (less than 60 s)!`
			);
			const end = performance.now();
			log(`%c"${basename}" took: ${end - start} ms.`, "color:brown");
			return reject();
		}

		const size = prettyBytes(length);

		if (assureMediaSizeIsGreaterThan60KB && length < 60_000) {
			log(`Skipping "${path}" because size is ${size} bytes! (< 60 KB)`);
			const end = performance.now();
			log(`%c"${basename}" took: ${end - start} ms.`, "color:brown");
			return reject();
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
					: picture.data.toString();
			img = `data:${mimeType};base64,${str}`;
		}

		const media: Media = Object.freeze({
			duration: formatDuration(duration),
			artist: albumArtists[0] ?? "",
			dateOfArival: Date.now(),
			title: title ?? basename,
			selected: false,
			favorite: false,
			id: hash(path),
			genres,
			album,
			size,
			path,
			img,
		});

		dbg(basename, {
			tag: { pictures, album, genres, albumArtists },
			properties: { durationMilliseconds },
		});

		const end = performance.now();
		log(`%c"${basename}" took: ${end - start} ms.`, "color:brown");

		return resolve(media);
	});

export async function transformPathsToMedias(
	paths: readonly Path[],
	assureMediaSizeIsGreaterThan60KB = true,
	ignoreMediaWithLessThan60Seconds = true
): Promise<readonly Media[]> {
	const start = performance.now();

	const medias: Media[] = [];

	console.groupCollapsed("Creating medias...");
	const promises = paths.map(path =>
		createMedia(
			path,
			assureMediaSizeIsGreaterThan60KB,
			ignoreMediaWithLessThan60Seconds
		)
	);

	(await Promise.allSettled(promises)).forEach(p => {
		if (p.status === "fulfilled") medias.push(p.value);
	});
	console.groupEnd();

	const end = performance.now();
	log(`%cReading all medias took: ${end - start} ms.`, "color:brown");

	return medias;
}

export async function handleCreateOrCancelDownload({
	electronPort,
	extension,
	imageURL,
	destroy,
	title,
	url,
}: HandleDownload) {
	if (!url) return error("Missing required param 'url'!", arguments);

	if (!currentDownloads.has(url)) {
		if (!electronPort || !imageURL || !title || !url || !extension)
			return error("Missing required params!", arguments);

		await makeStream({ imageURL, url, title, electronPort, extension });
	} else if (destroy) currentDownloads.get(url)!.emit("destroy");
}

export async function makeStream({
	electronPort,
	extension,
	imageURL,
	title,
	url,
}: Required<Omit<HandleDownload, "destroy">>) {
	const titleWithExtension = sanitize(`${title}.${extension}`);
	const saveSite = join(dirs.music, titleWithExtension);

	// Assert file doesn't already exists:
	{
		if (await pathExists(saveSite))
			return error(`File "${saveSite}" already exists!`);
	}

	const startTime = Date.now();
	let interval: NodeJS.Timer | undefined = undefined;
	let prettyTotal = "";

	dbg(`Creating stream for "${title}" to download.`);

	// ytdl will 'end' the stream for me.
	const readStream = ytdl(url, {
		requestOptions: { maxRetries: 0 },
		quality: "highestaudio",
	})
		.on("progress", (_, downloaded, total) => {
			const percentage = (downloaded / total) * 100;
			const percentageStr = percentage.toFixed(2);

			// To react:
			if (!interval) {
				// ^ Only in the firt time this 'on progress' fn is called!
				interval = setInterval(
					() => electronPort.postMessage({ percentage: percentageStr }),
					2_000
				);
				prettyTotal = prettyBytes(total);
			}

			// To node console if is in development:
			if (isDevelopment) {
				const minutesDownloading = (Date.now() - startTime) / 6e4;
				const estimatedDownloadTime = (
					minutesDownloading / (percentage / 100) -
					minutesDownloading
				).toFixed(2);

				readline.cursorTo(process.stdout, 0);
				readline.clearLine(process.stdout, 0);
				process.stdout.write(
					`${percentageStr}% downloaded, (${prettyBytes(
						downloaded
					)}/${prettyTotal}). Running for: ${minutesDownloading.toFixed(
						2
					)} minutes. ETA: ${estimatedDownloadTime} minutes.`
				);
			}
		})
		.on("destroy", async () => {
			log(
				"%cDestroy was called on readStream!",
				"color: blue; font-weight: bold; background: yellow; font-size: 0.8rem;"
			);

			// Delete the file if it's not converted successfully:
			if (await pathExists(saveSite)) await deleteFile(saveSite);

			electronPort.postMessage({
				status: ProgressStatus.CANCEL,
				isDownloading: false,
			});
			electronPort.close();
			clearInterval(interval!);

			currentDownloads.delete(url);
			dbg(
				"Download was destroyed. Deleting stream from currentDownloads:",
				currentDownloads,
				"Does the downloaded file still exists?",
				await pathExists(saveSite)
			);
		})
		.on("end", async () => {
			log(
				`%cFile "${titleWithExtension}" saved successfully!`,
				"color: green; font-weight: bold;"
			);

			// To react:
			electronPort.postMessage({
				status: ProgressStatus.SUCCESS,
				isDownloading: false,
			});
			electronPort.close();
			clearInterval(interval!);

			// Write media image:
			await writeTags(saveSite, {
				downloadImg: true,
				isNewMedia: true,
				imageURL,
			});

			currentDownloads.delete(url);
			dbg(
				"Download ended. Deleting stream from currentDownloads:",
				currentDownloads
			);
		})
		.on("error", async err => {
			error(`Error downloading file: "${titleWithExtension}"!`, err);

			// Delete the file if it's not converted successfully:
			if (await pathExists(saveSite)) await deleteFile(saveSite);

			// To react
			electronPort.postMessage({
				status: ProgressStatus.FAIL,
				isDownloading: false,
				error: err,
			});
			electronPort.close();
			clearInterval(interval!);

			// I only found it to work when I send it with an Error:
			readStream.destroy(err);

			currentDownloads.delete(url);
			dbg(
				"Download threw an error. Deleting stream from currentDownloads:",
				currentDownloads,
				"Does the downloaded file still exists?",
				await pathExists(saveSite)
			);
		});

	fluent_ffmpeg(readStream).toFormat(extension).saveToFile(saveSite);

	currentDownloads.set(url, readStream);
	dbg(`Added "${url}" to currentDownloads =`, currentDownloads);
}

export async function handleCreateOrCancelConvert({
	electronPort,
	toExtension,
	destroy,
	path,
}: HandleConversion) {
	if (!path) return error("Missing required param 'path'!", arguments);

	if (!mediasConverting.has(path)) {
		if (!toExtension || !electronPort)
			return error("Missing required params!", arguments);

		await convertToAudio({ path, toExtension, electronPort });
	} else if (destroy) mediasConverting.get(path)!.emit("destroy");
}

export async function convertToAudio({
	electronPort,
	toExtension,
	path,
}: Required<Omit<HandleConversion, "destroy">>) {
	const titleWithExtension = sanitize(`${getBasename(path)}.${toExtension}`);

	{
		// Assert files don't have the same extension
		const pathWithNewExtension = join(dirname(path), titleWithExtension);

		// && that there already doesn't exists one:
		if (path.endsWith(toExtension) || (await pathExists(pathWithNewExtension)))
			return error(`File "${path}" already is "${toExtension}"!`);
	}

	const saveSite = join(dirs.music, titleWithExtension);
	const readStream = createReadStream(path);
	let interval: NodeJS.Timer | undefined = undefined;

	dbg(`Creating stream for "${path}" to convert to "${toExtension}".`);

	fluent_ffmpeg(readStream)
		.on(
			"progress",
			({ targetSize, timemark }: { targetSize: number; timemark: number }) => {
				// targetSize: current size of the target file in kilobytes
				// timemark: the timestamp of the current frame in seconds

				// To react:
				if (!interval)
					// ^ Only in the firt time this setInterval is called!
					interval = setInterval(
						() =>
							electronPort.postMessage({
								sizeConverted: targetSize,
								timeConverted: timemark,
							}),
						2_000
					);
			}
		)
		.on("error", async err => {
			error(`Error converting file: "${titleWithExtension}"!\n\n`, err);

			// Delete the file if it's not converted successfully:
			if (await pathExists(saveSite)) await deleteFile(saveSite);

			// To react:
			electronPort.postMessage({
				status: ProgressStatus.FAIL,
				isConverting: false,
				error: err,
			});
			electronPort.close();
			clearInterval(interval!);

			// I only found it to work when I send it with an Error:
			readStream.destroy(err);

			mediasConverting.delete(path);
			dbg(
				"Convertion threw an error. Deleting from mediasConverting:",
				mediasConverting,
				"Was file deleted?",
				await pathExists(saveSite)
			);
		})
		.on("end", async () => {
			log(
				`%cFile "${titleWithExtension}" saved successfully!`,
				"color: green; font-weight: bold;"
			);

			// To react:
			electronPort.postMessage({
				status: ProgressStatus.SUCCESS,
				isConverting: false,
			});
			electronPort.close();
			clearInterval(interval!);

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
				mediasConverting
			);
		})
		.on("destroy", async () => {
			log(
				"%cDestroy was called on readStream for converter!",
				"color: blue; font-weight: bold; background-color: yellow; font-size: 0.8rem;"
			);

			// Delete the file if it's not converted successfully:
			if (await pathExists(saveSite)) await deleteFile(saveSite);

			electronPort.postMessage({
				status: ProgressStatus.CANCEL,
				isConverting: false,
			});
			electronPort.close();
			clearInterval(interval!);

			// I only found it to work when I send it with an Error:
			readStream.destroy(
				new Error(
					"This readStream is being destroyed because the ffmpeg is being destroyed."
				)
			);

			mediasConverting.delete(path);
			dbg(
				"Convertion was destroyed. Deleting from mediasConverting:",
				mediasConverting,
				"Was file deleted?",
				await pathExists(saveSite)
			);
		})
		.save(saveSite);

	mediasConverting.set(path, readStream);
	dbg(`Added "${path}" to mediasConverting:`, mediasConverting);
}

export async function writeTags(
	mediaPath: Readonly<Path>,
	data: Readonly<WriteTag & { isNewMedia?: boolean; downloadImg?: boolean }>
): Promise<void> {
	const file = MediaFile.createFromPath(mediaPath);
	let fileNewPath = "";

	dbg({ data });

	try {
		Object.entries(data).forEach(async ([tag, value]) => {
			switch (tag) {
				case "imageURL": {
					if (data.imageURL === "erase img") {
						dbg("Erasing picture...");
						// if imageURL === 'erase img' => erase img so we don't keep
						// getting an error on the browser.
						file.tag.pictures = [];
					} else if (data.downloadImg) {
						dbg("Downloading picture...");

						try {
							const imgAsString: ImgString = await getThumbnail(
								data.imageURL as string
							);

							createImage(imgAsString, file);
						} catch (err) {
							error("There was an error getting the picture data.", err);
						}
					} else {
						// Here, assume we received an img as a base64 string
						// like: `data:${string};base64,${string}`.
						if (
							data.imageURL!.includes("data:image/", 0) &&
							data.imageURL!.includes("base64,")
						)
							createImage(data.imageURL as ImgString, file);
						else error(`Invalid imgAsString = "${data.imageURL}"!`);
					}
					break;
				}

				case "albumArtists": {
					dbg("On 'albumArtists' branch.", { value });

					if (Array.isArray(value)) {
						const albumArtists = value as string[];

						file.tag.albumArtists = albumArtists;

						log(`file.tag.albumArtists = "${file.tag.albumArtists}";`, {
							albumArtists,
						});
					} else {
						const albumArtists = (value as string)
							.split(",")
							.map(v => v.trim());

						file.tag.albumArtists = albumArtists;

						log(`file.tag.albumArtists = "${file.tag.albumArtists}";`, {
							albumArtists,
						});
					}
					break;
				}

				case "title": {
					const sanitizedTitle = sanitize(value as string);

					const oldPath = mediaPath;
					const newPath = join(
						dirname(oldPath),
						sanitizedTitle + "." + getLastExtension(oldPath)
					);

					file.tag.title = sanitizedTitle;

					log({ "file.tag.title": file.tag.title, value });

					if (getBasename(oldPath) === sanitizedTitle) break;

					log({ oldPath, newPath });

					fileNewPath = newPath;
					break;
				}

				case "downloadImg":
					break;

				case "isNewMedia":
					break;

				default: {
					// @ts-ignore: tag is one of WriteTag, wich is based on MediaFile.Tag, so it's fine.
					file.tag[tag] = value;
					// @ts-ignore: tag is one of WriteTag, wich is based on MediaFile.Tag, so it's fine.
					log(`On default case: file.tag[${tag}] =`, file.tag[tag]);

					break;
				}
			}
		});

		file.save();
		dbg("File tags =", file.tag);
		file.dispose();
	} catch (error) {
		// Send error to client:
		sendMsgToClient({
			type: ElectronToReactMessageEnum.ERROR,
			error: error as Error,
		});

		throw error;
	} finally {
		if (fileNewPath) {
			try {
				await renameFile(mediaPath, fileNewPath);

				// Since media has a new path, create a new media...
				sendMsgToClient({
					type: ElectronToReactMessageEnum.ADD_ONE_MEDIA,
					mediaPath: fileNewPath,
				});

				// and remove old one
				sendMsgToClient({
					type: ElectronToReactMessageEnum.REMOVE_ONE_MEDIA,
					mediaPath,
				});
			} catch (error) {
				// Send error to react process: (error renaming file => file has old path)
				sendMsgToClient({
					type: ElectronToReactMessageEnum.ERROR,
					error: error as Error,
				});

				// Since there was an error, let's at least refresh media:
				sendMsgToClient({
					type: ElectronToReactMessageEnum.REFRESH_ONE_MEDIA,
					mediaPath,
				});
			} finally {
				log("Was file renamed?", await pathExists(fileNewPath));
				log("Does old file remains?", await pathExists(mediaPath));
			}
		} else if (data.isNewMedia) {
			// Add the new media:
			sendMsgToClient({
				type: ElectronToReactMessageEnum.ADD_ONE_MEDIA,
				mediaPath,
			});
		} else {
			// If everything else fails, refresh media:
			sendMsgToClient({
				type: ElectronToReactMessageEnum.REFRESH_ONE_MEDIA,
				mediaPath,
			});
		}
	}
}

function createImage(imgAsString: ImgString, file: MediaFile) {
	const txtForByteVector = imgAsString.slice(
		imgAsString.indexOf(",") + 1,
		imgAsString.length
	);
	const mimeType = imgAsString.slice(
		imgAsString.indexOf(":") + 1,
		imgAsString.indexOf(";")
	);

	const picture = Picture.fromData(
		ByteVector.fromString(txtForByteVector, StringType.Latin1)
	);
	picture.description =
		"This image was download when this media was downloaded.";
	picture.type = PictureType.Media;
	picture.mimeType = mimeType;

	file.tag.pictures = [picture];

	log({ fileTagPictures: file.tag.pictures, picture });
}

export const getThumbnail = async (url: string): Promise<ImgString> =>
	new Promise((resolve, reject) =>
		get(url, res => {
			res.setEncoding("base64");

			let body = `data:${res.headers["content-type"]};base64,` as const;

			res.on("data", chunk => (body += chunk));
			res.on("end", () => resolve(body as ImgString));
		}).on("error", e => {
			error(`Got error getting image on Electron side: ${e.message}`);
			reject(e);
		})
	);

export type HandleConversion = Readonly<{
	electronPort?: Readonly<MessagePort>;
	toExtension?: AllowedMedias;
	path: Readonly<Path>;
	destroy?: boolean;
}>;

export type HandleDownload = Readonly<{
	electronPort?: MessagePort;
	extension?: AllowedMedias;
	imageURL?: string;
	destroy?: boolean;
	title?: string;
	url: string;
}>;
