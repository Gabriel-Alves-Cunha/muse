/* eslint-disable @typescript-eslint/no-non-null-assertion */

import type { Media, Path } from "@common/@types/generalTypes";

import { beforeEach, describe, expect, it } from "vitest";
import { faker } from "@faker-js/faker";

import { mockGlobalsBeforeTests } from "../../../mockGlobalsBeforeTests";
mockGlobalsBeforeTests();

import { numberOfMedias, testList, testArray } from "./fakeTestList";
import { dbgTests, formatDuration } from "@common/utils";
import { getRandomInt } from "@utils/utils";
import {
	PlaylistActions,
	getPlaylists,
	setPlaylists,
	searchMedia,
	WhatToDo,
} from "@contexts/mediaHandler/usePlaylists";
import {
	playNextFromPlaylist,
	getCurrentPlaying,
	playThisMedia,
	PlaylistList,
	getPlaylist,
} from "@contexts/mediaHandler/useCurrentPlaying";

describe("Testing list updates", () => {
	it("(PlaylistActions.REPLACE_ENTIRE_LIST) should update the mediaList", () => {
		setPlaylists({
			whatToDo: PlaylistActions.REPLACE_ENTIRE_LIST,
			type: WhatToDo.UPDATE_MAIN_LIST,
			list: testList,
		});

		const currMainList = getPlaylists().mainList;

		expect(currMainList).toEqual(testList);
	});
});

describe("Testing functions that depend on `getPlaylistsFuncs().playlists` working correctly. In other words: testing the `getPlaylistsFuncs().setPlaylists()` fn", () => {
	beforeEach(() => {
		// (PlaylistActions.REPLACE_ENTIRE_LIST) Set the mediaList to our test list:
		setPlaylists({
			whatToDo: PlaylistActions.REPLACE_ENTIRE_LIST,
			type: WhatToDo.UPDATE_MAIN_LIST,
			list: testList,
		});
		{
			const mainList = getPlaylists().mainList;
			expect(mainList.size).toBe(numberOfMedias);
			expect(mainList).toEqual(testList);
		}

		// (PlaylistActions.CLEAN) Clean history:
		setPlaylists({
			whatToDo: PlaylistActions.CLEAN,
			type: WhatToDo.UPDATE_HISTORY,
		});
		{
			const history = getPlaylist(PlaylistList.HISTORY) as Array<Path>;
			expect(history).instanceOf(Array);
			expect(history.length).toBe(0);
		}

		// (PlaylistActions.CLEAN) Clean favorites:
		setPlaylists({
			type: WhatToDo.UPDATE_FAVORITES,
			whatToDo: PlaylistActions.CLEAN,
		});
		{
			const favorites = getPlaylist(PlaylistList.FAVORITES) as Set<Path>;
			expect(favorites).instanceOf(Set);
			expect(favorites.size).toBe(0);
		}

		// Set currentPlaying to first media:
		const currMainList = getPlaylists().mainList;
		const firstMedia = Array.from(currMainList.keys())[0];

		expect(firstMedia).toBeTruthy();

		playThisMedia(firstMedia!, PlaylistList.MAIN_LIST);

		{
			const history = getPlaylist(PlaylistList.HISTORY) as Array<Path>;
			expect(history).instanceOf(Array);
			expect(history.length).toBe(1);
		}
	});

	const playNextMediaFn = () => {
		testArray.forEach((_, index) => {
			playNextFromPlaylist();

			// If is the last media, it is going to go back
			// to the first one:
			const expectedMediaPath =
				testArray[index < numberOfMedias - 1 ? index + 1 : 0]![0];
			const currMediaID = getCurrentPlaying().path;

			expect(currMediaID).toBe(expectedMediaPath);
		});

		const history = getPlaylist(PlaylistList.HISTORY) as Array<Path>;
		expect(history).instanceOf(Array);
		// The extra 1 is the first media that we added when we
		// 'Set currentPlaying to first media' at `beforeEach` above:
		expect(history.length).toBe(numberOfMedias + 1);
	};

	it("should play the next media", playNextMediaFn);

	it("should play a chosen media", () => {
		testArray.forEach(() => {
			const randomMediaPath = testArray[getRandomInt(0, numberOfMedias)]![0];

			expect(randomMediaPath).toBeTruthy();

			playThisMedia(randomMediaPath, PlaylistList.MAIN_LIST);

			const currMediaPath = getCurrentPlaying().path;

			expect(currMediaPath).toBe(randomMediaPath);
		});
	});

	describe("Testing PlaylistEnum.UPDATE_HISTORY", () => {
		it("(PlaylistActions.ADD_ONE_MEDIA) should update the history list", () => {
			playNextMediaFn();

			const history = getPlaylist(PlaylistList.HISTORY) as Array<Path>;

			expect(history).instanceOf(Array);
			// The extra 1 is the first media that we added when we
			// 'Set currentPlaying to first media' at `beforeEach` above:
			expect(history.length).toBe(numberOfMedias + 1);
		});

		it("(PlaylistActions.ADD_ONE_MEDIA) should add one to the history list", () => {
			const mediaPathToAdd = testArray[1]![0];

			setPlaylists({
				whatToDo: PlaylistActions.ADD_ONE_MEDIA,
				type: WhatToDo.UPDATE_HISTORY,
				path: mediaPathToAdd,
			});

			const newHistory = getPlaylist(PlaylistList.HISTORY) as Array<Path>;

			expect(newHistory).instanceOf(Array);
			// The extra 1 is the first media that we added when we
			// 'Set currentPlaying to first media' at `beforeEach` above:
			expect(newHistory.length).toBe(1 + 1);
			expect(newHistory[0]).toBe(mediaPathToAdd);
		});
	});

	describe("Testing PlaylistEnum.UPDATE_FAVORITES", () => {
		const addOneMediaToFavorites = () => {
			const mediaPath = testArray[1]![0];

			setPlaylists({
				whatToDo: PlaylistActions.ADD_ONE_MEDIA,
				type: WhatToDo.UPDATE_FAVORITES,
				path: mediaPath,
			});

			const newFavorites = getPlaylist(PlaylistList.FAVORITES) as Set<Path>;

			expect(newFavorites).instanceOf(Set);
			expect(newFavorites.size).toBe(1);
			expect(Array.from(newFavorites)[0]).toBe(mediaPath);
		};

		it(
			"(PlaylistActions.ADD_ONE_MEDIA) should add one media to favorites",
			addOneMediaToFavorites
		);

		it("(PlaylistActions.REMOVE_ONE_MEDIA) should remove one media of favorites", () => {
			addOneMediaToFavorites();

			const prevFavorites = Array.from(
				(getPlaylist(PlaylistList.FAVORITES) as Set<Path>).keys()
			);

			expect(prevFavorites.length).toBe(1);

			setPlaylists({
				whatToDo: PlaylistActions.REMOVE_ONE_MEDIA_BY_PATH,
				type: WhatToDo.UPDATE_FAVORITES,
				path: prevFavorites[0]!,
			});

			const newFavorites = getPlaylist(PlaylistList.FAVORITES) as Set<Path>;

			expect(newFavorites.size).toBe(0);
		});
	});

	describe("Testing PlaylistEnum.UPDATE_MEDIA_LIST", () => {
		it("(!PlaylistActions.ADD_ONE_MEDIA) should NOT add one media to mediaList because there already exists one with the same path", () => {
			const anyIndex = getRandomInt(0, numberOfMedias);
			const [path, newMedia] = testArray[anyIndex]!;

			setPlaylists({
				whatToDo: PlaylistActions.ADD_ONE_MEDIA,
				type: WhatToDo.UPDATE_MAIN_LIST,
				newMedia,
				path,
			});

			const newMainList = getPlaylists().mainList;

			// The extra 1 is the first media that we added when we
			// 'Set currentPlaying to first media' at `beforeEach` above:
			expect(newMainList).toHaveLength(numberOfMedias + 1);
		});

		it("(PlaylistActions.ADD_ONE_MEDIA)should add one media to mediaList", () => {
			const title = faker.unique(faker.name.jobTitle);
			const path = `home/Music/test/${title}.mp3`;
			const newMedia: Media = {
				dateOfArival: faker.date.past().getTime(),
				duration: formatDuration(100 + 10),
				size: "3.0 MB",
				title,
			};

			setPlaylists({
				whatToDo: PlaylistActions.ADD_ONE_MEDIA,
				type: WhatToDo.UPDATE_MAIN_LIST,
				newMedia,
				path,
			});

			const newMainList = getPlaylists().mainList;

			expect(newMainList).toHaveLength(numberOfMedias + 1);
			expect(newMainList.has(path)).toBeTruthy();
		});

		it("(PlaylistActions.REMOVE_ONE_MEDIA_BY_PATH) should remove one media of mediaList", () => {
			const path = testArray[15]![0];

			expect(path).toBeTruthy();

			const mainList = getPlaylists().mainList;
			dbgTests({ mainList });
			// The extra 1 is the first media that we added when we
			// 'Set currentPlaying to first media' at `beforeEach` above:
			expect(mainList.size).toBe(numberOfMedias + 1);

			setPlaylists({
				whatToDo: PlaylistActions.REMOVE_ONE_MEDIA_BY_PATH,
				type: WhatToDo.UPDATE_MAIN_LIST,
				path,
			});

			const newMainList = getPlaylists().mainList;

			expect(newMainList.has(path)).toBeFalsy();
			// The extra 1 is the first media that we added when we
			// 'Set currentPlaying to first media' at `beforeEach` above:
			expect(newMainList).toHaveLength(numberOfMedias + 1 - 1);
		});

		it("(PlaylistActions.CLEAN) should clean mediaList", () => {
			setPlaylists({
				type: WhatToDo.UPDATE_MAIN_LIST,
				whatToDo: PlaylistActions.CLEAN,
			});

			const newMainList = getPlaylists().mainList;

			expect(newMainList).toHaveLength(0);
		});

		it("(PlaylistActions.REFRESH_ONE_MEDIA_BY_PATH) should refresh one media (the caller should not update the media id, it will be updated, if needed, when calling PlaylistActions.REFRESH_ONE_MEDIA_BY_PATH).", () => {
			const title = "I'm an updated title";
			const size = "1.0 MB";
			const [path, oldMedia] = testArray[15]!;
			const newMedia: Media = { ...oldMedia, title, size };

			const mainList = getPlaylists().mainList;
			// The extra 1 is the first media that we added when we
			// 'Set currentPlaying to first media' at `beforeEach` above:
			expect(mainList.size).toBe(numberOfMedias + 1);

			setPlaylists({
				whatToDo: PlaylistActions.REFRESH_ONE_MEDIA_BY_PATH,
				type: WhatToDo.UPDATE_MAIN_LIST,
				newMedia,
				path,
			});

			const newMainList = getPlaylists().mainList;
			const refreshedMedia = newMainList.get(path);

			expect(refreshedMedia).toBeTruthy();
			expect(refreshedMedia).toHaveProperty("title", title);
			expect(refreshedMedia).toHaveProperty("size", size);
			// The extra 1 is the first media that we added when we
			// 'Set currentPlaying to first media' at `beforeEach` above:
			expect(newMainList).toHaveLength(numberOfMedias + 1);
		});
	});
});

describe("Testing the other fns of getPlaylistsFuncs()", () => {
	it("(getPlaylistsFuncs().searchForMedia()) should return a searched media", () => {
		const results = searchMedia("es");

		expect(results).instanceOf(Map);
		expect(results.size).toBeGreaterThan(0);
	});
});
