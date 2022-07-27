/* eslint-disable @typescript-eslint/no-non-null-assertion */

import type { Path, ImgString, Mutable } from "@common/@types/generalTypes";
import type { Tags } from "@common/@types/electron-window";

import { rename as renameFile } from "node:fs/promises";
import { dirname, join } from "node:path";
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
import { dbg, dbgTests, eraseImg } from "@common/utils";
import { sendMsgToClient } from "@common/crossCommunication";
import { pathExists } from "../file";

const { error } = console;

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
	downloadImg: Readonly<boolean> = false,
	imageURL: Readonly<typeof eraseImg | ImgString | string>,
): Promise<void> {
	if (downloadImg) {
		try {
			dbg("Downloading picture...");

			file.tag.pictures = await downloadThumbnail(imageURL);

			console.assert(
				file.tag.pictures.length === 1,
				"[Error] No pictures were added!",
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

	// if imageURL === "erase img" => erase img so we
	// don't keep getting an error on the browser.
	if (imageURL === eraseImg) {
		dbgTests("Erasing picture.");
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
): Promise<Picture[]> {
	return new Promise((resolve, reject) =>
		get(url, async res => {
			const byteVector = await ByteVector.fromStream(res);

			const picture = Picture.fromFullData(
				byteVector,
				PictureType.Media,
				res.headers["content-type"] ?? "undefined",
				"This image was download when this media was downloaded.",
			);

			resolve([picture]);
		})
			.on("error", e => {
				error("Got error getting image on Electron side!\n\n", e);
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

	file.tag.pictures = [picture];

	dbg("At createImage():", {
		"new file.tag.pictures": file.tag.pictures,
		picture,
	});
}

/////////////////////////////////////////////

function handleAlbumArtists(
	file: MediaFile,
	albumArtists: Readonly<string[]>,
): void {
	file.tag.albumArtists = albumArtists as Mutable<string[]>;

	dbg({ "new file.tag.albumArtists": file.tag.albumArtists, albumArtists });
}

/////////////////////////////////////////////

function handleGenres(file: MediaFile, genres: Readonly<string[]>): void {
	file.tag.genres = genres as Mutable<string[]>;

	dbg({ "new file.tag.genres": file.tag.genres, genres });
}

/////////////////////////////////////////////

function handleAlbum(file: MediaFile, album: string): void {
	file.tag.album = album;

	dbg({ "new file.tag.album": file.tag.album, album });
}

/////////////////////////////////////////////

/** Returns a new file name if it exists, otherwise, just an empty string. */
function handleTitle(
	file: MediaFile,
	oldMediaPath: string,
	title: string,
): Path {
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

async function talkToClientSoItCanGetTheNewMedia(
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
	// If everything else fails, at least refresh media:
	else
		sendMsgToClient({
			type: ElectronToReactMessageEnum.REFRESH_ONE_MEDIA,
			mediaPath,
		});
}

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Main function:

export async function writeTags(
	mediaPath: Readonly<Path>,
	data: Readonly<Tags & { isNewMedia?: boolean; downloadImg?: boolean; }>,
): Promise<void> {
	// dbgTests("Writing tags to file:", { mediaPath, data });
	checkOrThrow(checkForMediaPath(mediaPath));

	const file = MediaFile.createFromPath(mediaPath);

	// Handle the tags:
	data.imageURL !== undefined &&
		await handleImageMetadata(file, data.downloadImg, data.imageURL);

	const fileNewPath = data.title !== undefined ?
		handleTitle(file, mediaPath, data.title) :
		"";

	data.albumArtists && handleAlbumArtists(file, data.albumArtists);

	data.genres && handleGenres(file, data.genres);

	data.album !== undefined && handleAlbum(file, data.album);

	dbg("New file tags =", file.tag);

	// Clean up:
	// DO NOT SEPARATE THESE TWO FUNCTIONS!! I found a bug if so.
	file.save();
	file.dispose();
	//

	await talkToClientSoItCanGetTheNewMedia(
		fileNewPath,
		mediaPath,
		data.isNewMedia,
	);
}
