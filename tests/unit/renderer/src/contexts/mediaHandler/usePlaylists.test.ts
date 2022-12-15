import type { Media } from "@common/@types/generalTypes";

import { beforeEach, describe, expect, it } from "vitest";
import { randomUUID } from "node:crypto";

// Getting everything ready for the tests...
import { mockElectronPlusNodeGlobalsBeforeTests } from "@tests/unit/mockElectronPlusNodeGlobalsBeforeTests";
mockElectronPlusNodeGlobalsBeforeTests();
//

import { arrayFromMainList, numberOfMedias } from "./fakeTestList";
import { cleanUpBeforeEachTest } from "./beforeEach";
import { getAllSelectedMedias } from "@contexts/useAllSelectedMedias";
import { playlistList } from "@common/enums";
import { prettyBytes } from "@common/prettyBytes";
import { emptyString } from "@common/empty";
import {
	replaceEntireMainList,
	removeFromFavorites,
	addToFavorites,
	addToMainList,
	cleanAllLists,
	addToHistory,
	refreshMedia,
	removeMedia,
} from "@contexts/usePlaylists";

const { formatDuration } = await import("@common/utils");
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
			const randomMediaID =
				arrayFromMainList[getRandomInt(0, numberOfMedias)]![0];
			expect(randomMediaID).toBeTruthy();

			playThisMedia(randomMediaID, playlistList.mainList);
			expect(getCurrentPlaying().id).toBe(randomMediaID);
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
			const [mediaIDToAdd] = arrayFromMainList[1]!;

			addToHistory(mediaIDToAdd);

			const newHistory = getHistory();
			expect(getFirstKey(newHistory)).toBe(mediaIDToAdd);
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
			const [mediaID] = arrayFromMainList[1]!;

			addToFavorites(mediaID);

			const newFavorites = getFavorites();
			expect(newFavorites.has(mediaID)).toBe(true);
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
			const [id] = getFavorites();
			expect(id).toBeTruthy();

			removeFromFavorites(id!);

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

		it("addToMainList() should NOT add one media to mediaList because there already exists one with the same id", () => {
			const anyIndex = getRandomInt(0, numberOfMedias);
			const [id, newMedia] = arrayFromMainList[anyIndex]!;
			expect(id).toBeTruthy();

			expect(getMainList().has(id)).toBe(true);

			addToMainList(id, newMedia);

			expect(getMainList().size).toBe(numberOfMedias);
		});

		/////////////////////////////////////////////
		/////////////////////////////////////////////
		/////////////////////////////////////////////

		it("addToMainList() should add one media to mediaList", () => {
			const title = "Test Title - add one media";
			const newID = randomUUID();
			const newMedia: Media = {
				path: `home/Music/test/${title}.mp3`,
				duration: formatDuration(100),
				birthTime: Date.now(),
				artist: emptyString,
				lyrics: emptyString,
				album: emptyString,
				image: emptyString,
				size: 3_000,
				genres: [],
				title,
			};

			expect(getMainList().size).toBe(numberOfMedias);

			addToMainList(newID, newMedia);

			const newMainList = getMainList();

			expect(newMainList.size).toBe(numberOfMedias + 1);
			expect(newMainList.has(newID)).toBe(true);
		});

		/////////////////////////////////////////////
		/////////////////////////////////////////////
		/////////////////////////////////////////////

		it("removeMedia() should remove one media of mainList", () => {
			expect(getMainList().size).toBe(numberOfMedias);
			expect(getFavorites().size).toBe(0);
			expect(getHistory().size).toBe(0);

			const anyIndex = getRandomInt(0, numberOfMedias);
			const [id] = arrayFromMainList[anyIndex]!;
			expect(id).toBeTruthy();

			expect(getMainList().size).toBe(numberOfMedias);

			removeMedia(id);

			const newMainList = getMainList();
			expect(newMainList.has(id)).toBe(false);
			expect(newMainList.size).toBe(numberOfMedias - 1);
		});

		/////////////////////////////////////////////
		/////////////////////////////////////////////
		/////////////////////////////////////////////

		it("cleanAllLists() should clean all lists", () => {
			cleanAllLists();

			expect(getAllSelectedMedias().size).toBe(0);
			expect(getCurrentPlaying().id).toBe("");
			expect(getFavorites().size).toBe(0);
			expect(getMainList().size).toBe(0);
			expect(getHistory().size).toBe(0);
		});

		/////////////////////////////////////////////
		/////////////////////////////////////////////
		/////////////////////////////////////////////

		it("refreshMedia() should refresh one media", () => {
			const [id, oldMedia] = arrayFromMainList[15]!;
			const size = getRandomInt(0, 4242043);
			const title = "I'm an updated title";
			const newID = randomUUID();
			const newMedia: Media = { ...oldMedia, title, size };

			expect(getMainList().size).toBe(numberOfMedias);

			refreshMedia(id, newID, newMedia);

			const newMainList = getMainList();
			const refreshedMedia = newMainList.get(newID);

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
