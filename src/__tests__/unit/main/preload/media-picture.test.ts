// @vitest-environment node

import type { ImgString } from "@common/@types/generalTypes";

// Getting everything ready for the tests...
import { mockElectronPlusNodeGlobalsBeforeTests } from "../../mockElectronPlusNodeGlobalsBeforeTests";
mockElectronPlusNodeGlobalsBeforeTests();
//

import { describe, expect, it } from "vitest";
import { File as MediaFile } from "node-taglib-sharp";

import { getThumbnail, anotherMediaPath } from "./utils";
import { dbgTests, makeRandomString } from "@common/utils";

const { writeTags, createAndSaveImageOnMedia } = await import(
	"@main/preload/media/mutate-metadata"
);

//////////////////////////////////////
//////////////////////////////////////
//////////////////////////////////////
// Constants:

const errorMsg = "File pictures length should be 1";

//////////////////////////////////////
//////////////////////////////////////
//////////////////////////////////////

describe("Test suite to get writeTags() to write a picture into a media.", () => {
	//////////////////////////////////////
	//////////////////////////////////////
	//////////////////////////////////////

	it("Should be able to write the tag 'albumArtists' to a file.", async () => {
		const data = Object.freeze({ albumArtists: [makeRandomString()] });

		await writeTags(anotherMediaPath, data);

		const { albumArtists } = MediaFile.createFromPath(anotherMediaPath).tag;

		expect(albumArtists).toEqual(data.albumArtists);
	});

	//////////////////////////////////////
	//////////////////////////////////////
	//////////////////////////////////////

	it("Should be able to write the tag 'picture' to a file.", async () => {
		const file = MediaFile.createFromPath(anotherMediaPath);

		const imgAsString: ImgString = await getThumbnail();

		createAndSaveImageOnMedia(imgAsString, file);

		expect(file.tag.pictures.length, errorMsg).toBe(1);

		// dbgTests("New file pictures =", file.tag.pictures);

		file.save();
		file.dispose();

		{
			const file = MediaFile.createFromPath(anotherMediaPath);

			dbgTests("AFTER: New file pictures =", file.tag.pictures);

			expect(file.tag.pictures.length, errorMsg).toBe(1);
		}
	});
});
