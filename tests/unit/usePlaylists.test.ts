import type { Media } from "types/generalTypes";

import { beforeEach, describe, expect, it } from "vitest";

// Getting everything ready for the tests...
import { mockWindowBeforeTests } from "./mockWindowBeforeTests";
mockWindowBeforeTests();
//

import { arrayFromMainList, numberOfMedias } from "./fakeTestList";
import { cleanUpBeforeEachTest } from "./beforeEach";
import { getAllSelectedMedias } from "@contexts/useAllSelectedMedias";
import { playlistList } from "@utils/enums";
import {
	replaceEntireMainList,
	removeFromFavorites,
	addToFavorites,
	addToMainList,
	cleanAllLists,
	addToHistory,
	rescanMedia,
	removeMedia,
} from "@contexts/usePlaylists";

const { formatDuration } = await import("@utils/utils");
const { getRandomInt } = await import("@utils/utils");
const { getFirstKey } = await import("@utils/map-set");
const { getFavorites, searchMedia, getMainList, getHistory } = await import(
	"@contexts/usePlaylists"
);
const { getCurrentPlaying, playThisMedia } = await import(
	"@contexts/useCurrentPlaying"
);

it("replaceEntireMainList() should update the mediaList and others", () => {
	replaceEntireMainList(new Map());

	expect(getAllSelectedMedias().size).toEqual(0);
	expect(getFavorites().size).toEqual(0);
	expect(getMainList().size).toEqual(0);
	expect(getHistory().size).toEqual(0);
});

describe("Testing usePlaylists", () => {
	/////////////////////////////////////////////
	/////////////////////////////////////////////
	/////////////////////////////////////////////

	beforeEach(() => cleanUpBeforeEachTest());

	/////////////////////////////////////////////
	/////////////////////////////////////////////
	/////////////////////////////////////////////

	it("playThisMedia() should play a chosen media", () => {
		for (const _ of arrayFromMainList) {
			const randomMediaPath =
				arrayFromMainList[getRandomInt(0, numberOfMedias)]![0];
			expect(randomMediaPath).toBeTruthy();

			playThisMedia(randomMediaPath, playlistList.mainList);
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
			const [mediaPathToAdd] = arrayFromMainList[1]!;

			addToHistory(mediaPathToAdd);

			const newHistory = getHistory();

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

			addToFavorites(mediaPath);

			const newFavorites = getFavorites();

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
			expect(getFavorites().size).toBe(1);
			const [path] = getFavorites();
			expect(path).toBeTruthy();

			removeFromFavorites(path!);

			expect(getFavorites().size).toBe(0);
		});
	});

	/////////////////////////////////////////////
	/////////////////////////////////////////////
	/////////////////////////////////////////////

	describe("Testing updates to mainList", () => {
		/////////////////////////////////////////////
		/////////////////////////////////////////////
		/////////////////////////////////////////////

		it("addToMainList() should NOT add one media to mediaList because there already exists one with the same id", async () => {
			const anyIndex = getRandomInt(0, numberOfMedias);
			const [path] = arrayFromMainList[anyIndex]!;
			expect(path).toBeTruthy();

			expect(getMainList().has(path)).toBe(true);

			await addToMainList(path);

			expect(getMainList().size).toBe(numberOfMedias);
		});

		/////////////////////////////////////////////
		/////////////////////////////////////////////
		/////////////////////////////////////////////

		it.skip("addToMainList() should add one media to mediaList", async () => {
			const title = "Test Title - add one media";
			const newPath = `~/Music/test/${title}.mp3`;

			expect(getMainList().size).toBe(numberOfMedias);

			await addToMainList(newPath);

			const newMainList = getMainList();

			expect(newMainList.size).toBe(numberOfMedias + 1);
			expect(newMainList.has(newPath)).toBe(true);
		});

		/////////////////////////////////////////////
		/////////////////////////////////////////////
		/////////////////////////////////////////////

		it("removeMedia() should remove one media of mainList", () => {
			expect(getMainList().size).toBe(numberOfMedias);
			expect(getFavorites().size).toBe(0);
			expect(getHistory().size).toBe(0);

			const anyIndex = getRandomInt(0, numberOfMedias);
			const [path] = arrayFromMainList[anyIndex]!;
			expect(path).toBeTruthy();

			expect(getMainList().size).toBe(numberOfMedias);

			removeMedia(path);

			const newMainList = getMainList();
			expect(newMainList.has(path)).toBe(false);
			expect(newMainList.size).toBe(numberOfMedias - 1);
		});

		/////////////////////////////////////////////
		/////////////////////////////////////////////
		/////////////////////////////////////////////

		it("cleanAllLists() should clean all lists", () => {
			cleanAllLists();

			expect(getAllSelectedMedias().size).toBe(0);
			expect(getCurrentPlaying().path).toBe("");
			expect(getFavorites().size).toBe(0);
			expect(getMainList().size).toBe(0);
			expect(getHistory().size).toBe(0);
		});

		/////////////////////////////////////////////
		/////////////////////////////////////////////
		/////////////////////////////////////////////

		it("refreshMedia() should refresh one media", () => {
			const [path, oldMedia] = arrayFromMainList[15]!;
			const size = getRandomInt(0, 4242043);
			const title = "I'm an updated title";
			const newMedia: Media = { ...oldMedia, title, size };

			expect(getMainList().size).toBe(numberOfMedias);

			rescanMedia(path, newMedia);

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

	it("searchMedia() should return a searched media", () => {
		const results = searchMedia("es");

		expect(results).toBeTruthy();
		expect(results.length).toBeGreaterThan(0);
	});
});
