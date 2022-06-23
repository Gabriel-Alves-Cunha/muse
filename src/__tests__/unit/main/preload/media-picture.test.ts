// @vitest-environment node

import type { ImgString } from "@common/@types/electron-window";

// Getting everything ready for the tests...
import { mockElectronPlusNodeGlobalsBeforeTests } from "../../mockElectronPlusNodeGlobalsBeforeTests";
mockElectronPlusNodeGlobalsBeforeTests();

import { describe, expect, it } from "vitest";
import { File as MediaFile } from "node-taglib-sharp";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const { writeTags, createAndSaveImageOnMedia } = await import(
	"@main/preload/media"
);
import { dbgTests } from "@common/utils";

//////////////////////////////////////
//////////////////////////////////////
//////////////////////////////////////

const originalTitle = "audio for tests" as const;
const mediaPath = resolve(
	__dirname,
	"..",
	"..",
	"..",
	"test_assets",
	`${originalTitle}.mp3`,
);
const mediaPicture = resolve(
	__dirname,
	"..",
	"..",
	"..",
	"test_assets",
	"img for tests.png",
);
const errorMsg = "File pictures length should be 1";

async function getThumbnail() {
	const base64 = await readFile(mediaPicture, { encoding: "base64" });

	const img: ImgString = `data:image/png;base64,${base64}`;

	return img;
}

//////////////////////////////////////
//////////////////////////////////////
//////////////////////////////////////

describe("Test suite to get writeTags() to write a picture into a media.", () => {
	//////////////////////////////////////
	//////////////////////////////////////
	//////////////////////////////////////

	it("Should be able to write the tag 'albumArtists' to a file.", async () => {
		const data = Object.freeze({ albumArtists: ["Test Artist"] as const });

		await writeTags(mediaPath, data);

		const { albumArtists } = MediaFile.createFromPath(mediaPath).tag;

		expect(albumArtists).toEqual(data.albumArtists);
	});

	//////////////////////////////////////
	//////////////////////////////////////
	//////////////////////////////////////

	it("Should be able to write the tag 'picture' to a file.", async () => {
		const file = await MediaFile.createFromPath(mediaPath);

		const imgAsString: ImgString = await getThumbnail();

		await createAndSaveImageOnMedia(imgAsString, file);

		expect(file.tag.pictures.length, errorMsg).toBe(1);

		// dbgTests("New file pictures =", file.tag.pictures);

		file.save();
		file.dispose();

		{
			const file = await MediaFile.createFromPath(mediaPath);

			dbgTests("AFTER: New file pictures =", file.tag.pictures);

			expect(file.tag.pictures.length, errorMsg).toBe(1);
		}
	});
});
