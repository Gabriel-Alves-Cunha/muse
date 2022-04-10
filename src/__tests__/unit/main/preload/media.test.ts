import type { ImgString } from "@common/@types/electron-window";

import { readFile, rename as renameFile } from "fs/promises";
import { describe, expect, it, vi } from "vitest";
import { File as MediaFile } from "node-taglib-sharp";
import { resolve } from "path";

// Getting everything ready for the tests...

// Mocking `global.electron` before importing code that calls it:
global.electron = {
	notificationApi: {
		receiveMsgFromElectron: vi.fn(),
	},
	fs: {
		getFullPathOfFilesForFilesInThisDirectory: vi.fn(),
		readdir: vi.fn(),
		readFile: vi.fn(),
		deleteFile: vi.fn(),
	},
	os: {
		homeDir: "test/homeDir",
		dirs: {
			documents: "test/documents",
			downloads: "test/downloads",
			music: "test/music",
		},
	},
	media: {
		transformPathsToMedias: vi.fn(),
		convertToAudio: vi.fn(),
		writeTags: vi.fn(),
		getBasicInfo: vi.fn(),
	},
};

import { writeTags } from "@main/preload/media";

const originalTitle = "audio for tests" as const;
const mediaPath = resolve(
	__dirname,
	"..",
	"..",
	"..",
	"test_assets",
	`${originalTitle}.mp3`,
);

// console.log({ mediaPath });

// data: Readonly<Readonly<{
//     albumArtists?: readonly string[];
//     genres?: readonly string[];
//     imageURL?: string;
//     album?: string;
//     title?: string;
// }> & {
//     downloadImg?: boolean;
//     isNewMedia?: boolean;
// }>

/////////////////////////////////////////////////////////
// Testing #writeTags()
/////////////////////////////////////////////////////////

describe("It should account for the switch possibilities and the message sending. #writeTags()", () => {
	it("Should be able to write the tag 'title' to a file and change it's basename.", async () => {
		// This test will change the basename of the file, that's why, at the end, we change it back.

		const changedData = Object.freeze({ title: "test title" as const });
		const changedPath = resolve(
			__dirname,
			"..",
			"..",
			"..",
			"test_assets",
			`${changedData.title}.mp3`,
		);

		// Changing the title and basename of the file:
		await writeTags(mediaPath, changedData);

		// Here, the file is renamed and the title is changed.
		const {
			tag: { title: changedTitle },
		} = MediaFile.createFromPath(changedPath);

		// Assuring that the title and basename are changed:
		expect(changedTitle).toBe(changedData.title);

		// Changing the title and basename of the file back:
		await renameFile(changedPath, mediaPath);
	});

	it("Should be able to write the tag 'albumArtists' to a file.", async () => {
		const data = Object.freeze({ albumArtists: ["Test Artist"] as const });

		await writeTags(mediaPath, data);

		const {
			tag: { albumArtists },
		} = MediaFile.createFromPath(mediaPath);

		expect(albumArtists).toEqual(data.albumArtists);
	});

	it("Should be able to write the tag 'album' to a file.", async () => {
		const data = Object.freeze({ album: "Test Album" as const });

		await writeTags(mediaPath, data);

		const {
			tag: { album },
		} = MediaFile.createFromPath(mediaPath);

		expect(album).toBe(data.album);
	});

	it("Should be able erase the tag 'pictures' of file.", async () => {
		const data = Object.freeze({ imageURL: "erase img" as const });

		await writeTags(mediaPath, data);

		const {
			tag: { pictures },
		} = MediaFile.createFromPath(mediaPath);

		expect(pictures.length).toBe(0);
	});

	it("Should be able to write the tag 'imageURL' to a file.", async () => {
		const imgPath = resolve(
			__dirname,
			"..",
			"..",
			"..",
			"test_assets",
			"img for tests.png",
		);
		const imgContents = await readFile(imgPath, {
			encoding: "base64",
		});
		const imgAsString: ImgString = `data:image/png;base64,${imgContents}`;

		const data = Object.freeze({ imageURL: imgAsString });

		await writeTags(mediaPath, data);

		const {
			tag: { pictures },
		} = MediaFile.createFromPath(mediaPath);

		expect(pictures[0].data.toString()).toBe(imgContents);
	});
});

/////////////////////////////////////////////////////////
// Testing #getThumbnail()
/////////////////////////////////////////////////////////

// describe("Testing #getThumbnail()", () => {
// 	it("should get a response like: 'data:${res.headers['content-type']};base64,'", async () => {
// 		// const imgAsString = await getThumbnail();

// 		expect(imgAsString).includes("data:image/png");
// 		expect(imgAsString).includes(";base64,");
// 	});
// });
