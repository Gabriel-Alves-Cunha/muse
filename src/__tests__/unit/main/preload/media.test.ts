// @vitest-environment node

import type { ImgString } from "@common/@types/electron-window";

// Getting everything ready for the tests...
import { mockElectronPlusNodeGlobalsBeforeTests } from "../../mockElectronPlusNodeGlobalsBeforeTests";
mockElectronPlusNodeGlobalsBeforeTests();
//

import { readFile, rename as renameFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { File as MediaFile } from "node-taglib-sharp";
import { resolve } from "node:path";

import { mediaPath, mediaPicture, test_assets } from "./utils";
import { dbgTests } from "@common/utils";

const { writeTags } = await import("@main/preload/media");

/////////////////////////////////////////////////////////
// Testing #writeTags()
/////////////////////////////////////////////////////////

describe("It should account for the switch possibilities and the message sending. #writeTags()", () => {
	it("Should be able to write the tag 'title' to a file and change it's basename.", async () => {
		// This test will change the basename of the file, that's why, at the end, we change it back.

		const changedData = Object.freeze({ title: "test title" as const });
		const changedPath = resolve(test_assets, `${changedData.title}.mp3`);

		dbgTests({ changedPath });

		try {
			// Changing the title and basename of the file:
			await writeTags(mediaPath, changedData);

			// Here, the file is renamed and the title is changed.
			const changedTitle = MediaFile.createFromPath(changedPath).tag.title;

			// Assuring that the title and basename are changed:
			expect(changedTitle).toBe(changedData.title);
		} catch (error) {
			console.error(error);
		} finally {
			// Changing the title and basename of the file back:
			await renameFile(changedPath, mediaPath);
		}
	});

	it("Should be able to write the tag 'albumArtists' to a file.", async () => {
		const data = Object.freeze({ albumArtists: ["Test Artist"] as const });

		await writeTags(mediaPath, data);

		const { albumArtists } = MediaFile.createFromPath(mediaPath).tag;

		expect(albumArtists).toEqual(data.albumArtists);
	});

	it("Should be able to write the tag 'album' to a file.", async () => {
		const data = Object.freeze({ album: "Test Album" as const });

		await writeTags(mediaPath, data);

		const { album } = MediaFile.createFromPath(mediaPath).tag;

		expect(album).toBe(data.album);
	});

	it("Should be able erase the tag 'pictures' of file.", async () => {
		const data = Object.freeze({ imageURL: "erase img" as const });

		await writeTags(mediaPath, data);

		const { pictures } = MediaFile.createFromPath(mediaPath).tag;

		expect(pictures.length).toBe(0);
	});

	it("Should be able to write the tag 'imageURL' to a file.", async () => {
		const imgContents = await readFile(mediaPicture, { encoding: "base64" });
		const imgAsString: ImgString = `data:image/png;base64,${imgContents}`;

		const data = Object.freeze({ imageURL: imgAsString });

		await writeTags(mediaPath, data);

		const { pictures } = MediaFile.createFromPath(mediaPath).tag;

		expect(pictures[0].data.toString()).toBe(imgContents);
	});
});
