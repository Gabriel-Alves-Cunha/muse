import type { ImgString, WriteTag } from "@common/@types/electron-window";
import type { AllowedMedias } from "@common/utils";
import type { Media, Path } from "@common/@types/typesAndEnums";
import type { IPicture } from "node-taglib-sharp";
import type { Readable } from "stream";

import { createReadStream, existsSync } from "fs";
import { path as _ffmpeg_path_ } from "@ffmpeg-installer/ffmpeg";
import { rename as renameFile } from "fs/promises";
import { dirname, join } from "path";
import { get } from "https";
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
import { ProgressStatus } from "@common/@types/typesAndEnums";
import { prettyBytes } from "@common/prettyBytes";
import { hash } from "@common/hash";
import { dirs } from "../utils";
import { dbg } from "@common/utils";
import {
	getLastExtension,
	formatDuration,
	isDevelopment,
	getBasename,
} from "@common/utils";

const ffmpegPath = _ffmpeg_path_.replace("app.asar", "app.asar.unpacked");
fluent_ffmpeg.setFfmpegPath(ffmpegPath);

const currentDownloads: Map<string, Readable> = new Map();
const mediasConverting: Map<Path, Readable> = new Map();

const createMedia = async (
	path: Path,
	index: number,
	assureMediaSizeIsGreaterThan60KB: boolean,
	ignoreMediaWithLessThan60Seconds: boolean,
): Promise<Media> =>
	new Promise((resolve, reject) => {
		const basename = getBasename(path);
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
			console.info(
				`Skipping "${path}" because the duration is ${duration} seconds (< 60 seconds)!`,
			);
			console.timeEnd(`Nº ${index}, "${basename}" took`);
			return reject();
		}

		if (assureMediaSizeIsGreaterThan60KB && sizeInBytes < 60_000) {
			console.info(
				`Skipping "${path}" because size is ${sizeInBytes} bytes! (< 60_000 bytes)`,
			);
			console.timeEnd(`Nº ${index}, "${basename}" took`);
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

		const media: Media = {
			duration: formatDuration(duration),
			size: prettyBytes(sizeInBytes),
			artist: albumArtists[0] ?? "",
			dateOfArival: Date.now(),
			title: title ?? basename,
			favorite: false,
			id: hash(path),
			genres,
			album,
			path,
			img,
		};

		console.timeEnd(`Nº ${index}, "${basename}" took`);

		dbg(basename, {
			tag: { pictures, album, genres, albumArtists },
			properties: { durationMilliseconds },
		});

		return resolve(media);
	});

export async function transformPathsToMedias(
	paths: readonly Path[],
	assureMediaSizeIsGreaterThan60KB = true,
	ignoreMediaWithLessThan60Seconds = true,
): Promise<readonly Media[]> {
	const medias: Media[] = [];
	console.time("Runnig 'for' on all medias");
	const promises = paths.map((path, index) =>
		createMedia(
			path,
			index,
			assureMediaSizeIsGreaterThan60KB,
			ignoreMediaWithLessThan60Seconds,
		),
	);
	(await Promise.allSettled(promises)).forEach(p => {
		if (p.status === "fulfilled") medias.push(p.value);
	});
	console.timeEnd("Runnig 'for' on all medias");

	return medias;
}

export type HandleDownload = Readonly<{
	electronPort: Readonly<MessagePort>;
	imageURL: Readonly<string>;
	title: Readonly<string>;
	url: Readonly<string>;
}>;

export function handleCreateOrCancelDownload({
	electronPort,
	imageURL,
	destroy,
	title,
	url,
}: HandleDownload & {
	destroy: Readonly<boolean>;
}) {
	if (!currentDownloads.has(url))
		makeStream({ imageURL, url, title, electronPort });
	else if (destroy)
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		currentDownloads.get(url)!.emit("destroy");
}

export function makeStream({
	electronPort,
	imageURL,
	title,
	url,
}: HandleDownload) {
	const extension: AllowedMedias = "mp3";
	const titleWithExtension = sanitize(`${title}.${extension}`);
	const saveSite = join(dirs.music, titleWithExtension);
	const startTime = Date.now();

	let interval: NodeJS.Timer | undefined = undefined;
	let percentageToSend = "";

	// ytdl will 'end' the stream for me.
	const readStream = ytdl(url, {
		requestOptions: { maxRetries: 0 },
		quality: "highestaudio",
	})
		.on("destroy", () => {
			console.log(
				"%cDestroy was called on readStream!",
				"color: blue; font-weight: bold; background-color: yellow; font-size: 0.8rem;",
			);

			electronPort.postMessage({
				status: ProgressStatus.CANCEL,
				isDownloading: false,
			});
			electronPort.close();
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			clearInterval(interval!);

			const readAnswer = readStream.destroy(
				new Error("This readStream is being destroyed!"),
			);
			dbg("readStream 'destroy()' answer =", readAnswer);

			currentDownloads.delete(url);
			dbg({ currentDownloads });
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
				readline.clearLine(process.stdout, 0);
				process.stdout.write(
					`${percentage}% downloaded, (${prettyBytes(downloaded)}/${prettyBytes(
						total,
					)}). Running for: ${minutesDownloading} minutes. ETA: ${estimatedDownloadTime} minutes.`,
				);
			}
		})
		.on("end", async () => {
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
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			clearInterval(interval!);

			console.log("Going to writeTags...");
			await writeTags(saveSite, { imageURL, isNewMedia: true });

			currentDownloads.delete(url);
		})
		.on("error", error => {
			console.error(`Error downloading file: "${titleWithExtension}"!`, error);

			// To react
			electronPort.postMessage({
				status: ProgressStatus.FAIL,
				isDownloading: false,
				error,
			});
			electronPort.close();
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			clearInterval(interval!);

			currentDownloads.delete(url);
		});

	fluent_ffmpeg(readStream).toFormat(extension).saveToFile(saveSite);

	currentDownloads.set(url, readStream);
	dbg(`Added "${url}" to currentDownloads =`, currentDownloads);
}

export type HandleConversion = Readonly<{
	electronPort: Readonly<MessagePort>;
	toExtension: AllowedMedias;
	mediaPath: Readonly<Path>;
}>;

export function handleCreateOrCancelConvert({
	electronPort,
	toExtension,
	mediaPath,
	destroy,
}: HandleConversion & { destroy: boolean }) {
	if (!mediasConverting.has(mediaPath))
		convertToAudio({ mediaPath, toExtension, electronPort });
	else if (destroy)
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		mediasConverting.get(mediaPath)!.emit("destroy");
}

export function convertToAudio({
	electronPort,
	toExtension,
	mediaPath,
}: HandleConversion) {
	const titleWithExtension = sanitize(
		`${getBasename(mediaPath)}.${toExtension}`,
	);
	const saveSite = join(dirs.music, titleWithExtension);
	const readStream = createReadStream(mediaPath);

	let interval: NodeJS.Timer | undefined = undefined;
	// let timeConverted = "";
	// let sizeConverted = 0;

	fluent_ffmpeg(readStream)
		.toFormat(toExtension)
		.save(saveSite)
		.on(
			"progress",
			({ targetSize, timemark }: { targetSize: number; timemark: number }) => {
				// targetSize: current size of the target file in kilobytes
				// timemark: the timestamp of the current frame in seconds

				// TODO: test this:
				// To react:
				if (!interval) {
					// ^ Only in the firt time this setInterval is called!
					interval = setInterval(
						() =>
							electronPort.postMessage({
								sizeConverted: targetSize,
								timeConverted: timemark,
							}),
						2_000,
					);
				}
				// // To react:
				// if (!interval) {
				// 	// ^ Only in the firt time this setInterval is called!
				// 	interval = setInterval(
				// 		() => electronPort.postMessage({ sizeConverted, timeConverted }),
				// 		2_000,
				// 	);
				// }
			},
		)
		.on("error", error => {
			// TODO: see if it's necessary to delete the file if it's not converted successfully!
			console.error(
				`Error converting file: "${titleWithExtension}"!\n\n`,
				error,
			);

			// To react:
			electronPort.postMessage({
				status: ProgressStatus.FAIL,
				isConverting: false,
				error,
			});
			electronPort.close();
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			clearInterval(interval!);

			mediasConverting.delete(mediaPath);
		})
		.on("end", async () => {
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
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			clearInterval(interval!);

			{
				// Treat the file successfully converted as a new media:
				console.log("Adding new media:", {
					msg: "Treat the file successfully converted as a new media...",
					type: "ReactElectronAsyncMessageEnum.ADD_ONE_MEDIA",
					mediaPath: saveSite,
				});
				window.postMessage({
					type: ElectronToReactMessageEnum.ADD_ONE_MEDIA,
					mediaPath: saveSite,
				});

				// and remove old one
				console.log("Removing old media:", {
					msg: "and remove old one.",
					type: "ReactElectronAsyncMessageEnum.REMOVE_ONE_MEDIA",
					mediaPath,
				});
				window.postMessage({
					type: ElectronToReactMessageEnum.REMOVE_ONE_MEDIA,
					mediaPath,
				});
			}

			mediasConverting.delete(mediaPath);
		})
		.on("destroy", () => {
			// TODO: see if it's necessary to delete the file if it's not converted successfully!
			console.log(
				"%cDestroy was called on readStream for converter!",
				"color: blue; font-weight: bold; background-color: yellow; font-size: 0.8rem;",
			);

			electronPort.postMessage({
				status: ProgressStatus.CANCEL,
				isConverting: false,
			});
			electronPort.close();
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			clearInterval(interval!);

			const readAnswer = readStream.destroy(
				new Error("This readStream is being destroyed!"),
			);
			dbg("readStream 'destroy()' answer =", readAnswer);

			mediasConverting.delete(mediaPath);
			dbg({ mediasConverting });
		});

	mediasConverting.set(mediaPath, readStream);
	dbg(`Added '${mediaPath}' to mediasConverting =`, mediasConverting);
}

export async function writeTags(
	mediaPath: Readonly<Path>,
	data: Readonly<WriteTag & { isNewMedia?: boolean; downloadImg?: boolean }>,
): Promise<void> {
	const file = MediaFile.createFromPath(mediaPath);
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
					} else if (data.downloadImg) {
						dbg("Downloading picture...");
						try {
							const imgAsString: ImgString = await getThumbnail(
								data.imageURL as string,
							);

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
					} else {
						// Assume we received an img as a base64 string like: `data:${string};base64,${string}`.
						if (
							data.imageURL?.includes("data:image/", 0) &&
							data.imageURL?.includes("base64,")
						) {
							const imgAsString = data.imageURL as string;
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
						} else console.error("Invalid imageURL! imageURL =", data.imageURL);
					}

					break;
				}

				case "albumArtists": {
					dbg("On 'albumArtists' branch.", { value });

					if (Array.isArray(value)) {
						const albumArtists = value as string[];

						file.tag.albumArtists = albumArtists;

						console.log(`file.tag.albumArtists = "${file.tag.albumArtists}";`, {
							albumArtists,
						});
					} else {
						const albumArtists = (value as string)
							.split(",")
							.map(v => v.trim());

						file.tag.albumArtists = albumArtists;
						console.log(`file.tag.albumArtists = "${file.tag.albumArtists}";`, {
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
						sanitizedTitle + "." + getLastExtension(oldPath),
					);

					file.tag.title = sanitizedTitle;

					console.log({ value });

					if (getBasename(oldPath) === sanitizedTitle) break;

					console.log({ oldPath, newPath });

					fileNewPath = newPath;
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
		// Send error to client:
		console.log({
			type: "ReactElectronAsyncMessageEnum.ERROR",
			error,
		});
		window.postMessage({
			type: ElectronToReactMessageEnum.ERROR,
			error,
		});

		throw error;
	} finally {
		if (fileNewPath) {
			try {
				await renameFile(mediaPath, fileNewPath);

				// Since media has a new path, create a new media...
				console.log("Adding new media:", {
					msg: "Since media has a new path, create a new media...",
					type: "ReactElectronAsyncMessageEnum.ADD_ONE_MEDIA",
					mediaPath: fileNewPath,
				});
				window.postMessage({
					type: ElectronToReactMessageEnum.ADD_ONE_MEDIA,
					mediaPath: fileNewPath,
				});

				// and remove old one
				console.log("Removing old media:", {
					msg: "and remove old one.",
					type: "ReactElectronAsyncMessageEnum.REMOVE_ONE_MEDIA",
					mediaPath,
				});
				window.postMessage({
					type: ElectronToReactMessageEnum.REMOVE_ONE_MEDIA,
					mediaPath,
				});
			} catch (error) {
				// Send error to react process: (error renaming file => file has old path)
				console.error({
					type: "ReactElectronAsyncMessageEnum.ERROR",
					error,
				});
				window.postMessage({
					type: ElectronToReactMessageEnum.ERROR,
					error,
				});

				// Since there was an error, let's at least refresh media:
				console.log({
					type: "ReactElectronAsyncMessageEnum.REFRESH_ONE_MEDIA",
					mediaPath,
				});
				window.postMessage({
					type: ElectronToReactMessageEnum.REFRESH_ONE_MEDIA,
					mediaPath,
				});
			} finally {
				console.log("Was file renamed?", existsSync(fileNewPath));
				console.log("Does old file remains?", existsSync(mediaPath));
			}
		} else if (data.isNewMedia) {
			// Add new media:
			console.log({
				type: "ReactElectronAsyncMessageEnum.ADD_ONE_MEDIA",
				mediaPath,
			});
			window.postMessage({
				type: ElectronToReactMessageEnum.ADD_ONE_MEDIA,
				mediaPath,
			});
		} else {
			// Refresh media:
			console.log({
				type: "ReactElectronAsyncMessageEnum.REFRESH_ONE_MEDIA",
				mediaPath,
			});
			window.postMessage({
				type: ElectronToReactMessageEnum.REFRESH_ONE_MEDIA,
				mediaPath,
			});
		}
	}
}

export const getThumbnail = async (url: string): Promise<ImgString> =>
	new Promise((resolve, reject) => {
		get(url, res => {
			res.setEncoding("base64");

			let body = `data:${res.headers["content-type"]};base64,` as const;

			res.on("data", chunk => (body += chunk));
			res.on("end", () => resolve(body as ImgString));
		}).on("error", e => {
			console.error(`Got error getting image on Electron side: ${e.message}`);
			reject(e);
		});
	});
