import { readFile, rename as renameFile } from "fs/promises";
import { describe, expect, it, vi } from "vitest";
import { resolve } from "path";
import {
	File as MediaFile,
	// PictureType,
	// ByteVector,
	// StringType,
	// Picture,
} from "node-taglib-sharp";

// Getting everything ready for the tests
import { addListeners } from "@main/preload/notificationApi";

// Mocking `global.electron` before importing code that calls it:
global.electron = {
	notificationApi: {
		sendNotificationToElectron: vi.fn(),
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
		getInfo: vi.fn(),
	},
};

import { usePlaylists } from "@contexts";

const { getState: getUsePlaylistsFunctions } = usePlaylists;
const addListenersForReactSide = getUsePlaylistsFunctions().addListeners;

const { port1: reactPort, port2 } = new MessageChannel();

const electronPort = addListeners(port2);

// @ts-ignore Mocking window for 'writeTags' testing:
global.window = {
	twoWayComm_React_Electron: addListenersForReactSide(reactPort),
};

import { writeTags } from "@main/preload/media";
import { ImgString } from "@common/@types/electron-window";

const originalTitle = "audio for tests" as const;
const mediaPath = resolve(
	__dirname,
	"..",
	"..",
	"..",
	"test_assets",
	`${originalTitle}.mp3`,
);

console.log({ mediaPath });

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

describe("It should account for the switch possibilities and the message sending. #writeTags()", async () => {
	it("Should be able to write the tag 'albumArtists' to a file.", async () => {
		const data = Object.freeze({ albumArtists: ["Test Artist"] as const });

		await writeTags(mediaPath, data);

		const {
			tag: { albumArtists },
		} = MediaFile.createFromPath(mediaPath);

		expect(albumArtists).toEqual(data.albumArtists);
	});

	it("Should be able to write the tag 'title' to a file.", async () => {
		// This test will change the basename of the file, that's why, at the end, we change it back.

		const changedData = Object.freeze({ title: "Test Title" as const });
		const changedPath = resolve(
			__dirname,
			"..",
			"..",
			"..",
			"test_assets",
			`${changedData.title}.mp3`,
		);

		try {
			// Changing the title and basename of the file:
			await writeTags(mediaPath, changedData);

			// Here, the file is renamed and the title is changed.
			const {
				tag: { title: changedTitle },
			} = MediaFile.createFromPath(changedPath);

			// Assuring that the title and basename are changed:
			expect(changedTitle).toEqual(changedData.title);
		} finally {
			// Let's get back to original title/basename:
			await renameFile(changedPath, mediaPath);
		}
	});

	it("Should be able to write the tag 'album' to a file.", async () => {
		const data = Object.freeze({ album: "Test Album" as const });

		await writeTags(mediaPath, data);

		const {
			tag: { album },
		} = MediaFile.createFromPath(mediaPath);

		expect(album).toBe(data.album);
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
