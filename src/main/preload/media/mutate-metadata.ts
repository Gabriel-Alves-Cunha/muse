/* eslint-disable @typescript-eslint/no-non-null-assertion */

import type { Path, ImgString, Mutable } from "@common/@types/generalTypes";
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

import { getBasename, getLastExtension } from "@common/path";
import { ElectronToReactMessageEnum } from "@common/@types/electron-window";
import { checkOrThrow, validator } from "@common/args-validator";
import { sendMsgToClient } from "@common/crossCommunication";
import { dbg, eraseImg } from "@common/utils";
import { pathExists } from "../file";

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Schemas For Arguments Verification

const checkForMediaPath = validator.compile({
	messages: { string: "Please check mediaPath!" },
	type: "string",
	$$root: true,
	min: 10,
});

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Helper functions for `writeTags`:

async function handleImageMetadata(
	file: MediaFile,
	imageURL: Readonly<typeof eraseImg | ImgString | string> = "",
	downloadImg: Readonly<boolean> = false,
): Promise<void> {
	if (downloadImg)
	{
		try {
			dbg("Downloading picture...");

			const base64img = await downloadThumbnail(imageURL);

			dbg({ base64img });

			// createAndSaveImageOnMedia(base64img, file);

			console.assert(
				file.tag.pictures.length === 1,
				"No pictures added!",
				file.tag.pictures,
			);
		} catch (err) {
			error("There was an error getting the picture data.", err);

			// Send error to client:
			sendMsgToClient({
				type: ElectronToReactMessageEnum.ERROR,
				error: err as Error,
			});
		}

		return;
	}

	/////////////////////////////////////////////

	// if imageURL === 'erase img' => erase img so we don't keep
	// getting an error on the browser.
	if (imageURL === eraseImg) {
		dbg("Erasing picture...");
		file.tag.pictures = [];

		return;
	}

	/////////////////////////////////////////////

	// else:
	// Here, assume we received an img as a base64 string
	// as in: `data:${string};base64,${string}`.
	imageURL.includes("data:image/") && imageURL.includes(";base64,") ?
		createAndSaveImageOnMedia(imageURL as ImgString, file) :
		error(
			`Invalid imgAsString (it should be "data:\${string};base64,\${string}") = "${imageURL}"!`,
		);

	console.assert(
		file.tag.pictures.length === 1,
		"No pictures added!",
		file.tag.pictures,
	);
}

/////////////////////////////////////////////

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

/////////////////////////////////////////////

export function createAndSaveImageOnMedia(
	imgAsString: Readonly<ImgString>,
	file: MediaFile,
): void {
	// TODO: see if this still works
	const txtForByteVector = imgAsString.slice(
		imgAsString.indexOf(",") + 1,
		imgAsString.length,
	);
	const mimeType = imgAsString.slice(
		imgAsString.indexOf(":") + 1,
		imgAsString.indexOf(";"),
	);

	dbg({ imgAsString, txtForByteVector, mimeType });

	// fromData
	const picture = Picture.fromFullData(
		ByteVector.fromBase64String(txtForByteVector),
		PictureType.Media,
		mimeType,
		"This image was download when this media was downloaded.",
	);
	picture.filename = "thumbnail";

	file.tag.pictures = [picture];

	dbg("At createImage():", {
		"new file.tag.pictures": file.tag.pictures,
		picture,
	});
}

/////////////////////////////////////////////

function handleAlbumArtists(
	file: MediaFile,
	albumArtists: Readonly<string[]> = [],
): void {
	if (albumArtists.length === 0) return;

	file.tag.albumArtists = albumArtists as Mutable<string[]>;

	dbg({ "new file.tag.albumArtists": file.tag.albumArtists, albumArtists });
}

/////////////////////////////////////////////

function handleGenres(file: MediaFile, genres: Readonly<string[]> = []): void {
	if (genres.length === 0) return;

	file.tag.genres = genres as Mutable<string[]>;
	// TODO:
	// const genres = (value as string)
	// 	.split(separatedByCommaOrSemiColorOrSpace)
	// 	.filter(Boolean)
	// 	.map(v => v.trim());

	dbg({ "new file.tag.genres": file.tag.genres, genres });
}

/////////////////////////////////////////////

function handleAlbum(file: MediaFile, album: Readonly<string> = ""): void {
	if (!album) return;

	file.tag.album = album;

	dbg({ "new file.tag.album": file.tag.album, album });
}

/////////////////////////////////////////////

function handleTitle(
	file: MediaFile,
	oldMediaPath: string,
	title?: string,
): Path {
	if (!title) return "";

	const sanitizedTitle = sanitize(title);
	// If they are the same, there is no
	// need to treat this as a new file:
	if (getBasename(oldMediaPath) === sanitizedTitle) return "";

	const newPath = join(
		dirname(oldMediaPath),
		`${sanitizedTitle}.${getLastExtension(oldMediaPath)}`,
	);

	file.tag.title = sanitizedTitle;

	dbg({ "new file.tag.title": file.tag.title, title, oldMediaPath, newPath });

	return newPath;
}

/////////////////////////////////////////////

async function talkToClientToGetTheNewMedia(
	fileNewPath: Readonly<string>,
	mediaPath: Readonly<string>,
	isNewMedia: Readonly<boolean> = false,
): Promise<void> {
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
	/////////////////////////////////////////////
	else if (isNewMedia)
		// Add the new media:
		sendMsgToClient({
			type: ElectronToReactMessageEnum.ADD_ONE_MEDIA,
			mediaPath,
		});
	/////////////////////////////////////////////
	// If everything else fails, refresh media:
	else
		sendMsgToClient({
			type: ElectronToReactMessageEnum.REFRESH_ONE_MEDIA,
			mediaPath,
		});
}

/////////////////////////////////////////////
// Main function:

export async function writeTags(
	mediaPath: Readonly<Path>,
	data: Readonly<WriteTag & { isNewMedia?: boolean; downloadImg?: boolean; }>,
): Promise<void> {
	dbg("Writing tags to file:", { mediaPath, data });
	checkOrThrow(checkForMediaPath(mediaPath));

	const file = MediaFile.createFromPath(mediaPath);

	// Handle the tags:
	await handleImageMetadata(file, data.imageURL, data.downloadImg);

	const fileNewPath = handleTitle(file, mediaPath, data.title);

	handleAlbumArtists(file, data.albumArtists);

	handleGenres(file, data.genres);

	handleAlbum(file, data.album);

	dbg("New file tags =", file.tag);

	await talkToClientToGetTheNewMedia(fileNewPath, mediaPath, data.isNewMedia);

	// Clean up:
	// DO NOT SEPARATE THESE TWO FUNCTIONS!! I found a bug if so.
	file.save();
	file.dispose();
}
