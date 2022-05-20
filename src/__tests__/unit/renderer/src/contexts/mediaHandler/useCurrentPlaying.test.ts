/* eslint-disable @typescript-eslint/no-non-null-assertion */
import type { Path } from "@common/@types/generalTypes";

import { beforeEach, describe, expect, it } from "vitest";

import { mockGlobalsBeforeTests } from "../../../mockGlobalsBeforeTests";
mockGlobalsBeforeTests();

import { testArray, testList } from "./fakeTestList";
import {
	playPreviousFromPlaylist,
	playNextFromPlaylist,
	getCurrentPlaying,
	CurrentPlaying,
	playThisMedia,
	PlaylistList,
	getPlaylist,
} from "@contexts/mediaHandler/useCurrentPlaying";
import {
	PlaylistActions,
	getPlaylists,
	setPlaylists,
	WhatToDo,
} from "@contexts/mediaHandler/usePlaylists";

describe("Testing useCurrentPlaying", () => {
	beforeEach(() => {
		setPlaylists({
			whatToDo: PlaylistActions.REPLACE_ENTIRE_LIST,
			type: WhatToDo.UPDATE_MAIN_LIST,
			list: testList,
		});
		{
			const mainList = getPlaylists().mainList;
			expect(mainList).toEqual(testList);
		}

		setPlaylists({
			whatToDo: PlaylistActions.CLEAN,
			type: WhatToDo.UPDATE_HISTORY,
		});
		{
			const history = getPlaylists().history;
			expect(history.length).toBe(0);
		}
	});

	it("(CurrentPlayingEnum.PLAY_THIS_MEDIA) should set the currentPlaying media", () => {
		testList.forEach((_media, path) => {
			playThisMedia(path, PlaylistList.MAIN_LIST);

			const currentPlaying = getCurrentPlaying();
			const expected: CurrentPlaying = {
				listType: PlaylistList.MAIN_LIST,
				currentTime: 0,
				path,
			};

			expect(expected).toEqual(currentPlaying);
		});
	});

	it("(CurrentPlayingEnum.PLAY_PREVIOUS_FROM_PLAYLIST) should play the previous media from mediaList  and update history", () => {
		testArray.forEach(([path], index) => {
			if (index === testArray.length - 1) return;

			playThisMedia(path, PlaylistList.MAIN_LIST);

			playPreviousFromPlaylist();

			const history = getPlaylist(PlaylistList.HISTORY) as Array<Path>;

			expect(history.length).toBe(index * 2 + 2);

			const currentPlaying = getCurrentPlaying();
			const expected: CurrentPlaying = {
				path: testArray.at(index - 1)![0],
				listType: PlaylistList.MAIN_LIST,
				currentTime: 0,
			};

			expect(expected).toEqual(currentPlaying);

			++index;
		});
	});

	it("(CurrentPlayingEnum.PLAY_NEXT_FROM_PLAYLIST) should play the next media from a given playlist", () => {
		testArray.forEach(([path], index) => {
			if (index === testArray.length - 1) return;

			playThisMedia(path, PlaylistList.MAIN_LIST);

			playNextFromPlaylist();

			const currMediaID = getCurrentPlaying().path;
			const expectedMediaPath = testArray[index + 1]![0];

			expect(expectedMediaPath).toEqual(currMediaID);
		});
	});
});
