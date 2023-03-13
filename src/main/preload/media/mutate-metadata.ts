import type { ImageURL, Base64, Path } from "@common/@types/GeneralTypes";
import type { Mutable } from "@common/@types/Utils";
import type { Tags } from "@common/@types/ElectronApi";

import { existsSync, renameSync } from "node:fs";
import { dirname, join } from "node:path";
import { readFile } from "node:fs/promises";
import { get } from "node:https";
import {
	File as MediaFile,
	PictureType,
	ByteVector,
	Picture,
} from "node-taglib-sharp";
import sanitize from "sanitize-filename";

import { getBasename, getLastExtension } from "@common/path";
import { error, assert, throwErr, log } from "@common/log";
import { ElectronToReactMessageEnum } from "@common/enums";
import { sendMsgToClient } from "@common/crossCommunication";
import { isBase64Image } from "@main/utils";
import { eraseImg } from "@common/utils";
import { dbg } from "@common/debug";

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

			// Send error to client:
			sendMsgToClient({
				type: ElectronToReactMessageEnum.ERROR,
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

		createAndSaveImageOnMedia(base64, file);
	}
}

/////////////////////////////////////////////

export const downloadThumbnail = async (url: string): Promise<Picture[]> =>
	new Promise((resolve, reject) =>
		get(url, async (res) => {
			const byteVector = await ByteVector.fromStream(res);
			const mimeType = res.headers["content-type"];

			if (!mimeType) throwErr("No mimeType!");

			const picture = Picture.fromFullData(
				byteVector,
				PictureType.Media,
				mimeType,
				"This thumbnail was downloaded with this media.",
			);

			dbg("Header of thumbnail download and picture =", { res, picture });

			resolve([picture]);
		}).on("error", (e) => {
			error("Got error getting image on Electron side!\n\n", e);
			return reject(e);
		}),
	);

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

	log("At createImage():", {
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

function talkToClientSoItCanGetTheNewMedia(
	newPathOfFile: string,
	mediaPath: string,
	isNewMedia = false,
): void {
	if (newPathOfFile)
		try {
			renameSync(mediaPath, newPathOfFile);

			// Since media has a new path, create a new media...
			sendMsgToClient({
				type: ElectronToReactMessageEnum.ADD_ONE_MEDIA,
				mediaPath: newPathOfFile,
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
				type: ElectronToReactMessageEnum.RESCAN_ONE_MEDIA,
				mediaPath,
			});
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
		sendMsgToClient({
			type: ElectronToReactMessageEnum.ADD_ONE_MEDIA,
			mediaPath,
		});
	/////////////////////////////////////////////
	// If everything else fails, at least refresh media:
	else
		sendMsgToClient({
			type: ElectronToReactMessageEnum.RESCAN_ONE_MEDIA,
			mediaPath,
		});
}

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Main function:

export function writeTags(
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
): void {
	// dbgTests("Writing tags to file:", { mediaPath, data });
	if (!mediaPath)
		throwErr(`A media path is required. Received: "${mediaPath}".`);

	const file = MediaFile.createFromPath(mediaPath);

	// Handle the tags:
	if (imageURL || downloadImg) {
		handleImageMetadata(file, downloadImg, imageURL).then();

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

	talkToClientSoItCanGetTheNewMedia(newFilePath, mediaPath, isNewMedia);
}

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Types:

type WriteTagsData = Tags & {
	downloadImg?: boolean;
	isNewMedia?: boolean;
};
