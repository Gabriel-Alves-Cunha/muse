/* eslint-disable @typescript-eslint/no-non-null-assertion */

import type { Media, Path } from "@common/@types/generalTypes";

import { beforeEach, describe, expect, it } from "vitest";

import { mockGlobalsBeforeTests } from "../../../mockGlobalsBeforeTests";
mockGlobalsBeforeTests();

import { numberOfMedias, testArray, testList } from "./fakeTestList";
import {
	playPreviousMedia,
	currentPlaying,
	CurrentPlaying,
	playThisMedia,
	playNextMedia,
} from "@contexts/mediaHandler/useCurrentPlaying";
import {
	PlaylistActions,
	PlaylistList,
	setPlaylists,
	mainList,
	WhatToDo,
	history,
} from "@contexts/mediaHandler/usePlaylists";

const firstMediaPath = testArray.at(0)![0];
const lastMediaPath = testArray.at(numberOfMedias - 1)![0];

describe("Testing useCurrentPlaying", () => {
	beforeEach(() => {
		setPlaylists({
			whatToDo: PlaylistActions.REPLACE_ENTIRE_LIST,
			list: testList as Map<Path, Media>,
			type: WhatToDo.UPDATE_MAIN_LIST,
		});
		expect(mainList()).toEqual(testList);

		setPlaylists({
			whatToDo: PlaylistActions.CLEAN,
			type: WhatToDo.UPDATE_HISTORY,
		});
		expect(history().length).toBe(0);
	});

	it("should set the currentPlaying media", () => {
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

	it("should play the previous media from mainList and update history", () => {
		playThisMedia(lastMediaPath, PlaylistList.MAIN_LIST);

		testArray.forEach((_, index) => {
			console.log({ currentPlayingPath: currentPlaying().path });

			playPreviousMedia();

			expect(history().length, "history.length is wrong!").toBe(index + 2);

			const newPath =  firstMediaPath;
			console.log({
				currentPlayingPathAfterPlayPreviousMedia: currentPlaying().path,
				newPath,
			});

			const expected: CurrentPlaying = {
				listType: PlaylistList.MAIN_LIST,
				currentTime: 0,
				path: newPath,
			};

			expect(expected).toEqual(currentPlaying());
		});
	});

	it("should play the next media from a given playlist and update history", () => {
		playThisMedia(firstMediaPath, PlaylistList.MAIN_LIST);

		testArray.forEach((_, index) => {
			playNextMedia();

			const currMediaPath = currentPlaying().path;
			const expectedMediaPath = testArray[index + 1]?.[0] ?? firstMediaPath;

			expect(expectedMediaPath).toEqual(currMediaPath);
		});
	});
});
