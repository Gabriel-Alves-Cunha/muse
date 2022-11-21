/* eslint-disable @typescript-eslint/no-non-null-assertion */

import type { Media } from "@common/@types/generalTypes";

import { beforeEach, describe, expect, it } from "vitest";

// Getting everything ready for the tests...
import { mockElectronPlusNodeGlobalsBeforeTests } from "@tests/unit/mockElectronPlusNodeGlobalsBeforeTests";
mockElectronPlusNodeGlobalsBeforeTests();
//

import { emptyString } from "@common/empty";
import {
	numberOfMedias,
	firstMediaPath,
	testArray,
	testList,
} from "./fakeTestList";

const { getCurrentPlaying, playNextMedia, playThisMedia } = await import(
	"@contexts/useCurrentPlaying"
);
const { formatDuration } = await import("@common/utils");
const { getRandomInt } = await import("@utils/utils");
const { getFirstKey } = await import("@utils/map-set");
const {
	PlaylistActions,
	PlaylistList,
	setPlaylists,
	searchMedia,
	getFavorites,
	WhatToDo,
	getMainList,
	getHistory,
} = await import("@contexts/usePlaylists");

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Helper functions:

function setMainListToTestList() {
	expect(testList.size).toBe(numberOfMedias);

	setPlaylists({
		whatToDo: PlaylistActions.REPLACE_ENTIRE_LIST,
		type: WhatToDo.UPDATE_MAIN_LIST,
		list: new Map(testList),
	});

	expect(getMainList().size).toBe(numberOfMedias);
	expect(getMainList()).toEqual(testList);
}

/////////////////////////////////////////////

function cleanHistory() {
	setPlaylists({
		whatToDo: PlaylistActions.CLEAN,
		type: WhatToDo.UPDATE_HISTORY,
	});

	expect(getHistory().size).toBe(0);
}

/////////////////////////////////////////////

function cleanFavorites() {
	setPlaylists({
		type: WhatToDo.UPDATE_FAVORITES,
		whatToDo: PlaylistActions.CLEAN,
	});

	expect(getFavorites().size).toBe(0);
}

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////

it("(PlaylistActions.REPLACE_ENTIRE_LIST) should update the mediaList", () => {
	setPlaylists({
		whatToDo: PlaylistActions.REPLACE_ENTIRE_LIST,
		type: WhatToDo.UPDATE_MAIN_LIST,
		list: new Map(),
	});

	expect(getMainList().size).toEqual(0);

	setMainListToTestList();
});

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////

beforeEach(() => {
	setMainListToTestList();
	cleanFavorites();
	cleanHistory();
});

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////

it("should play the next media", () => {
	// Start with the first media:
	{
		expect(
			getMainList().size,
			"mainList.size at the start should be equal to numberOfMedias!",
		).toBe(numberOfMedias);
		expect(
			getFavorites().size,
			"favorites.size at the start should be 0!",
		).toBe(0);
		expect(getHistory().size, "history.length at the start should be 0!").toBe(
			0,
		);

		// Set currentPlaying to first media:
		expect(
			firstMediaPath,
			`There should be a firstMediaPath = "${firstMediaPath}"!`,
		).toBeTruthy();

		playThisMedia(firstMediaPath, PlaylistList.MAIN_LIST);
		expect(
			getCurrentPlaying().path,
			"currentPlaying().path should be equal to firstMediaPath!",
		).toBe(firstMediaPath);
		expect(getHistory().size, "history().length should be 1 here!").toBe(1);
	}

	// The very firstMediaPath has index = 0.
	for (let index = 0; index < numberOfMedias; ++index) {
		// If is the last media, it is going
		// to go back to the first one:
		const nextIndex = index === numberOfMedias - 1 ? 0 : index + 1;

		const currMediaPath = testArray[index]![0];
		const expectedMediaPath = testArray[nextIndex]![0];

		expect(
			getCurrentPlaying().path,
			`\ncurrentPlaying().path before playing the next media should be the prevMediaPath = "${currMediaPath}"!\n`,
		).toBe(currMediaPath);

		playNextMedia();

		expect(
			getCurrentPlaying().path,
			`currentPlaying().path after playing the next media should be the expectedMediaPath = "${expectedMediaPath}".\nprevMediaPath = "${currMediaPath}"!\n`,
		).toBe(expectedMediaPath);
	}

	expect(
		getHistory().size,
		`history().length should be ${numberOfMedias}!`,
	).toBe(numberOfMedias);
});

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////

it("should play a chosen media", () => {
	testArray.forEach(() => {
		const randomMediaPath = testArray[getRandomInt(0, numberOfMedias)]![0];
		expect(randomMediaPath).toBeTruthy();

		playThisMedia(randomMediaPath, PlaylistList.MAIN_LIST);
		expect(getCurrentPlaying().path).toBe(randomMediaPath);
	});
});

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////

describe("Testing PlaylistEnum.UPDATE_HISTORY", () => {
	/////////////////////////////////////////////
	/////////////////////////////////////////////
	/////////////////////////////////////////////

	it("(PlaylistActions.ADD_ONE_MEDIA) should add one to the history list", () => {
		const [mediaPathToAdd] = testArray[1]!;
		expect(mediaPathToAdd).toBeTruthy();

		setPlaylists({
			whatToDo: PlaylistActions.ADD_ONE_MEDIA,
			type: WhatToDo.UPDATE_HISTORY,
			path: mediaPathToAdd,
		});

		const newHistory = getHistory();
		expect(getFirstKey(newHistory)).toBe(mediaPathToAdd);
		expect(newHistory.size).toBe(1);
	});
});

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////

describe("Testing PlaylistEnum.UPDATE_FAVORITES", () => {
	/////////////////////////////////////////////
	/////////////////////////////////////////////
	/////////////////////////////////////////////

	const addOneMediaToFavorites = () => {
		const [mediaPath] = testArray[1]!;
		expect(mediaPath).toBeTruthy();

		setPlaylists({
			whatToDo: PlaylistActions.ADD_ONE_MEDIA,
			type: WhatToDo.UPDATE_FAVORITES,
			path: mediaPath,
		});

		const newFavorites = getFavorites();
		expect(newFavorites.has(mediaPath)).toBe(true);
		expect(newFavorites.size).toBe(1);
	};

	/////////////////////////////////////////////
	/////////////////////////////////////////////
	/////////////////////////////////////////////

	it(
		"(PlaylistActions.ADD_ONE_MEDIA) should add one media to favorites",
		addOneMediaToFavorites,
	);

	/////////////////////////////////////////////
	/////////////////////////////////////////////
	/////////////////////////////////////////////

	it("(PlaylistActions.REMOVE_ONE_MEDIA_BY_PATH) should remove one media of favorites", () => {
		addOneMediaToFavorites();
		expect(getFavorites().size).toBe(1);
		const [path] = getFavorites();
		expect(path).toBeTruthy();

		setPlaylists({
			whatToDo: PlaylistActions.REMOVE_ONE_MEDIA_BY_PATH,
			type: WhatToDo.UPDATE_FAVORITES,
			path: path!,
		});

		expect(getFavorites().size).toBe(0);
	});
});

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////

describe("Testing PlaylistEnum.UPDATE_MEDIA_LIST", () => {
	/////////////////////////////////////////////
	/////////////////////////////////////////////
	/////////////////////////////////////////////

	it("(!PlaylistActions.ADD_ONE_MEDIA) should NOT add one media to mediaList because there already exists one with the same path", () => {
		const anyIndex = getRandomInt(0, numberOfMedias);
		const [path, newMedia] = testArray[anyIndex]!;
		expect(path).toBeTruthy();

		expect(getMainList().has(path)).toBe(true);

		setPlaylists({
			whatToDo: PlaylistActions.ADD_ONE_MEDIA,
			type: WhatToDo.UPDATE_MAIN_LIST,
			newPath: emptyString,
			newMedia,
			path,
		});

		expect(getMainList().size).toBe(numberOfMedias);
	});

	/////////////////////////////////////////////
	/////////////////////////////////////////////
	/////////////////////////////////////////////

	it("(PlaylistActions.ADD_ONE_MEDIA) should add one media to mediaList", () => {
		const title = "Test Title - add one media";
		const path = `home/Music/test/${title}.mp3`;
		const newMedia: Media = {
			duration: formatDuration(100 + 10),
			birthTime: Date.now(),
			artist: emptyString,
			lyrics: emptyString,
			album: emptyString,
			image: emptyString,
			size: 3_000,
			genres: [],
			title,
		};

		setPlaylists({
			whatToDo: PlaylistActions.ADD_ONE_MEDIA,
			type: WhatToDo.UPDATE_MAIN_LIST,
			newPath: emptyString,
			newMedia,
			path,
		});

		const newMainList = getMainList();

		expect(newMainList.size).toBe(numberOfMedias + 1);
		expect(newMainList.has(path)).toBe(true);
	});

	/////////////////////////////////////////////
	/////////////////////////////////////////////
	/////////////////////////////////////////////

	it("(PlaylistActions.REMOVE_ONE_MEDIA_BY_PATH) should remove one media of mainList", () => {
		expect(getMainList().size).toBe(numberOfMedias);
		expect(getFavorites().size).toBe(0);
		expect(getHistory().size).toBe(0);

		const anyIndex = getRandomInt(0, numberOfMedias);
		const [path] = testArray[anyIndex]!;
		expect(path).toBeTruthy();

		expect(getMainList().size).toBe(numberOfMedias);

		setPlaylists({
			whatToDo: PlaylistActions.REMOVE_ONE_MEDIA_BY_PATH,
			type: WhatToDo.UPDATE_MAIN_LIST,
			path,
		});

		const newMainList = getMainList();
		expect(newMainList.has(path)).toBe(false);
		expect(newMainList.size).toBe(numberOfMedias - 1);
	});

	/////////////////////////////////////////////
	/////////////////////////////////////////////
	/////////////////////////////////////////////

	it("(PlaylistActions.CLEAN) should clean mediaList", () => {
		setPlaylists({
			type: WhatToDo.UPDATE_MAIN_LIST,
			whatToDo: PlaylistActions.CLEAN,
		});

		expect(getMainList().size).toBe(0);
	});

	/////////////////////////////////////////////
	/////////////////////////////////////////////
	/////////////////////////////////////////////

	it("(PlaylistActions.REFRESH_ONE_MEDIA_BY_PATH) should refresh one media (the caller should not update the media path, it will be updated, if needed, when calling PlaylistActions.REFRESH_ONE_MEDIA_BY_PATH).", () => {
		const title = "I'm an updated title";
		const size = 1_000;
		const [path, oldMedia] = testArray[15]!;
		const newMedia: Media = { ...oldMedia, title, size };

		expect(getMainList().size).toBe(numberOfMedias);

		setPlaylists({
			whatToDo: PlaylistActions.REFRESH_ONE_MEDIA_BY_PATH,
			type: WhatToDo.UPDATE_MAIN_LIST,
			newPath: emptyString,
			newMedia,
			path,
		});

		const newMainList = getMainList();
		const refreshedMedia = newMainList.get(path);

		expect(refreshedMedia).toBeTruthy();
		expect(newMainList).toHaveLength(numberOfMedias);
		expect(refreshedMedia).toHaveProperty("size", size);
		expect(refreshedMedia).toHaveProperty("title", title);
	});
});

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////

it("getPlaylistsFuncs().searchForMedia() should return a searched media", () => {
	const results = searchMedia("es");

	expect(results).toBeTruthy();
	expect(results.length).toBeGreaterThan(0);
});
