/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { beforeEach, describe, expect, it } from "vitest";

import { mockGlobalsBeforeTests } from "../../../mockGlobalsBeforeTests";
mockGlobalsBeforeTests();

import { testArray, testList } from "./fakeTestList";
import {
	playPreviousMedia,
	playNextMedia,
	currentPlaying,
	CurrentPlaying,
	playThisMedia,
} from "@contexts/mediaHandler/useCurrentPlaying";
import {
	PlaylistActions,
	PlaylistList,
	setPlaylists,
	mainList,
	WhatToDo,
	history,
} from "@contexts/mediaHandler/usePlaylists";

describe("Testing useCurrentPlaying", () => {
	beforeEach(() => {
		setPlaylists({
			whatToDo: PlaylistActions.REPLACE_ENTIRE_LIST,
			type: WhatToDo.UPDATE_MAIN_LIST,
			list: testList,
		});
		expect(mainList()).toEqual(testList);

		setPlaylists({
			whatToDo: PlaylistActions.CLEAN,
			type: WhatToDo.UPDATE_HISTORY,
		});
		expect(history().length).toBe(0);
	});

	it("(CurrentPlayingEnum.PLAY_THIS_MEDIA) should set the currentPlaying media", () => {
		testList.forEach((_, path) => {
			playThisMedia(path, PlaylistList.MAIN_LIST);

			const expected: CurrentPlaying = {
				listType: PlaylistList.MAIN_LIST,
				currentTime: 0,
				path,
			};

			expect(expected).toEqual(currentPlaying());
		});
	});

	it("(CurrentPlayingEnum.PLAY_PREVIOUS_FROM_PLAYLIST) should play the previous media from mediaList  and update history", () => {
		testArray.forEach(([path], index) => {
			if (index === testArray.length - 1) return;

			playThisMedia(path, PlaylistList.MAIN_LIST);
			expect(currentPlaying().path).toBe(path);

			playPreviousMedia();

			expect(history().length).toBe(index * 2 + 2);

			const expected: CurrentPlaying = {
				path: testArray.at(index - 1)![0],
				listType: PlaylistList.MAIN_LIST,
				currentTime: 0,
			};

			expect(expected).toEqual(currentPlaying());
		});
	});

	it("(CurrentPlayingEnum.PLAY_NEXT_FROM_PLAYLIST) should play the next media from a given playlist", () => {
		testArray.forEach(([path], index) => {
			// TODO: got to the end of the list, and play first media.
			if (index === testArray.length - 1) return;

			playThisMedia(path, PlaylistList.MAIN_LIST);

			playNextMedia();

			const currMediaID = currentPlaying().path;
			const expectedMediaPath = testArray[index + 1]![0];

			expect(expectedMediaPath).toEqual(currMediaID);
		});
	});
});
