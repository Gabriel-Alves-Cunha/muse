import type { Media } from "@common/@types/GeneralTypes";

import { beforeEach, describe, expect, it } from "vitest";

// Getting everything ready for the tests...
import "@tests/unit/mockElectronPlusNodeGlobalsBeforeTests";

import { arrayFromMainList, numberOfMedias } from "./fakeTestList";
import { getCurrentPlaying, playThisMedia } from "@contexts/currentPlaying";
import { cleanUpBeforeEachTest } from "./beforeEach";
import {
	allSelectedMediasRef,
	getAllSelectedMedias,
} from "@contexts/allSelectedMedias";
import { PlaylistListEnum } from "@common/enums";
import { formatDuration } from "@common/utils";
import { getRandomInt } from "@utils/utils";
import {
	replaceEntireMainList,
	addToMainList,
	clearAllLists,
	searchMedia,
	rescanMedia,
	removeMedia,
	getPlaylists,
	addToFavorites,
	removeFromFavorites,
} from "@contexts/playlists";

describe("Testing playlists", () => {
	/////////////////////////////////////////////
	/////////////////////////////////////////////
	/////////////////////////////////////////////

	beforeEach(() => cleanUpBeforeEachTest());

	/////////////////////////////////////////////
	/////////////////////////////////////////////
	/////////////////////////////////////////////
	it("replaceEntireMainList() should update the mediaList and others", () => {
		replaceEntireMainList(new Map());

		expect(getPlaylists().sortedByTitleAndMainList.size).toEqual(0);
		expect(getPlaylists().history.length).toEqual(0);
		expect(getPlaylists().favorites.size).toEqual(0);
		expect(getAllSelectedMedias().size).toEqual(0);
	});

	/////////////////////////////////////////////
	/////////////////////////////////////////////
	/////////////////////////////////////////////

	it("playThisMedia() should play a chosen media", () => {
		for (const _ of arrayFromMainList) {
			const randomMediaPath =
				arrayFromMainList[getRandomInt(0, numberOfMedias)]?.[0];
			expect(randomMediaPath).toBeTruthy();

			if (!randomMediaPath) throw new Error("No randomMediaPath to play");

			playThisMedia(randomMediaPath, PlaylistListEnum.mainList);

			expect(getCurrentPlaying().path).toBe(randomMediaPath);
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
			const mediaPathToAdd = arrayFromMainList[1]?.[0];

			if (!mediaPathToAdd)
				throw new Error("No mediaPathToAdd to add to history");

			playThisMedia(mediaPathToAdd, PlaylistListEnum.mainList);

			expect(getPlaylists().history.includes(mediaPathToAdd)).toBeTruthy();
			expect(getPlaylists().history.length).toBe(1);
		});
	});

	/////////////////////////////////////////////
	/////////////////////////////////////////////
	/////////////////////////////////////////////

	describe("Testing updates to favorites", () => {
		/////////////////////////////////////////////
		/////////////////////////////////////////////
		/////////////////////////////////////////////

		const addOneMediaToFavorites = (): void => {
			const mediaPath = arrayFromMainList[1]?.[0];

			if (!mediaPath) throw new Error("No mediaPath to add to favorites");

			addToFavorites(mediaPath);

			const newFavorites = getPlaylists().favorites;

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
			expect(getPlaylists().favorites.size).toBe(1);
			const [path] = getPlaylists().favorites;
			expect(path).toBeTruthy();

			removeFromFavorites(path ?? "");

			expect(getPlaylists().favorites.size).toBe(0);
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
			const data = arrayFromMainList[anyIndex];

			if (!data) throw new Error("`data` is undefined");

			const [path, newMedia] = data;

			expect(path).toBeTruthy();

			expect(getPlaylists().sortedByTitleAndMainList.has(path)).toBe(true);

			addToMainList(path, newMedia);

			expect(getPlaylists().sortedByTitleAndMainList.size).toBe(numberOfMedias);
		});

		/////////////////////////////////////////////
		/////////////////////////////////////////////
		/////////////////////////////////////////////

		it("addToMainList() should add one media to mainList", () => {
			const title = "Test Title - add one media to mainList";
			const newPath = `~/Music/test/${title}.mp3`;
			const newMedia: Media = {
				duration: formatDuration(100),
				lastModified: Date.now(),
				birthTime: Date.now(),
				lastPlayedAt: NaN,
				size: 3_000,
				genres: [],
				artist: "",
				lyrics: "",
				album: "",
				image: "",
				title,
			};

			expect(getPlaylists().sortedByTitleAndMainList.size).toBe(numberOfMedias);

			addToMainList(newPath, newMedia);

			expect(getPlaylists().sortedByTitleAndMainList.size).toBe(
				numberOfMedias + 1,
			);
			expect(getPlaylists().sortedByTitleAndMainList.has(newPath)).toBe(true);
		});

		/////////////////////////////////////////////
		/////////////////////////////////////////////
		/////////////////////////////////////////////

		it("removeMedia() should remove one media of mainList", () => {
			expect(getPlaylists().sortedByTitleAndMainList.size).toBe(numberOfMedias);
			expect(getPlaylists().favorites.size).toBe(0);
			expect(getPlaylists().history.length).toBe(0);

			const anyIndex = getRandomInt(0, numberOfMedias);
			const path = arrayFromMainList[anyIndex]?.[0] ?? "";
			expect(path).toBeTruthy();

			expect(getPlaylists().sortedByTitleAndMainList.size).toBe(numberOfMedias);

			removeMedia(path);

			const newMainList = getPlaylists().sortedByTitleAndMainList;

			expect(newMainList.has(path)).toBe(false);
			expect(newMainList.size).toBe(numberOfMedias - 1);
		});

		/////////////////////////////////////////////
		/////////////////////////////////////////////
		/////////////////////////////////////////////

		it("cleanAllLists() should clean all lists", () => {
			clearAllLists();

			expect(getPlaylists().sortedByTitleAndMainList.size).toBe(0);
			expect(getPlaylists().favorites.size).toBe(0);
			expect(getPlaylists().history.length).toBe(0);
			expect(getAllSelectedMedias().size).toBe(0);
			expect(getCurrentPlaying().path).toBe("");
		});

		/////////////////////////////////////////////
		/////////////////////////////////////////////
		/////////////////////////////////////////////

		it("refreshMedia() should refresh one media", () => {
			const data = arrayFromMainList[15];

			if (!data) throw new Error("Data at index 15 should exist!");

			const [path, oldMedia] = data;

			const size = getRandomInt(0, 4242043);
			const title = "I'm an updated title";
			const newMedia: Media = { ...oldMedia, title, size };

			expect(getPlaylists().sortedByTitleAndMainList.size).toBe(numberOfMedias);

			rescanMedia(path, newMedia);

			const newMainList = getPlaylists().sortedByTitleAndMainList;
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
