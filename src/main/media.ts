import { Readable, Writable, Stream, Duplex } from "readable-stream";
import { type IFileAbstraction } from "node-taglib-sharp/dist/fileAbstraction";
import { fetch, ResponseType } from "@tauri-apps/api/http";
import ytdl, { getBasicInfo } from "ytdl-core";
import { path as ffmpegPath } from "@ffmpeg-installer/ffmpeg";
import { dirname, join } from "@tauri-apps/api/path";
import { renameFile } from "@tauri-apps/api/fs";
import {
	File as MediaFile,
	type IPicture,
	PictureType,
	ByteVector,
	StringType,
	Picture,
} from "node-taglib-sharp";
import fluent_ffmpeg from "fluent-ffmpeg";
import sanitize from "sanitize-filename";

import { ImgString, WriteTag } from "@common/@types/electron-window";
import { string2number } from "@common/hash";
import { prettyBytes } from "@common/prettyBytes";
import { dirs } from "./utils";
import {
	ListenToNotification,
	ProgressStatus,
	type Media,
	type Path,
} from "@common/@types/typesAndEnums";
import {
	type AllowedMedias,
	getLastExtension,
	formatDuration,
	getBasename,
	dbg,
} from "@common/utils";

// media: {
// 	transformPathsToMedias,
// 	convertToAudio,
// 	getVideoInfo,
// 	writeTags,
// }

fluent_ffmpeg.setFfmpegPath(ffmpegPath);

type URL = string;

const mediasConverting: Map<Path, Readable> = new Map();
const currentDownloads: Map<URL, Readable> = new Map();

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
					// `writeTag`, we can't decode it! :(
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

export type DownloadProps = Readonly<{
	electronPort: MessagePort;
	imageURL: string;
	title: string;
	url: string;
}>;

export function handleCreateOrCancelDownload(
	downloadProps: DownloadProps & { destroy: boolean },
) {
	if (downloadProps.url && !currentDownloads.has(downloadProps.url))
		makeStream(downloadProps);
	else if (downloadProps.url && downloadProps.destroy) {
		// const stream = get(currentDownloads, downloadProps.url);
		// TODO
	}
}

export async function makeStream({
	electronPort,
	imageURL,
	title,
	url,
}: DownloadProps) {
	const extension: AllowedMedias = "mp3";
	const titleWithExtension = `${sanitize(title)}.${extension}`;
	const saveSite = await join(dirs.music, titleWithExtension);

	let interval: NodeJS.Timer | undefined = undefined;
	let percentage = "";

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

			interval && clearInterval(interval);

			const readAnswer = readStream.destroy(
				new Error("This readStream is being destroyed!"),
			);
			dbg("readStream 'destroy()' answer =", readAnswer);

			currentDownloads.delete(url);
			dbg({ currentDownloads });
		})
		.on(
			"progress",
			(
				_chunkLengthInBytes: number,
				bytesDownloaded: number,
				totalBytes: number,
			) => {
				percentage = ((bytesDownloaded / totalBytes) * 100).toFixed(2);

				// To react:
				if (!interval) {
					// ^ Only in the firt time this 'on progress' fn is called!

					interval = setInterval(
						() => electronPort.postMessage({ percentage }),
						1_500,
					);
				}
			},
		)
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

			interval && clearInterval(interval);

			try {
				console.log("Going to writeTags to write the img to the media...");
				await writeTags(saveSite, { imageURL, isNewMedia: true });
			} catch (error) {
				console.error(error);
			} finally {
				currentDownloads.delete(url);
			}
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

			interval && clearInterval(interval);

			currentDownloads.delete(url);
		});

	fluent_ffmpeg(readStream).toFormat(extension).saveToFile(saveSite);

	// @ts-ignore Let's see if it works...
	currentDownloads.set(url, readStream);
	dbg(`Added "${url}" to currentDownloads =`, currentDownloads);
}

type ConvertProps = {
	toExtension: AllowedMedias;
	electronPort: MessagePort;
	mediaPath: Path;
};

export function handleCreateOrCancelConvert({
	electronPort,
	toExtension,
	mediaPath,
	destroy,
}: ConvertProps & {
	destroy: Readonly<boolean>;
}) {
	if (mediaPath && !mediasConverting.has(mediaPath))
		convertToAudio({ mediaPath, toExtension, electronPort });
	else if (mediaPath && destroy) {
		const convertStream = mediasConverting.get(mediaPath);

		if (convertStream) {
			convertStream.destroy(
				new Error("This convertStream is being destroyed!"),
			);
			mediasConverting.delete(mediaPath);
			dbg({ mediasConverting });
		}
	}
}

export async function convertToAudio({
	electronPort,
	toExtension,
	mediaPath,
}: ConvertProps) {
	const titleWithExtension = `${sanitize(
		getBasename(mediaPath),
	)}.${toExtension}`;
	const saveSite = await join(dirs.music, "titleWithExtension");
	const readStreamToConvert = new Readable();

	let interval: NodeJS.Timer | undefined = undefined;
	let timeConverted = "";
	let sizeConverted: 0;

	fluent_ffmpeg(readStreamToConvert)
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
					1_500,
				);
			}
		})
		.on("error", error => {
			console.error(`Error converting file: "${titleWithExtension}"!`, error);

			// To react:
			electronPort.postMessage({
				status: ProgressStatus.FAIL,
				isConverting: false,
				error,
			});
			electronPort.close();

			interval && clearInterval(interval);

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

			interval && clearInterval(interval);

			mediasConverting.delete(mediaPath);
		})
		.on("destroy", () => {
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

			const readAnswer = readStreamToConvert.destroy(
				new Error("This readStreamToConvert is being destroyed!"),
			);

			dbg("'readStream.destroy()' answer =", readAnswer);

			mediasConverting.delete(mediaPath);
		})
		.saveToFile(mediaPath);

	mediasConverting.set(mediaPath, readStreamToConvert);
	dbg(`Added '${mediaPath}' to mediasConverting =`, mediasConverting);
}

// function createMyFileAbstraction(filename: string): IFileAbstraction {
// 	const readStream = new Readable();
// 	const writeStream = new Writable();
// 	const stream = new Stream();
// 	const readAndWriteStream = new Duplex();

// 	// readStream.canWrite = () => readStream.

// 	const fileAbstraction: IFileAbstraction = {
// 		/**
// 		 * Name or identifier used by the implementation
// 		 * @remarks This value would typically represent a path or URL to be used when identifying
// 		 *   the file system, but it could be any valid as appropriate for the implementation.
// 		 */
// 		name: filename,
// 		/**
// 		 * Readable, seekable stream for the file referenced by the current instance.
// 		 * @remarks This property is typically used when constructing an instance of {@link File}.
// 		 *   Upon completion of the constructor {@link closeStream} will be called to close the stream.
// 		 *   If the stream is to be reused after this point, {@link closeStream} should be implemented
// 		 *   in a way to keep it open.
// 		 */
// 		readStream: readAndWriteStream.,
// 		/**
// 		 * Writable, seekable stream fo the file referenced by the current instance.
// 		 * @remarks This property is typically used when saving a file with {@link File.save}. Upon
// 		 *   completion of the method, {@link closeStream} will be called to close the stream. If the
// 		 *   stream is to be reused after this point, {@link closeStream} should be implemented in a way
// 		 *   to keep it open
// 		 */
// 		writeStream,
// 		/**
// 		 * Closes a stream created by the current instance.
// 		 * @param stream Stream created by the current instance.
// 		 */
// 		closeStream(stream: IStream): void;,
// 	};

// 	return fileAbstraction;
// }

export async function writeTags(
	mediaPath: Readonly<Path>,
	data: Readonly<WriteTag & { isNewMedia?: boolean }>,
) {
	// TODO: need to change this to readable-stream
	const file = MediaFile.createFromPath(mediaPath);
	// const s = new Duplex();

	// const fileAbstraction = Object.assign(s, {
	// 	name: mediaPath,
	// 	closeStream: s.destroy,
	// 	readStream: s,
	// 	writeStream: s,
	// });

	// const file_ = MediaFile.createFromAbstraction(fileAbstraction);
	dbg({ data });

	let fileNewPath = "";

	try {
		Object.entries(data).forEach(async ([tag, value]) => {
			switch (tag) {
				case "imageURL": {
					if (data.imageURL === "erase img") {
						// if imageURL === 'erase img' => erase img so we don't keep
						// getting an error on the browser side.
						file.tag.pictures = [];
						console.warn(
							"(SHOULD BE EMPTY) file.tag.pictures =",
							file.tag.pictures,
						);
					} else {
						dbg("Downloading picture...");
						try {
							// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
							const req = await fetch<ImgString>(data.imageURL!, {
								responseType: ResponseType.Text,
								method: "GET",
							});

							dbg({ req });
							const imgAsString = req.data;

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
								"This image was download when this media was downloaded.";
							picture.filename = `${getBasename(mediaPath)}`;
							// Should be sanitized. ^
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

					file.tag.title = sanitize(value as string);

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

export const getVideoInfo = async (url: string) => await getBasicInfo(url);
