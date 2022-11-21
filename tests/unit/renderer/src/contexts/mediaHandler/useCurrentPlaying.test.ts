/* eslint-disable @typescript-eslint/no-non-null-assertion */

import type { CurrentPlaying } from "@contexts/useCurrentPlaying";
import type { Media, Path } from "@common/@types/generalTypes";

import { beforeEach, describe, expect, it } from "vitest";

// Getting everything ready for the tests...
import { mockElectronPlusNodeGlobalsBeforeTests } from "@tests/unit/mockElectronPlusNodeGlobalsBeforeTests";
mockElectronPlusNodeGlobalsBeforeTests();
//

import {
	firstMediaPath,
	lastMediaPath,
	testArray,
	testList,
} from "./fakeTestList";

const { playPreviousMedia, getCurrentPlaying, playThisMedia, playNextMedia } =
	await import("@contexts/useCurrentPlaying");
const {
	PlaylistActions,
	PlaylistList,
	setPlaylists,
	getMainList,
	WhatToDo,
	getHistory,
} = await import("@contexts/usePlaylists");

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////

describe("Testing useCurrentPlaying", () => {
	/////////////////////////////////////////////
	/////////////////////////////////////////////
	/////////////////////////////////////////////

	beforeEach(() => {
		setPlaylists({
			whatToDo: PlaylistActions.REPLACE_ENTIRE_LIST,
			list: testList as Map<Path, Media>,
			type: WhatToDo.UPDATE_MAIN_LIST,
		});
		expect(getMainList()).toEqual(testList);

		setPlaylists({
			whatToDo: PlaylistActions.CLEAN,
			type: WhatToDo.UPDATE_HISTORY,
		});
		expect(getHistory().size).toBe(0);
	});

	/////////////////////////////////////////////
	/////////////////////////////////////////////
	/////////////////////////////////////////////

	it("should set the currentPlaying media", () => {
		testList.forEach((_, path) => {
			playThisMedia(path, PlaylistList.MAIN_LIST);

			const expected: CurrentPlaying = {
				listType: PlaylistList.MAIN_LIST,
				currentTime: 0,
				path,
			};

			expect(expected).toEqual(getCurrentPlaying());
		});
	});

	/////////////////////////////////////////////
	/////////////////////////////////////////////
	/////////////////////////////////////////////

	it("should play the previous media from mainList and update history", () => {
		const initialIndex = 15;
		playThisMedia(testArray[initialIndex]![0], PlaylistList.MAIN_LIST);
		expect(
			getCurrentPlaying().path,
			"currentPlaying().path at the start should be set to the initialIndex path!",
		).toBe(testArray[initialIndex]![0]);

		testArray.forEach((_, index) => {
			expect(getHistory().size, "history.length is wrong!").toBe(index + 1);

			playPreviousMedia();

			const expectedPath =
				testArray.at(initialIndex - 1 - index)?.[0] ?? lastMediaPath;

			const expected: CurrentPlaying = {
				listType: PlaylistList.MAIN_LIST,
				path: expectedPath,
				currentTime: 0,
			};

			expect(expected, "The expected currentPlaying is wrong!").toEqual(
				getCurrentPlaying(),
			);
		});
	});

	/////////////////////////////////////////////
	/////////////////////////////////////////////
	/////////////////////////////////////////////

	it("should play the next media from a given playlist and update history", () => {
		playThisMedia(firstMediaPath, PlaylistList.MAIN_LIST);
		expect(
			getCurrentPlaying().path,
			"currentPlaying().path at the start should be set to the firstMediaPath!",
		).toBe(firstMediaPath);

		testArray.forEach((_, index) => {
			playNextMedia();

			const currMediaPath = getCurrentPlaying().path;
			const expectedMediaPath = testArray[index + 1]?.[0] ?? firstMediaPath;

			expect(
				expectedMediaPath,
				`expectedMediaPath should be equal to currMediaPath!\nprevious media path: ${
					testArray.at(index)?.[0]
				}
				`,
			).toEqual(currMediaPath);
		});
	});
});
