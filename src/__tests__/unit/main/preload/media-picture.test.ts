// @vitest-environment node

import type { ImgString } from "@common/@types/electron-window";

// Getting everything ready for the tests...
import { mockElectronPlusNodeGlobalsBeforeTests } from "../../mockElectronPlusNodeGlobalsBeforeTests";
mockElectronPlusNodeGlobalsBeforeTests();
//

import { describe, expect, it } from "vitest";
import { File as MediaFile } from "node-taglib-sharp";

import { getThumbnail, mediaPath } from "./utils";
import { dbgTests } from "@common/utils";

const { writeTags, createAndSaveImageOnMedia } = await import(
	"@main/preload/media"
);

//////////////////////////////////////
//////////////////////////////////////
//////////////////////////////////////

const errorMsg = "File pictures length should be 1";

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
		const file = MediaFile.createFromPath(mediaPath);

		const imgAsString: ImgString = await getThumbnail();

		createAndSaveImageOnMedia(imgAsString, file);

		expect(file.tag.pictures.length, errorMsg).toBe(1);

		// dbgTests("New file pictures =", file.tag.pictures);

		file.save();
		file.dispose();

		{
			const file = MediaFile.createFromPath(mediaPath);

			dbgTests("AFTER: New file pictures =", file.tag.pictures);

			expect(file.tag.pictures.length, errorMsg).toBe(1);
		}
	});
});
