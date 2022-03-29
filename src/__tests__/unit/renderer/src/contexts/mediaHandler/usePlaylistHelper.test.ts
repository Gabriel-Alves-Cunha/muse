/* eslint-disable @typescript-eslint/no-non-null-assertion */
import type { Media } from "@common/@types/typesAndEnums";

import { describe, expect, it, vi } from "vitest";
import { faker } from "@faker-js/faker";

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

import {
	maxSizeOfHistory,
	returnNewArrayWithNewMediaOnHistoryOfPlayedMedia,
} from "@contexts/mediaHandler/usePlaylistsHelper";
import { formatDuration } from "@common/utils";
import { hash } from "@common/hash";

// Make a test list full of fake medias:
const numberOfMedias = 10;
const testList: Media[] = [];
for (let index = 0; index < numberOfMedias; ++index) {
	const title = faker.unique(faker.name.title);

	testList.push({
		dateOfArival: faker.date.past().getTime(),
		duration: formatDuration(index + 10),
		path: `home/Music/test/${title}.mp3`,
		id: hash(title),
		size: "3.0 MB",
		title,
		index,
	});
}

describe("returnNewArrayWithNewMediaOnHistoryOfPlayedMedia", () => {
	it("should return a NEW array with new item(s) at the start of the array", () => {
		for (let i = 0; i < numberOfMedias; ++i) {
			const prevHistory: readonly Media[] = Object.freeze([]);
			const newMediaToAdd = testList[i];

			const newList = [newMediaToAdd, ...prevHistory];
			const expectedNewList = returnNewArrayWithNewMediaOnHistoryOfPlayedMedia(
				prevHistory,
				newMediaToAdd,
			);

			expect(expectedNewList).not.toBe(prevHistory);
			expect(expectedNewList).toEqual(newList);
		}
	});

	it(`have a maximum size of ${maxSizeOfHistory}`, () => {
		expect(testList.length).toBe(10);

		const prevHistory = [];
		for (let i = 0; i < testList.length; ++i) prevHistory.push(...testList);
		prevHistory.pop();
		Object.freeze(prevHistory);

		expect(prevHistory.length).toBe(99);

		const newMediaToAdd_1 = testList[5];
		const newMediaToAdd_2 = testList[7];

		const newList = [newMediaToAdd_1, ...prevHistory];
		const expectedNewList_1 = returnNewArrayWithNewMediaOnHistoryOfPlayedMedia(
			prevHistory,
			newMediaToAdd_1,
		);

		expect(expectedNewList_1).not.toBe(prevHistory);
		expect(expectedNewList_1).toEqual(newList);
		expect(expectedNewList_1.length).toBe(100);

		const expectedNewList_2 = returnNewArrayWithNewMediaOnHistoryOfPlayedMedia(
			prevHistory,
			newMediaToAdd_2,
		);

		expect(expectedNewList_2).not.toBe(expectedNewList_1);
		expect(expectedNewList_2[0]).toBe(newMediaToAdd_2);
		expect(expectedNewList_2.length).toBe(100);
	});
});
