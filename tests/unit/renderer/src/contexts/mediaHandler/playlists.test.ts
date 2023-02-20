import type { Media } from "@common/@types/generalTypes";

import { beforeEach, describe, expect, it } from "vitest";

// Getting everything ready for the tests...
import "@tests/unit/mockElectronPlusNodeGlobalsBeforeTests";

import { arrayFromMainList, numberOfMedias } from "./fakeTestList";
import { currentPlaying, playThisMedia } from "@contexts/currentPlaying";
import { cleanUpBeforeEachTest } from "./beforeEach";
import { allSelectedMedias } from "@contexts/allSelectedMedias";
import { PlaylistListEnum } from "@common/enums";
import { formatDuration } from "@common/utils";
import { getRandomInt } from "@utils/utils";
import { getFirstKey } from "@utils/map-set";
import { searchMedia } from "@contexts/playlists";
import {
	replaceEntireMainList,
	addToMainList,
	clearAllLists,
	addToHistory,
	rescanMedia,
	removeMedia,
	playlists,
} from "@contexts/playlists";

describe("Testing usePlaylists", () => {
	/////////////////////////////////////////////
	/////////////////////////////////////////////
	/////////////////////////////////////////////

	beforeEach(() => cleanUpBeforeEachTest());

	/////////////////////////////////////////////
	/////////////////////////////////////////////
	/////////////////////////////////////////////
	it("replaceEntireMainList() should update the mediaList and others", () => {
		replaceEntireMainList(new Map());

		expect(playlists.sortedByTitleAndMainList.size).toEqual(0);
		expect(playlists.favorites.size).toEqual(0);
		expect(allSelectedMedias.size).toEqual(0);
		expect(playlists.history.size).toEqual(0);
	});

	/////////////////////////////////////////////
	/////////////////////////////////////////////
	/////////////////////////////////////////////

	it("playThisMedia() should play a chosen media", () => {
		for (const _ of arrayFromMainList) {
			const randomMediaPath =
				arrayFromMainList[getRandomInt(0, numberOfMedias)]![0];
			expect(randomMediaPath).toBeTruthy();

			playThisMedia(randomMediaPath, PlaylistListEnum.mainList);
			expect(currentPlaying.path).toBe(randomMediaPath);
		}
	});

	/////////////////////////////////////////////
	/////////////////////////////////////////////
	/////////////////////////////////////////////

	describe("Testing updates to history", () => {
		/////////////////////////////////////////////
		/////////////////////////////////////////////
		/////////////////////////////////////////////

		it("addToHistory() should add one to the history list", () => {
			const [mediaPathToAdd] = arrayFromMainList[1]!;

			addToHistory(mediaPathToAdd);

			const newHistory = playlists.history;

			expect(getFirstKey(newHistory)).toBe(mediaPathToAdd);
			expect(newHistory.size).toBe(1);
		});
	});

	/////////////////////////////////////////////
	/////////////////////////////////////////////
	/////////////////////////////////////////////

	describe("Testing updates to favorites", () => {
		/////////////////////////////////////////////
		/////////////////////////////////////////////
		/////////////////////////////////////////////

		const addOneMediaToFavorites = () => {
			const [mediaPath] = arrayFromMainList[1]!;

			playlists.favorites.add(mediaPath);

			const newFavorites = playlists.favorites;

			expect(newFavorites.has(mediaPath)).toBe(true);
			expect(newFavorites.size).toBe(1);
		};

		/////////////////////////////////////////////
		/////////////////////////////////////////////
		/////////////////////////////////////////////

		it(
			"addToFavorites() should add one media to favorites",
			addOneMediaToFavorites,
		);

		/////////////////////////////////////////////
		/////////////////////////////////////////////
		/////////////////////////////////////////////

		it("removeFromFavorites() should remove one media of favorites", () => {
			addOneMediaToFavorites();
			expect(playlists.favorites.size).toBe(1);
			const [path] = playlists.favorites;
			expect(path).toBeTruthy();

			playlists.favorites.delete(path!);

			expect(playlists.favorites.size).toBe(0);
		});
	});

	/////////////////////////////////////////////
	/////////////////////////////////////////////
	/////////////////////////////////////////////

	describe("Testing updates to mainList", () => {
		/////////////////////////////////////////////
		/////////////////////////////////////////////
		/////////////////////////////////////////////

		it("addToMainList() should NOT add one media to mediaList because there already exists one with the same id", () => {
			const anyIndex = getRandomInt(0, numberOfMedias);
			const [path, newMedia] = arrayFromMainList[anyIndex]!;
			expect(path).toBeTruthy();

			expect(playlists.sortedByTitleAndMainList.has(path)).toBe(true);

			addToMainList(path, newMedia);

			expect(playlists.sortedByTitleAndMainList.size).toBe(numberOfMedias);
		});

		/////////////////////////////////////////////
		/////////////////////////////////////////////
		/////////////////////////////////////////////

		it("addToMainList() should add one media to mediaList", () => {
			const title = "Test Title - add one media";
			const newPath = `~/Music/test/${title}.mp3`;
			const newMedia: Media = {
				duration: formatDuration(100),
				lastModified: Date.now(),
				birthTime: Date.now(),
				size: 3_000,
				genres: [],
				artist: "",
				lyrics: "",
				album: "",
				image: "",
				title,
			};

			expect(playlists.sortedByTitleAndMainList.size).toBe(numberOfMedias);

			addToMainList(newPath, newMedia);

			const newMainList = playlists.sortedByTitleAndMainList;

			expect(newMainList.size).toBe(numberOfMedias + 1);
			expect(newMainList.has(newPath)).toBe(true);
		});

		/////////////////////////////////////////////
		/////////////////////////////////////////////
		/////////////////////////////////////////////

		it("removeMedia() should remove one media of mainList", () => {
			expect(playlists.sortedByTitleAndMainList.size).toBe(numberOfMedias);
			expect(playlists.favorites.size).toBe(0);
			expect(playlists.history.size).toBe(0);

			const anyIndex = getRandomInt(0, numberOfMedias);
			const [path] = arrayFromMainList[anyIndex]!;
			expect(path).toBeTruthy();

			expect(playlists.sortedByTitleAndMainList.size).toBe(numberOfMedias);

			removeMedia(path);

			const newMainList = playlists.sortedByTitleAndMainList;
			expect(newMainList.has(path)).toBe(false);
			expect(newMainList.size).toBe(numberOfMedias - 1);
		});

		/////////////////////////////////////////////
		/////////////////////////////////////////////
		/////////////////////////////////////////////

		it("cleanAllLists() should clean all lists", () => {
			clearAllLists();

			expect(playlists.sortedByTitleAndMainList.size).toBe(0);
			expect(playlists.favorites.size).toBe(0);
			expect(allSelectedMedias.size).toBe(0);
			expect(playlists.history.size).toBe(0);
			expect(currentPlaying.path).toBe("");
		});

		/////////////////////////////////////////////
		/////////////////////////////////////////////
		/////////////////////////////////////////////

		it("refreshMedia() should refresh one media", () => {
			const [path, oldMedia] = arrayFromMainList[15]!;
			const size = getRandomInt(0, 4242043);
			const title = "I'm an updated title";
			const newMedia: Media = { ...oldMedia, title, size };

			expect(playlists.sortedByTitleAndMainList.size).toBe(numberOfMedias);

			rescanMedia(path, newMedia);

			const newMainList = playlists.sortedByTitleAndMainList;
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

	it("searchMedia() should return a searched media", () => {
		const results = searchMedia("es");

		expect(results).toBeTruthy();
		expect(results.length).toBeGreaterThan(0);
	});
});
