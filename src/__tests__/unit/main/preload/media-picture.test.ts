// @vitest-environment node

import type { ImgString } from "@common/@types/generalTypes";

// Getting everything ready for the tests...
import { mockElectronPlusNodeGlobalsBeforeTests } from "../../mockElectronPlusNodeGlobalsBeforeTests";
mockElectronPlusNodeGlobalsBeforeTests();
//

import { describe, expect, it } from "vitest";
import { File as MediaFile } from "node-taglib-sharp";

import { getThumbnail, anotherMediaPath } from "./utils";
import { eraseImg, makeRandomString } from "@common/utils";

const { writeTags } = await import("@main/preload/media/mutate-metadata");

//////////////////////////////////////
//////////////////////////////////////
//////////////////////////////////////
// Constants:

const errorMsg = "File pictures length should be 1";

//////////////////////////////////////
//////////////////////////////////////
//////////////////////////////////////

describe("Test suite to get writeTags() to write a picture into a media.", () => {
	// This file has to use a different audio file for tests,
	// cause the test files are run in parallel, so it's not
	// possible to use only one file.

	//////////////////////////////////////
	//////////////////////////////////////
	//////////////////////////////////////

	it("Should be able to write the tag 'albumArtists' to a file.", async () => {
		const data = Object.freeze({ albumArtists: [makeRandomString()] });

		await writeTags(anotherMediaPath, data);

		const file = MediaFile.createFromPath(anotherMediaPath);
		expect(file.tag.albumArtists).toStrictEqual(data.albumArtists);

		// Clean up:
		// DO NOT SEPARATE THESE TWO FUNCTIONS!! I found a bug if so.
		file.save();
		file.dispose();
		//

		{
			// Delete it so that git doesn't trigger a file change:
			const data = Object.freeze({ albumArtists: [] });

			await writeTags(anotherMediaPath, data);

			const file = MediaFile.createFromPath(anotherMediaPath);
			expect(file.tag.albumArtists.length).toBe(0);

			// Clean up:
			// DO NOT SEPARATE THESE TWO FUNCTIONS!! I found a bug if so.
			file.save();
			file.dispose();
			//
		}
	});

	//////////////////////////////////////
	//////////////////////////////////////
	//////////////////////////////////////

	it("Should be able to write the tag 'picture' to a file.", async () => {
		const imgAsString: ImgString = await getThumbnail();

		await writeTags(anotherMediaPath, { imageURL: imgAsString });

		const file = MediaFile.createFromPath(anotherMediaPath);
		expect(file.tag.pictures.length, errorMsg).toBe(1);

		// dbgTests("New file pictures =", file.tag.pictures[0]);

		// Clean up:
		// DO NOT SEPARATE THESE TWO FUNCTIONS!! I found a bug if so.
		file.save();
		file.dispose();
		//

		{
			// See if picture remains there after closing it:
			const file = MediaFile.createFromPath(anotherMediaPath);

			// dbgTests("AFTER: New file pictures =", file.tag.pictures);

			expect(file.tag.pictures.length, errorMsg).toBe(1);

			// Clean up:
			// DO NOT SEPARATE THESE TWO FUNCTIONS!! I found a bug if so.
			file.save();
			file.dispose();
			//
		}

		{
			// Delete it so that git doesn't trigger a file change:
			await writeTags(anotherMediaPath, { imageURL: eraseImg });

			const file = MediaFile.createFromPath(anotherMediaPath);
			expect(file.tag.pictures.length, "There should be no pictures.").toBe(0);

			// Clean up:
			// DO NOT SEPARATE THESE TWO FUNCTIONS!! I found a bug if so.
			file.save();
			file.dispose();
			//
		}
	});
});
