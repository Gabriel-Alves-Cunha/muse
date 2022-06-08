/* eslint-disable @typescript-eslint/no-non-null-assertion */

import type { Media } from "@common/@types/generalTypes";

import { beforeEach, describe, expect, it } from "vitest";

import { mockGlobalsBeforeTests } from "../../../mockGlobalsBeforeTests";
mockGlobalsBeforeTests();
import { formatDuration } from "@common/utils";
import { getRandomInt } from "@utils/utils";
import {
	numberOfMedias,
	firstMediaPath,
	testArray,
	testList,
} from "./fakeTestList";
import {
	PlaylistActions,
	PlaylistList,
	setPlaylists,
	searchMedia,
	favorites,
	WhatToDo,
	mainList,
	history,
} from "@contexts/mediaHandler/usePlaylists";
import {
	currentPlaying,
	playNextMedia,
	playThisMedia,
} from "@contexts/mediaHandler/useCurrentPlaying";

const setMainListToTestList = () => {
	expect(testList.size).toBe(numberOfMedias);
	setPlaylists({
		whatToDo: PlaylistActions.REPLACE_ENTIRE_LIST,
		type: WhatToDo.UPDATE_MAIN_LIST,
		list: new Map(testList),
	});
	expect(mainList()).toEqual(testList);
	expect(mainList().size).toBe(numberOfMedias);
};

const cleanHistory = () => {
	setPlaylists({
		whatToDo: PlaylistActions.CLEAN,
		type: WhatToDo.UPDATE_HISTORY,
	});
	expect(history().size).toBe(0);
};

const cleanFavorites = () => {
	setPlaylists({
		type: WhatToDo.UPDATE_FAVORITES,
		whatToDo: PlaylistActions.CLEAN,
	});
	expect(favorites().size).toBe(0);
};

it("(PlaylistActions.REPLACE_ENTIRE_LIST) should update the mediaList", () => {
	setPlaylists({
		whatToDo: PlaylistActions.REPLACE_ENTIRE_LIST,
		type: WhatToDo.UPDATE_MAIN_LIST,
		list: new Map(),
	});
	expect(mainList().size).toEqual(0);

	setMainListToTestList();
});

beforeEach(() => {
	setMainListToTestList();
	cleanFavorites();
	cleanHistory();
});

it("should play the next media", () => {
	// Start with the first media:
	{
		expect(
			mainList().size,
			"mainList.size at the start should be equal to numberOfMedias!",
		).toBe(numberOfMedias);
		expect(favorites().size, "favorites.size at the start should be 0!").toBe(
			0,
		);
		expect(history().size, "history.length at the start should be 0!").toBe(0);

		// Set currentPlaying to first media:
		expect(
			firstMediaPath,
			`There should be a firstMediaPath = "${firstMediaPath}"!`,
		).toBeTruthy();

		playThisMedia(firstMediaPath, PlaylistList.MAIN_LIST);
		expect(
			currentPlaying().path,
			"currentPlaying().path should be equal to firstMediaPath!",
		).toBe(firstMediaPath);
		expect(history().size, "history().length should be 1 here!").toBe(1);
	}

	// The very firstMediaPath has index = 0.
	for (let index = 0; index < numberOfMedias; ++index) {
		// If is the last media, it is going
		// to go back to the first one:
		const nextIndex = index === numberOfMedias - 1 ? 0 : index + 1;

		const currMediaPath = testArray[index]![0];
		const expectedMediaPath = testArray[nextIndex]![0];

		expect(
			currentPlaying().path,
			`\ncurrentPlaying().path before playing the next media should be the prevMediaPath = "${currMediaPath}"!\n`,
		).toBe(currMediaPath);

		playNextMedia();

		expect(
			currentPlaying().path,
			`currentPlaying().path after playing the next media should be the expectedMediaPath = "${expectedMediaPath}".\nprevMediaPath = "${currMediaPath}"!\n`,
		).toBe(expectedMediaPath);
	}

	expect(history().size, `history().length should be ${numberOfMedias}!`).toBe(
		numberOfMedias,
	);
});

it("should play a chosen media", () => {
	testArray.forEach(() => {
		const randomMediaPath = testArray[getRandomInt(0, numberOfMedias)]![0];
		expect(randomMediaPath).toBeTruthy();

		playThisMedia(randomMediaPath, PlaylistList.MAIN_LIST);
		expect(currentPlaying().path).toBe(randomMediaPath);
	});
});

describe("Testing PlaylistEnum.UPDATE_HISTORY", () => {
	it("(PlaylistActions.ADD_ONE_MEDIA) should add one to the history list", () => {
		const [mediaPathToAdd] = testArray[1]!;
		expect(mediaPathToAdd).toBeTruthy();

		setPlaylists({
			whatToDo: PlaylistActions.ADD_ONE_MEDIA,
			type: WhatToDo.UPDATE_HISTORY,
			path: mediaPathToAdd,
		});

		const newHistory = history();
		expect([...newHistory][0]?.[0]).toBe(mediaPathToAdd);
		expect(newHistory.size).toBe(1);
	});
});

describe("Testing PlaylistEnum.UPDATE_FAVORITES", () => {
	const addOneMediaToFavorites = () => {
		const [mediaPath] = testArray[1]!;
		expect(mediaPath).toBeTruthy();

		setPlaylists({
			whatToDo: PlaylistActions.ADD_ONE_MEDIA,
			type: WhatToDo.UPDATE_FAVORITES,
			path: mediaPath,
		});

		const newFavorites = favorites();
		expect(newFavorites.has(mediaPath)).toBe(true);
		expect(newFavorites.size).toBe(1);
	};

	it(
		"(PlaylistActions.ADD_ONE_MEDIA) should add one media to favorites",
		addOneMediaToFavorites,
	);

	it("(PlaylistActions.REMOVE_ONE_MEDIA_BY_PATH) should remove one media of favorites", () => {
		addOneMediaToFavorites();
		expect(favorites().size).toBe(1);
		const [path] = favorites();
		expect(path).toBeTruthy();

		setPlaylists({
			whatToDo: PlaylistActions.REMOVE_ONE_MEDIA_BY_PATH,
			type: WhatToDo.UPDATE_FAVORITES,
			path: path!,
		});

		expect(favorites().size).toBe(0);
	});
});

describe("Testing PlaylistEnum.UPDATE_MEDIA_LIST", () => {
	it("(!PlaylistActions.ADD_ONE_MEDIA) should NOT add one media to mediaList because there already exists one with the same path", () => {
		const anyIndex = getRandomInt(0, numberOfMedias);
		const [path, newMedia] = testArray[anyIndex]!;
		expect(path).toBeTruthy();

		expect(mainList().has(path)).toBe(true);

		setPlaylists({
			whatToDo: PlaylistActions.ADD_ONE_MEDIA,
			type: WhatToDo.UPDATE_MAIN_LIST,
			newMedia,
			path,
		});

		expect(mainList().size).toBe(numberOfMedias);
	});

	it("(PlaylistActions.ADD_ONE_MEDIA) should add one media to mediaList", () => {
		const title = "Test Title - add one media";
		const path = `home/Music/test/${title}.mp3`;
		const newMedia: Media = {
			duration: formatDuration(100 + 10),
			birthTime: Date.now(),
			size: "3.0 MB",
			title,
		};

		setPlaylists({
			whatToDo: PlaylistActions.ADD_ONE_MEDIA,
			type: WhatToDo.UPDATE_MAIN_LIST,
			newMedia,
			path,
		});

		const newMainList = mainList();
		expect(newMainList.size).toBe(numberOfMedias + 1);
		expect(newMainList.has(path)).toBe(true);
	});

	it("(PlaylistActions.REMOVE_ONE_MEDIA_BY_PATH) should remove one media of mainList", () => {
		expect(mainList().size).toBe(numberOfMedias);
		expect(favorites().size).toBe(0);
		expect(history().size).toBe(0);

		const anyIndex = getRandomInt(0, numberOfMedias);
		const [path] = testArray[anyIndex]!;
		expect(path).toBeTruthy();

		expect(mainList().size).toBe(numberOfMedias);

		setPlaylists({
			whatToDo: PlaylistActions.REMOVE_ONE_MEDIA_BY_PATH,
			type: WhatToDo.UPDATE_MAIN_LIST,
			path,
		});

		const newMainList = mainList();
		expect(newMainList.has(path)).toBe(false);
		expect(newMainList.size).toBe(numberOfMedias - 1);
	});

	it("(PlaylistActions.CLEAN) should clean mediaList", () => {
		setPlaylists({
			type: WhatToDo.UPDATE_MAIN_LIST,
			whatToDo: PlaylistActions.CLEAN,
		});

		expect(mainList().size).toBe(0);
	});

	it("(PlaylistActions.REFRESH_ONE_MEDIA_BY_PATH) should refresh one media (the caller should not update the media path, it will be updated, if needed, when calling PlaylistActions.REFRESH_ONE_MEDIA_BY_PATH).", () => {
		const title = "I'm an updated title";
		const size = "1.0 MB";
		const [path, oldMedia] = testArray[15]!;
		const newMedia: Media = { ...oldMedia, title, size };

		expect(mainList().size).toBe(numberOfMedias);

		setPlaylists({
			whatToDo: PlaylistActions.REFRESH_ONE_MEDIA_BY_PATH,
			type: WhatToDo.UPDATE_MAIN_LIST,
			newMedia,
			path,
		});

		const newMainList = mainList();
		const refreshedMedia = newMainList.get(path);

		expect(refreshedMedia).toBeTruthy();
		expect(newMainList).toHaveLength(numberOfMedias);
		expect(refreshedMedia).toHaveProperty("size", size);
		expect(refreshedMedia).toHaveProperty("title", title);
	});
});

it("(getPlaylistsFuncs().searchForMedia()) should return a searched media", () => {
	const results = searchMedia("es");

	expect(results.length).toBeGreaterThan(0);
});
