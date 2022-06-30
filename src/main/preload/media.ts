/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable prefer-rest-params */

import type { ImgString, WriteTag } from "@common/@types/electron-window";
import type { Media, Path } from "@common/@types/generalTypes";
import type { MediaUrl } from "@contexts/downloadList";
import type { IPicture } from "node-taglib-sharp";
import type { Readable } from "node:stream";

import { rename as renameFile, access } from "node:fs/promises";
import { createReadStream, lstatSync } from "node:fs";
import { path as _ffmpeg_path_ } from "@ffmpeg-installer/ffmpeg";
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

import { ElectronToReactMessageEnum } from "@common/@types/electron-window";
import { sendMsgToClient } from "@common/crossCommunication";
import { ProgressStatus } from "@common/enums";
import { isDevelopment } from "@common/utils";
import { prettyBytes } from "@common/prettyBytes";
import { deleteFile } from "./file";
import { time } from "@utils/utils";
import { dirs } from "../utils";
import {
	type AllowedMedias,
	separatedByCommaOrSemiColon,
	dbg,
} from "@common/utils";
import {
	separatedByCommaOrSemiColorOrSpace,
	getLastExtension,
	formatDuration,
	getBasename,
} from "@common/utils";

const { log, error } = console;

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////

const ffmpegPath = _ffmpeg_path_.replace("app.asar", "app.asar.unpacked");
fluent_ffmpeg.setFfmpegPath(ffmpegPath);

const currentDownloads: Map<MediaUrl, Readable> = new Map();
const mediasConverting: Map<Path, Readable> = new Map();

async function pathExists(path: Readonly<Path>): Promise<Readonly<boolean>>
{
	return access(path).then(() => true).catch(() => false);
}

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////

async function createMedia(
	path: Readonly<Path>,
	assureMediaSizeIsGreaterThan60KB: Readonly<boolean>,
	ignoreMediaWithLessThan60Seconds: Readonly<boolean>,
): Promise<readonly [Path, Media]> {
	return new Promise((resolve, reject) => {
		const basename = getBasename(path);

		time(() => {
			const {
				tag: { pictures, title, album, genres, albumArtists },
				properties: { durationMilliseconds },
				fileAbstraction: { readStream: { length } },
			} = MediaFile.createFromPath(path);

			const durationInSeconds = durationMilliseconds / 1_000;

			if (ignoreMediaWithLessThan60Seconds && durationInSeconds < 60) {
				log(
					`Skipping "${path}" because the duration is ${
						durationInSeconds.toPrecision(3)
					} s (less than 60 s)!`,
				);
				return reject();
			}

			const size = prettyBytes(length);

			if (assureMediaSizeIsGreaterThan60KB && length < 60_000) {
				log(`Skipping "${path}" because size is ${size} bytes! (< 60 KB)`);
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
						picture.type === PictureType.Other ?
						Buffer.from(picture.data.data).toString("base64") :
						picture.data.toString();
				img = `data:${mimeType};base64,${str}` as ImgString;
			}

			const media: Media = {
				duration: formatDuration(durationInSeconds),
				birthTime: lstatSync(path).birthtimeMs,
				artist: albumArtists[0] ?? "",
				title: title ?? basename,
				genres,
				album,
				size,
				img,
			};

			dbg(basename, {
				tag: { pictures, album, genres, albumArtists },
				properties: { durationMilliseconds },
			});

			return resolve([path, media]);
		}, `createMedia("${basename}")`);
	});
}

export async function transformPathsToMedias(
	paths: readonly Path[],
	assureMediaSizeIsGreaterThan60KB = true,
	ignoreMediaWithLessThan60Seconds = true,
): Promise<readonly [Path, Media][]> {
	return time(async () => {
		console.groupCollapsed("Creating medias...");

		const promises = paths.map(path =>
			createMedia(
				path,
				assureMediaSizeIsGreaterThan60KB,
				ignoreMediaWithLessThan60Seconds,
			)
		);

		const medias = (await Promise.allSettled(promises))
			.map(p => (p.status === "fulfilled" ? p.value : false))
			.filter(Boolean) as [Path, Media][];

		console.groupEnd();

		return medias;
	}, "transformPathsToMedias");
}

export async function handleCreateOrCancelDownload(
	{ electronPort, extension, imageURL, destroy, title, url }: HandleDownload,
): Promise<void> {
	if (!url) return error("Missing required param 'url'!", arguments);

	if (!currentDownloads.has(url)) {
		if (!electronPort || !imageURL || !title || !url || !extension)
			return error("Missing required params!", arguments);

		return await makeStream({ imageURL, url, title, electronPort, extension });
	} else if (destroy) currentDownloads.get(url)!.emit("destroy");
}

export async function makeStream(
	{ electronPort, extension, imageURL, title, url }: Required<
		Omit<HandleDownload, "destroy">
	>,
): Promise<void> {
	dbg(`Attempting to create a stream for "${title}" to download.`);

	const titleWithExtension = sanitize(`${title}.${extension}`);
	const saveSite = join(dirs.music, titleWithExtension);

	// Assert file doesn't already exists:
	if (await pathExists(saveSite)) {
		error(`File "${saveSite}" already exists! Canceling download.`);

		// Send a msg that the download failed:
		return sendFailedDownloadMsg(url, electronPort);
	}

	let interval: NodeJS.Timer | undefined;
	const startTime = Date.now();
	let percentageToSend = 0;
	let prettyTotal = "";

	// ytdl will 'end' the stream for me.
	const readStream = ytdl(url, {
		requestOptions: { maxRetries: 0 },
		quality: "highestaudio",
	})
		.on("progress", (_, downloaded: number, total: number) => {
			const percentage = (downloaded / total) * 100;
			percentageToSend = percentage;

			// To react:
			if (!interval) {
				// ^ Only in the firt time this 'on progress' fn is called!
				interval = setInterval(
					() => electronPort.postMessage({ percentage: percentageToSend }),
					1_000,
				);
				prettyTotal = prettyBytes(total);

				// Send a message to client that we're starting a download:
				sendMsgToClient({
					type: ElectronToReactMessageEnum.NEW_DOWNLOAD_CREATED,
					url,
				});
			}

			// To node console if is in development:
			if (isDevelopment) {
				const secondsDownloading = (Date.now() - startTime) / 1_000;
				const estimatedDownloadTime =
					(secondsDownloading / (percentage / 100) - secondsDownloading)
						.toFixed(2);

				readline.cursorTo(process.stdout, 0);
				readline.clearLine(process.stdout, 0);
				process.stdout.write(`${
					percentage.toFixed(2)
				}% downloaded, (${
					prettyBytes(downloaded)
				} / ${prettyTotal}). Running for: ${
					secondsDownloading.toFixed(2)
				} seconds. ETA: ${estimatedDownloadTime} seconds.`);
			}
		})
		.on("destroy", async () => {
			log(
				`%cDestroy was called on readStream! title: ${title}`,
				"color: blue; font-weight: bold; background: yellow; font-size: 0.8rem;",
			);

			// Delete the file if it's not converted successfully:
			if (await pathExists(saveSite)) await deleteFile(saveSite);

			electronPort.postMessage({
				status: ProgressStatus.CANCEL,
				isDownloading: false,
			});
			electronPort.close();
			clearInterval(interval);

			currentDownloads.delete(url);
			dbg(
				"Download was destroyed. Deleting stream from currentDownloads:",
				currentDownloads,
				"Does the downloaded file still exists?",
				await pathExists(saveSite),
			);

			sendFailedDownloadMsg(url, electronPort);
		})
		.on("end", async () => {
			log(
				`%cFile "${titleWithExtension}" saved successfully!`,
				"color: green; font-weight: bold;",
			);

			// To react:
			electronPort.postMessage({
				status: ProgressStatus.SUCCESS,
				isDownloading: false,
			});
			electronPort.close();
			clearInterval(interval);

			// Write media image:
			await writeTags(saveSite, {
				downloadImg: true,
				isNewMedia: true,
				imageURL,
			});

			currentDownloads.delete(url);
			dbg(
				"Download ended. Deleting stream from currentDownloads:",
				currentDownloads,
			);
		})
		.on("error", async err => {
			error(`Error downloading file: "${titleWithExtension}"!`, err);

			// Delete the file if it's not converted successfully:
			if (await pathExists(saveSite)) await deleteFile(saveSite);

			// To react
			electronPort.postMessage({
				status: ProgressStatus.FAILED,
				isDownloading: false,
				error: err,
			});
			electronPort.close();
			clearInterval(interval);

			// I only found it to work when I send it with an Error:
			readStream.destroy(err);

			currentDownloads.delete(url);
			dbg(
				"Download threw an error. Deleting stream from currentDownloads:",
				currentDownloads,
				"Does the downloaded file still exists?",
				await pathExists(saveSite),
			);

			sendFailedDownloadMsg(url, electronPort);
		});

	fluent_ffmpeg(readStream).toFormat(extension).saveToFile(saveSite);

	currentDownloads.set(url, readStream);
	dbg(`Added "${url}" to currentDownloads =`, currentDownloads);
}

export async function handleCreateOrCancelConvert(
	{ electronPort, toExtension, destroy, path }: HandleConversion,
): Promise<void> {
	if (!path) return error("Missing required param 'path'!", arguments);

	if (!mediasConverting.has(path)) {
		if (!toExtension || !electronPort)
			return error("Missing required params!", arguments);

		return await convertToAudio({ path, toExtension, electronPort });
	} else if (destroy) mediasConverting.get(path)!.emit("destroy");
}

export async function convertToAudio(
	{ electronPort, toExtension, path }: Required<
		Omit<HandleConversion, "destroy">
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

export async function writeTags(
	mediaPath: Readonly<Path>,
	data: Readonly<WriteTag & { isNewMedia?: boolean; downloadImg?: boolean; }>,
): Promise<void> {
	dbg("Writing tags to file:", { mediaPath, data });

	const file = MediaFile.createFromPath(mediaPath);
	let fileNewPath = "";

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
								data.imageURL as string,
							);

							createAndSaveImageOnMedia(imgAsString, file);

							console.assert(
								file.tag.pictures.length === 1,
								"No pictures added!",
								file.tag.pictures,
							);
						} catch (err) {
							error("There was an error getting the picture data.", err);
						}
					} else {
						// Here, assume we received an img as a base64 string
						// as in: `data:${string};base64,${string}`.
						data.imageURL!.includes("data:image/") &&
							data.imageURL!.includes(";base64,") ?
							createAndSaveImageOnMedia(data.imageURL as ImgString, file) :
							error(`Invalid imgAsString = "${data.imageURL}"!`);

						console.assert(
							file.tag.pictures.length === 1,
							"No pictures added!",
							file.tag.pictures,
						);
					}
					break;
				}

				case "albumArtists": {
					dbg("On 'albumArtists' branch.", { value });

					if (value instanceof Array)
						file.tag.albumArtists = value as string[];
					else {
						const albumArtists = (value as string)
							.split(separatedByCommaOrSemiColon)
							.filter(Boolean)
							.map(v => v.trim());

						file.tag.albumArtists = albumArtists;
					}

					dbg(`file.tag.albumArtists = "${file.tag.albumArtists}";`);

					break;
				}

				case "genres": {
					dbg("On 'genres' branch.", { value });

					if (value instanceof Array)
						file.tag.genres = value as string[];
					else {
						const genres = (value as string)
							.split(separatedByCommaOrSemiColorOrSpace)
							.filter(Boolean)
							.map(v => v.trim());

						file.tag.genres = genres;
					}

					dbg(`file.tag.genres = "${file.tag.genres}";`);

					break;
				}

				case "title": {
					const sanitizedTitle = sanitize(value as string);

					const oldPath = mediaPath;
					const newPath = join(
						dirname(oldPath),
						sanitizedTitle + "." + getLastExtension(oldPath),
					);

					file.tag.title = sanitizedTitle;

					dbg({ "file.tag.title": file.tag.title, value });

					if (getBasename(oldPath) === sanitizedTitle) break;

					dbg({ oldPath, newPath });

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
					dbg(`On default case: file.tag[${tag}] =`, file.tag[tag]);

					break;
				}
			}
		});

		dbg("New file tags =", file.tag);

		// DO NOT SEPARATE THESE TWO FUNCTIONS!! I found a bug if so.
		file.save();
		file.dispose();
		//
	} catch (error) {
		// Send error to client:
		sendMsgToClient({
			type: ElectronToReactMessageEnum.ERROR,
			error: error as Error,
		});
	} finally {
		if (fileNewPath)
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
				dbg(
					"Was file renamed?",
					await pathExists(fileNewPath),
					"Does old file remains?",
					await pathExists(mediaPath),
				);
			}
		else if (data.isNewMedia)
			// Add the new media:
			sendMsgToClient({
				type: ElectronToReactMessageEnum.ADD_ONE_MEDIA,
				mediaPath,
			});
		// If everything else fails, refresh media:
		else
			sendMsgToClient({
				type: ElectronToReactMessageEnum.REFRESH_ONE_MEDIA,
				mediaPath,
			});
	}
}

export function createAndSaveImageOnMedia(
	imgAsString: Readonly<ImgString>,
	file: MediaFile,
): MediaFile {
	const txtForByteVector = imgAsString.slice(
		imgAsString.indexOf(",") + 1,
		imgAsString.length,
	);
	const mimeType = imgAsString.slice(
		imgAsString.indexOf(":") + 1,
		imgAsString.indexOf(";"),
	);

	const picture = Picture.fromFullData(
		ByteVector.fromString(txtForByteVector, StringType.Latin1),
		PictureType.Media,
		mimeType,
		"This image was download when this media was downloaded.",
	);
	picture.filename = "thumbnail";

	file.tag.pictures = [picture];

	dbg("At createImage():", { "file.tag.pictures": file.tag.pictures, picture });

	return file;
}

export async function getThumbnail(
	url: Readonly<string>,
): Promise<Readonly<ImgString>> {
	return new Promise((resolve, reject) =>
		get(url, res => {
			res.setEncoding("base64");

			let body = `data:${res.headers["content-type"]};base64,`;

			res.on("data", chunk => {
				body = body.concat(chunk);
			});

			res.on("end", () => resolve(body as ImgString));
		})
			.on("error", e => {
				error(`Got error getting image on Electron side: ${e.message}`);
				return reject(e);
			})
	);
}

function sendFailedConversionMsg(
	path: Readonly<Path>,
	electronPort: Readonly<MessagePort>,
): void {
	sendMsgToClient({
		type: ElectronToReactMessageEnum.CREATE_CONVERSION_FAILED,
		path,
	});

	electronPort.close();
}

function sendFailedDownloadMsg(
	url: Readonly<string>,
	electronPort: Readonly<MessagePort>,
): void {
	sendMsgToClient({
		type: ElectronToReactMessageEnum.CREATE_DOWNLOAD_FAILED,
		url,
	});

	electronPort.close();
}

export type HandleConversion = Readonly<
	{
		toExtension?: AllowedMedias;
		electronPort?: MessagePort;
		destroy?: boolean;
		path: Path;
	}
>;

export type HandleDownload = Readonly<
	{
		electronPort?: MessagePort;
		extension?: AllowedMedias;
		imageURL?: string;
		destroy?: boolean;
		title?: string;
		url: string;
	}
>;
