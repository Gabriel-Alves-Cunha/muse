/* eslint-disable @typescript-eslint/no-non-null-assertion */

import type { Media } from "@common/@types/generalTypes";

import { describe, expect, it } from "vitest";

import { mockGlobalsBeforeTests } from "../../../mockGlobalsBeforeTests";
mockGlobalsBeforeTests();

import { testList } from "./fakeTestList";
import {
	returnNewArrayWithNewMediaIDOnHistoryOfPlayedMedia,
	maxSizeOfHistory,
} from "@contexts/mediaHandler/usePlaylistsHelper";

describe("returnNewArrayWithNewMediaOnHistoryOfPlayedMedia", () => {
	it("should return a NEW array with new item(s) at the start of the array", () => {
		testList.forEach(newMediaToAdd => {
			const prevHistory: readonly Media["id"][] = Object.freeze([]);

			const newList = [newMediaToAdd.id, ...prevHistory];
			const expectedNewList =
				returnNewArrayWithNewMediaIDOnHistoryOfPlayedMedia(
					prevHistory,
					newMediaToAdd.id
				);

			expect(expectedNewList).not.toBe(prevHistory);
			expect(expectedNewList).toEqual(newList);
		});
	});

	it(`have a maximum size of ${maxSizeOfHistory}`, () => {
		const testListWithSize10 = testList.slice(0, 10);
		expect(testListWithSize10.length).toBe(10);

		const prevHistory = testListWithSize10
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			.map(_ => testListWithSize10)
			.flat()
			.map(media => media.id);
		prevHistory.pop();
		Object.freeze(prevHistory);

		expect(prevHistory.length).toBe(99);

		const newMediaIdToAdd_1 = testListWithSize10[5]!.id;
		const newMediaIdToAdd_2 = testListWithSize10[7]!.id;

		const newList = [newMediaIdToAdd_1, ...prevHistory];
		const expectedNewList_1 =
			returnNewArrayWithNewMediaIDOnHistoryOfPlayedMedia(
				prevHistory,
				newMediaIdToAdd_1
			);

		expect(expectedNewList_1).not.toBe(prevHistory);
		expect(expectedNewList_1).toEqual(newList);
		expect(expectedNewList_1.length).toBe(100);

		const expectedNewList_2 =
			returnNewArrayWithNewMediaIDOnHistoryOfPlayedMedia(
				prevHistory,
				newMediaIdToAdd_2
			);

		expect(expectedNewList_2).not.toBe(expectedNewList_1);
		expect(expectedNewList_2[0]).toBe(newMediaIdToAdd_2);
		expect(expectedNewList_2.length).toBe(100);
	});
});
