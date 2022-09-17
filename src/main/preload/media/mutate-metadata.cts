/* eslint-disable @typescript-eslint/no-non-null-assertion */

import type { ImageURL, Base64, Path } from "@common/@types/generalTypes";
import type { Mutable } from "@common/@types/utils";
import type { Tags } from "@common/@types/electron-window";

import { readFile, rename } from "node:fs/promises";
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
import { checkOrThrow, validator } from "@common/args-validator";
import { dbg, dbgTests, eraseImg } from "@common/utils";
import { ElectronToReactMessage } from "@common/enums";
import { sendMsgToClient } from "@common/crossCommunication";
import { doesPathExists } from "../file.cjs";
import { isBase64Image } from "@main/utils.cjs";
import { emptyString } from "@common/empty";

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
	downloadImg = false,
	imageURL: ImageURL = emptyString,
): Promise<void> {
	if (downloadImg === true) {
		try {
			dbg("Downloading picture...");

			file.tag.pictures = await downloadThumbnail(imageURL);
		} catch (err) {
			error("There was an error getting the picture data.", err);

			// Send error to client:
			sendMsgToClient({
				type: ElectronToReactMessage.ERROR,
				error: err as Error,
			});
		}

		return;
	}

	/////////////////////////////////////////////

	// From here on, if there is no URL, then do nothing.
	if (!imageURL) return;

	/////////////////////////////////////////////

	// if imageURL === "erase img" => erase img so we
	// don't keep getting an error on the browser.
	if (imageURL === eraseImg) {
		dbgTests("Erasing picture.");
		file.tag.pictures = [];

		return;
	}

	/////////////////////////////////////////////

	// if received a base64 image:
	if (isBase64Image(imageURL))
		return createAndSaveImageOnMedia(imageURL as Base64, file);

	/////////////////////////////////////////////

	// else, it's an image file path
	if (await doesPathExists(imageURL)) {
		const base64 = await readFile(imageURL, { encoding: "base64" }) as Base64;

		dbg({ base64 });

		createAndSaveImageOnMedia(base64, file);
	}
}

/////////////////////////////////////////////

export async function downloadThumbnail(
	url: Readonly<string>,
): Promise<Picture[]> {
	return new Promise((resolve, reject) =>
		get(url, async res => {
			const byteVector = await ByteVector.fromStream(res);
			const mimeType = res.headers["content-type"] ?? emptyString;

			const picture = Picture.fromFullData(
				byteVector,
				PictureType.Media,
				mimeType,
				"This thumbnail was download when this media was downloaded.",
			);

			dbg("Header of thumbnail download and picture =", { res, picture });

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
	imgAsString: Base64,
	file: MediaFile,
): void {
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
	albumArtists: string | readonly string[],
): void {
	if (albumArtists instanceof Array)
		file.tag.albumArtists = albumArtists as Mutable<string[]>;
	else if (typeof albumArtists === "string")
		file.tag.albumArtists = [albumArtists];

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

function handleLyrics(file: MediaFile, lyrics: string): void {
	file.tag.lyrics = lyrics;

	dbg({ "new file.tag.lyrics": file.tag.lyrics, lyrics });
}

/////////////////////////////////////////////

/** Returns a new file name if it exists, otherwise, just an empty string. */
function handleTitle(
	file: MediaFile,
	oldMediaPath: string,
	title: string,
): Path {
	const sanitizedTitle = sanitize(title);
	// If they are the same, there is no need to treat this as a new
	// file, or if the sanitization left an empty string, return "":
	if (getBasename(oldMediaPath) === sanitizedTitle || !sanitizedTitle)
		return emptyString;

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
	newPathOfFile: string,
	mediaPath: string,
	isNewMedia = false,
): Promise<void> {
	if (newPathOfFile)
		try {
			await rename(mediaPath, newPathOfFile);

			// Since media has a new path, create a new media...
			sendMsgToClient({
				type: ElectronToReactMessage.ADD_ONE_MEDIA,
				mediaPath: newPathOfFile,
			});

			// and remove old one
			sendMsgToClient({
				type: ElectronToReactMessage.REMOVE_ONE_MEDIA,
				mediaPath,
			});
		} catch (error) {
			// Send error to react process: (error renaming file => file has old path)
			sendMsgToClient({
				type: ElectronToReactMessage.ERROR,
				error: error as Error,
			});

			// Since there was an error, let's at least refresh media:
			sendMsgToClient({
				type: ElectronToReactMessage.REFRESH_ONE_MEDIA,
				mediaPath,
			});
		} finally {
			dbg(
				"Was file renamed?",
				await doesPathExists(newPathOfFile),
				"Does old file remains?",
				await doesPathExists(mediaPath),
			);
		}
	/////////////////////////////////////////////
	else if (isNewMedia)
		// Add the new media:
		sendMsgToClient({ type: ElectronToReactMessage.ADD_ONE_MEDIA, mediaPath });
	/////////////////////////////////////////////
	// If everything else fails, at least refresh media:
	else
		sendMsgToClient({
			type: ElectronToReactMessage.REFRESH_ONE_MEDIA,
			mediaPath,
		});
}

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Main function:

export async function writeTags(
	mediaPath: Path,
	data: WriteTagsData,
): Promise<void> {
	// dbgTests("Writing tags to file:", { mediaPath, data });
	checkOrThrow(checkForMediaPath(mediaPath));

	const file = MediaFile.createFromPath(mediaPath);

	// Handle the tags:
	if (data.imageURL || data.downloadImg === true) {
		await handleImageMetadata(file, data.downloadImg, data.imageURL);

		console.assert(
			file.tag.pictures.length === 1,
			"No pictures added!",
			file.tag.pictures,
		);
	}

	const newPathOfFile = data.title ?
		handleTitle(file, mediaPath, data.title) :
		emptyString;

	if (data.albumArtists !== undefined)
		handleAlbumArtists(file, data.albumArtists);

	if (data.genres !== undefined)
		handleGenres(file, data.genres);

	if (data.album !== undefined)
		handleAlbum(file, data.album);

	if (data.lyrics !== undefined)
		handleLyrics(file, data.lyrics);

	dbg("New file tags =", file.tag);

	// Clean up:
	// DO NOT SEPARATE THESE TWO FUNCTIONS!! I found a bug if so.
	file.save();
	file.dispose();
	//

	await talkToClientSoItCanGetTheNewMedia(
		newPathOfFile,
		mediaPath,
		data.isNewMedia,
	);
}

interface WriteTagsData extends Tags {
	readonly downloadImg?: boolean;
	readonly isNewMedia?: boolean;
}
