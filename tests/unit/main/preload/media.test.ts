// @vitest-environment node

import type { Base64 } from "@common/@types/GeneralTypes";

// Getting everything ready for the tests...
import "@tests/unit/mockElectronPlusNodeGlobalsBeforeTests";

import { readFile, rename as renameFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { File as MediaFile } from "node-taglib-sharp";
import { existsSync } from "node:fs";
import { join } from "node:path";

import { mediaPath, mediaPicture, test_assetsDir } from "./utils";
import { eraseImg, makeRandomString } from "@common/utils";
import { writeTags } from "@main/preload/media/mutate-metadata";
import { error } from "@common/log";

//////////////////////////////////////
//////////////////////////////////////
//////////////////////////////////////

describe("It should account for the switch possibilities and the message sending. #writeTags()", () => {
	//////////////////////////////////////
	//////////////////////////////////////
	//////////////////////////////////////

	it("Should be able to write the tag 'title' to a file and change it's basename.", async () => {
		// This test will change the basename of the file, that's why, at the end, we change it back.

		const data = Object.freeze({ title: makeRandomString() });
		const changedPath = join(test_assetsDir, `${data.title}.mp3`);

		try {
			// Changing the title and basename of the file:
			writeTags(mediaPath, data);

			// Here, the file is renamed and the title is changed.
			// Assuring that the title and basename are changed before closing file:
			const file = MediaFile.createFromPath(changedPath);
			expect(
				file.tag.title,
				"The FIRST check to see if the 'title' has changed.",
			).toBe(data.title);

			// Clean up:
			// DO NOT SEPARATE THESE TWO FUNCTIONS!! I found a bug if so.
			file.save();
			file.dispose();
			//

			{
				// Open file again to see if the change persisted:
				const file = MediaFile.createFromPath(changedPath);
				expect(
					file.tag.title,
					"The SECOND check to see if the 'title' has changed.",
				).toBe(data.title);

				// And change the title back to a default value so that git
				// doesn't trigger a file change:
				file.tag.title = "";
				expect(
					file.tag.title,
					"The THIRD check to see if the 'title' has changed back to default value.",
				).toBe(undefined); // That's what the lib returns. instead of an empty string...

				// Clean up:
				// DO NOT SEPARATE THESE TWO FUNCTIONS!! I found a bug if so.
				file.save();
				file.dispose();
				//
			}
		} catch (error) {
			throw error as Error;
		} finally {
			try {
				// Changing the title and basename of the file back:
				await renameFile(changedPath, mediaPath);

				expect(
					existsSync(mediaPath),
					"There should be a mediaPath renamed back to it's original path before tests were run!",
				).toBe(true);
			} catch (err) {
				error(err);
			}
		}
	});

	//////////////////////////////////////
	//////////////////////////////////////
	//////////////////////////////////////

	it("Should be able to write the tag 'albumArtists' to a file.", () => {
		const data = Object.freeze({ albumArtists: [makeRandomString()] });

		writeTags(mediaPath, data);

		const file = MediaFile.createFromPath(mediaPath);
		expect(
			file.tag.albumArtists,
			"The FIRST check to see if the 'albumArtists' has changed.",
		).toStrictEqual(data.albumArtists);

		// Clean up:
		// DO NOT SEPARATE THESE TWO FUNCTIONS!! I found a bug if so.
		file.save();
		file.dispose();
		//

		{
			// Open file again to see if the change persisted:
			const file = MediaFile.createFromPath(mediaPath);
			expect(
				file.tag.albumArtists,
				"The SECOND check to see if 'albumArtists' has changed.",
			).toStrictEqual(data.albumArtists);

			// And change the albumArtists back to a default value so that git
			// doesn't trigger a file change:
			file.tag.albumArtists = [""];
			expect(
				file.tag.albumArtists.length,
				"The THIRD check to see if 'albumArtists' has changed back to it's default value.",
			).toBe(0);

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

	it("Should be able to write the tag 'album' to a file.", () => {
		const data = Object.freeze({ album: makeRandomString() });

		writeTags(mediaPath, data);

		const file = MediaFile.createFromPath(mediaPath);
		expect(
			file.tag.album,
			"The FIRST check to see if 'album' has changed.",
		).toBe(data.album);

		// Clean up:
		// DO NOT SEPARATE THESE TWO FUNCTIONS!! I found a bug if so.
		file.save();
		file.dispose();
		//

		{
			// Open file again to see if the change persisted:
			const file = MediaFile.createFromPath(mediaPath);
			expect(
				file.tag.album,
				"The SECOND check to see if 'album' has changed.",
			).toBe(data.album);

			// And change the album back to a default value so that git
			// doesn't trigger a file change:
			file.tag.album = "";
			expect(
				file.tag.album,
				"The THIRD check to see if 'album' has changed back to default value.",
			).toBe(undefined); // That's what the lib returns. instead of an empty string...

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

	it("Should be able to write the tag 'imageURL' to a file.", async () => {
		const imgContents = await readFile(mediaPicture, { encoding: "base64" });
		const imgAsString: Base64 = `data:image/png;base64,${imgContents}`;
		const data = Object.freeze({ imageURL: imgAsString });

		writeTags(mediaPath, data);

		const file = MediaFile.createFromPath(mediaPath);
		expect(
			file.tag.pictures[0]?.data.toBase64String(),
			"`file.tag.pictures[0]?.data.toBase64String()` !== `imgContents`",
		).toBe(imgContents);

		// Clean up:
		// DO NOT SEPARATE THESE TWO FUNCTIONS!! I found a bug if so.
		file.save();
		file.dispose();
		//

		{
			// Open file again to see if the change persisted:
			const file = MediaFile.createFromPath(mediaPath);
			expect(
				file.tag.pictures.length,
				"At this point, there should be one picture.",
			).toBe(1);

			// Clean up:
			// DO NOT SEPARATE THESE TWO FUNCTIONS!! I found a bug if so.
			file.save();
			file.dispose();
			//
		}

		it("Should be able erase the tag 'pictures' of file.", () => {
			const data = Object.freeze({ imageURL: eraseImg });

			writeTags(mediaPath, data);

			const file = MediaFile.createFromPath(mediaPath);
			expect(file.tag.pictures.length).toBe(0);

			// Clean up:
			// DO NOT SEPARATE THESE TWO FUNCTIONS!! I found a bug if so.
			file.save();
			file.dispose();
			//

			{
				// Open file again to see if the change persisted:
				const file = MediaFile.createFromPath(mediaPath);
				expect(file.tag.pictures.length).toBe(0);

				// Clean up:
				// DO NOT SEPARATE THESE TWO FUNCTIONS!! I found a bug if so.
				file.save();
				file.dispose();
				//
			}
		});
	});
});
