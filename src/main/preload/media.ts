/* eslint-disable @typescript-eslint/no-non-null-assertion */

import type { Path, ImgString } from "@common/@types/generalTypes";
import type { WriteTag } from "@common/@types/electron-window";

import { rename as renameFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { error } from "node:console";
import { get } from "node:https";
import {
	File as MediaFile,
	PictureType,
	ByteVector,
	Picture,
} from "node-taglib-sharp";
import sanitize from "sanitize-filename";

import { separatedByCommaOrSemiColon, dbg } from "@common/utils";
import { ElectronToReactMessageEnum } from "@common/@types/electron-window";
import { sendMsgToClient } from "@common/crossCommunication";
import {
	separatedByCommaOrSemiColorOrSpace,
	getLastExtension,
	getBasename,
} from "@common/utils";

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////

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
							const imgAsString = await downloadThumbnail(
								data.imageURL as string,
							);

							dbg({ imgAsString });

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
	// TODO: see if this still works
	const txtForByteVector = imgAsString.slice(
		imgAsString.indexOf(",") + 1,
		imgAsString.length,
	);
	const mimeType = imgAsString.slice(
		imgAsString.indexOf(":") + 1,
		imgAsString.indexOf(";"),
	);

	const picture = Picture.fromFullData(
		ByteVector.fromBase64String(txtForByteVector),
		PictureType.Media,
		mimeType,
		"This image was download when this media was downloaded.",
	);
	picture.filename = "thumbnail";

	file.tag.pictures = [picture];

	dbg("At createImage():", { "file.tag.pictures": file.tag.pictures, picture });

	return file;
}

export async function downloadThumbnail(
	url: Readonly<string>,
): Promise<ByteVector> {
	return new Promise((resolve, reject) =>
		get(url, async res => {
			resolve(await ByteVector.fromStream(res));
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
