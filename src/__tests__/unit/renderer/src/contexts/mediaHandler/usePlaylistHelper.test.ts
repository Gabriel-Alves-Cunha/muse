/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { describe, expect, it } from "vitest";
import { faker } from "@faker-js/faker";

import { mockGlobalsBeforeTests } from "../../../mockGlobalsBeforeTests";
mockGlobalsBeforeTests();

import { Media, MediaID } from "@common/@types/typesAndEnums";
import { formatDuration } from "@common/utils";
import { hash } from "@common/hash";
import {
	returnNewArrayWithNewMediaIDOnHistoryOfPlayedMedia,
	maxSizeOfHistory,
} from "@contexts/mediaHandler/usePlaylistsHelper";

// Make a test list full of fake medias:
const numberOfMedias = 10;
const testList: Media[] = [];
for (let index = 0; index < numberOfMedias; ++index) {
	const title = faker.unique(faker.name.jobTitle);

	testList.push({
		dateOfArival: faker.date.past().getTime(),
		duration: formatDuration(index + 10),
		path: `home/Music/test/${title}.mp3`,
		favorite: false,
		id: hash(title),
		size: "3.0 MB",
		title,
	});
}
Object.freeze(testList);

describe("returnNewArrayWithNewMediaOnHistoryOfPlayedMedia", () => {
	it("should return a NEW array with new item(s) at the start of the array", () => {
		testList.forEach(newMediaToAdd => {
			const prevHistory: readonly MediaID[] = Object.freeze([]);

			const newList = [newMediaToAdd.id, ...prevHistory];
			const expectedNewList =
				returnNewArrayWithNewMediaIDOnHistoryOfPlayedMedia(
					prevHistory,
					newMediaToAdd.id,
				);

			expect(expectedNewList).not.toBe(prevHistory);
			expect(expectedNewList).toEqual(newList);
		});
	});

	it(`have a maximum size of ${maxSizeOfHistory}`, () => {
		expect(testList.length).toBe(10);

		const prevHistory = testList
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			.map(_ => testList)
			.flat()
			.map(media => media.id);
		prevHistory.pop();
		Object.freeze(prevHistory);

		expect(prevHistory.length).toBe(99);

		const newMediaIdToAdd_1 = testList[5]!.id;
		const newMediaIdToAdd_2 = testList[7]!.id;

		const newList = [newMediaIdToAdd_1, ...prevHistory];
		const expectedNewList_1 =
			returnNewArrayWithNewMediaIDOnHistoryOfPlayedMedia(
				prevHistory,
				newMediaIdToAdd_1,
			);

		expect(expectedNewList_1).not.toBe(prevHistory);
		expect(expectedNewList_1).toEqual(newList);
		expect(expectedNewList_1.length).toBe(100);

		const expectedNewList_2 =
			returnNewArrayWithNewMediaIDOnHistoryOfPlayedMedia(
				prevHistory,
				newMediaIdToAdd_2,
			);

		expect(expectedNewList_2).not.toBe(expectedNewList_1);
		expect(expectedNewList_2[0]).toBe(newMediaIdToAdd_2);
		expect(expectedNewList_2.length).toBe(100);
	});
});
