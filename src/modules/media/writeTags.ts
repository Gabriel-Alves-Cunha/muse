import type { ImageURL, Base64, Path } from "types/generalTypes";
import type { Mutable } from "types/utils";
import type { Tags } from "types/generalTypes";

import { fetch, ResponseType } from "@tauri-apps/api/http";
import { readFile, rename } from "fs/promises";
import { join, dirname } from "node:path";
import { existsSync } from "node:fs";
import {
	File as MediaFile,
	PictureType,
	ByteVector,
	Picture,
} from "node-taglib-sharp";
import sanitize from "sanitize-filename";

import { error, assert, throwErr, log, dbg } from "@utils/log";
import { getBasename, getLastExtension } from "@utils/path";
import { isBase64Image } from "@utils/utils";
import { deleteFile } from "@utils/deleteFile";
import { eraseImg } from "@utils/utils";
import {
	addToMainList,
	removeMedia,
	rescanMedia,
} from "@contexts/usePlaylists";

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Helper functions for `writeTags`:

async function handleImageMetadata(
	file: MediaFile,
	downloadImg = false,
	imageURL: ImageURL = "",
): Promise<void> {
	if (downloadImg) {
		try {
			log("Downloading picture.");

			file.tag.pictures = await downloadThumbnail(imageURL);

			log("Picture downloaded successfully!", file.tag.pictures[0]);
		} catch (err) {
			error("Error getting picture data:", err);
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
		dbg("Erasing picture.");
		file.tag.pictures = [];

		return;
	}

	/////////////////////////////////////////////

	// if received a base64 image:
	if (isBase64Image(imageURL))
		return createAndSaveImageOnMedia(imageURL as Base64, file);

	/////////////////////////////////////////////

	// else, it's an image file path
	if (existsSync(imageURL)) {
		const base64 = (await readFile(imageURL, { encoding: "base64" })) as Base64;

		dbg("readFile should be base64[0..100] =", base64.slice(0, 100));

		createAndSaveImageOnMedia(base64, file);
	}
}

/////////////////////////////////////////////

export async function downloadThumbnail(url: string): Promise<Picture[]> {
	try {
		const response = await fetch(url, {
			responseType: ResponseType.Binary,
			method: "GET",
		});

		dbg("downloadThumbnail response =", response);

		if (!response.ok) throwErr("Fetch failed!");

		const byteVector = ByteVector.fromByteArray(response.data);
		const mimeType = response.headers["content-type"];

		if (!mimeType) throwErr("No mimeType!");

		const picture = Picture.fromFullData(
			byteVector,
			PictureType.Media,
			mimeType,
			"This thumbnail was downloaded with this media.",
		);

		dbg("Picture =", picture);

		return [picture];
	} catch (e) {
		error("Got error downloading image!\n\n", e);

		return [];
	}
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
		"This image was downloaded with this media.",
	);

	file.tag.pictures = [picture];

	dbg("At createImage():", {
		"new file.tag.pictures": file.tag.pictures,
		picture,
	});
}

/////////////////////////////////////////////
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
		return "";

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
			addToMainList(newPathOfFile);

			// and remove old one
			// await deleteFile(mediaPath);
			removeMedia(mediaPath);
		} catch (err) {
			error(err);

			// Since there was an error, let's at least refresh media:
			await rescanMedia(mediaPath);
		} finally {
			dbg(
				"Was file renamed?",
				existsSync(newPathOfFile),
				"Does old file remains?",
				existsSync(mediaPath),
			);
		}
	/////////////////////////////////////////////
	else if (isNewMedia)
		// Add the new media:
		addToMainList(mediaPath);
	/////////////////////////////////////////////
	// If everything else fails, at least refresh media:
	else await rescanMedia(mediaPath);
}

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Main function:

export async function writeTags(
	mediaPath: Path,
	{
		albumArtists,
		downloadImg,
		isNewMedia,
		imageURL,
		genres,
		lyrics,
		album,
		title,
	}: WriteTagsData,
): Promise<void> {
	// dbgTests("Writing tags to file:", { mediaPath, data });

	if (!mediaPath)
		throwErr(`A media path is required. Received: "${mediaPath}".`);

	const file = MediaFile.createFromPath(mediaPath);

	// Handle the tags:
	if (imageURL || downloadImg) {
		await handleImageMetadata(file, downloadImg, imageURL);

		assert(
			file.tag.pictures.length === 1,
			"No pictures added!",
			file.tag.pictures,
		);
	}

	const newFilePath = title ? handleTitle(file, mediaPath, title) : "";

	if (albumArtists !== undefined)
		if (albumArtists instanceof Array)
			file.tag.albumArtists = albumArtists as Mutable<string[]>;
		else if (typeof albumArtists === "string")
			file.tag.albumArtists = [albumArtists];

	if (genres) file.tag.genres = genres as Mutable<string[]>;

	if (album !== undefined) file.tag.album = album;

	if (lyrics !== undefined) file.tag.lyrics = lyrics;

	dbg("New file tags =", file.tag);

	// Clean up:
	// DO NOT SEPARATE THESE TWO FUNCTIONS!! I found a bug if so.
	file.save();
	file.dispose();
	//

	await talkToClientSoItCanGetTheNewMedia(newFilePath, mediaPath, isNewMedia);
}

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Types:

type WriteTagsData = Tags & {
	albumArtists?: readonly string[] | string;
	downloadImg?: boolean;
	isNewMedia?: boolean;
};
