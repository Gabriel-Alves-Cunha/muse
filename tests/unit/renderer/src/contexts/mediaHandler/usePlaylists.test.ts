import type { Media } from "@common/@types/generalTypes";

import { beforeEach, describe, expect, it } from "vitest";

// Getting everything ready for the tests...
import { mockElectronPlusNodeGlobalsBeforeTests } from "@tests/unit/mockElectronPlusNodeGlobalsBeforeTests";
mockElectronPlusNodeGlobalsBeforeTests();
//

import { createRoot } from "solid-js";
import { nextTick } from "process";

import { cleanUpBeforeEachTest } from "./beforeEach";
import { getAllSelectedMedias } from "@contexts/useAllSelectedMedias";
import { playlistList } from "@common/enums";
import { emptyString } from "@common/empty";
import {
	firstMediaPathFromMainList,
	arrayFromMainList,
	numberOfMedias,
	testArray,
} from "./fakeTestList";
import {
	replaceEntireMainList,
	toggleFavoriteMedia,
	addToMainList,
	cleanAllLists,
	addToHistory,
	refreshMedia,
	removeMedia,
} from "@contexts/usePlaylists";

const { getFavorites, searchMedia, getMainList, getHistory } = await import(
	"@contexts/usePlaylists"
);
const { getCurrentPlaying, playNextMedia, playThisMedia } = await import(
	"@contexts/useCurrentPlaying"
);
const { formatDuration } = await import("@common/utils");
const { getRandomInt } = await import("@utils/utils");
const { getFirstKey } = await import("@utils/map-set");

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////

describe("Wrapping these tests because solid needs a wrapper that catches all reactivities!", () =>
	createRoot((dispose) => {
		beforeEach(() => cleanUpBeforeEachTest());

		it("replaceEntireMainList() should update the mediaList and others", () => {
			replaceEntireMainList(new Map());

			expect(getAllSelectedMedias().size).toEqual(0);
			expect(getFavorites().size).toEqual(0);
			expect(getMainList().size).toEqual(0);
			expect(getHistory().size).toEqual(0);
		});

		/////////////////////////////////////////////
		/////////////////////////////////////////////
		/////////////////////////////////////////////

		it("playNextMedia() should play the next media", () => {
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
				expect(
					getHistory().size,
					"history.length at the start should be 0!",
				).toBe(0);

				// Set currentPlaying to first media:
				expect(
					firstMediaPathFromMainList,
					`There should be a firstMediaPath = "${firstMediaPathFromMainList}"!`,
				).toBeTruthy();

				playThisMedia(firstMediaPathFromMainList, playlistList.mainList);
				expect(
					getCurrentPlaying().path,
					"currentPlaying().path should be equal to firstMediaPath!",
				).toBe(firstMediaPathFromMainList);

				expect(getHistory().size, "history().length should be 1 here!").toBe(1);
			}

			// The firstMediaPath has index = 0.
			let index = 0;
			for (const [currMediaPath] of arrayFromMainList) {
				// If is the last media, it is going
				// to go back to the first one:
				const nextIndex = index === numberOfMedias - 1 ? 0 : index + 1;

				const [expectedMediaPath] = arrayFromMainList[nextIndex]!;

				expect(
					getCurrentPlaying().path,
					`\ncurrentPlaying().path before playing the next media should be the currMediaPath = "${currMediaPath}"!\n`,
				).toBe(currMediaPath);

				playNextMedia();

				expect(
					getCurrentPlaying().path,
					`currentPlaying().path after playing the next media should be the expectedMediaPath = "${expectedMediaPath}".\nprevMediaPath = "${currMediaPath}"!\n`,
				).toBe(expectedMediaPath);

				++index;
			}

			expect(
				getHistory().size,
				`history().length should be ${numberOfMedias}!`,
			).toBe(numberOfMedias);
		});

		/////////////////////////////////////////////
		/////////////////////////////////////////////
		/////////////////////////////////////////////

		it("playThisMedia() should play a chosen media", () => {
			for (const _ of testArray) {
				const randomMediaPath = testArray[getRandomInt(0, numberOfMedias)]![0];
				expect(randomMediaPath).toBeTruthy();

				playThisMedia(randomMediaPath, playlistList.mainList);
				expect(getCurrentPlaying().path).toBe(randomMediaPath);
			}
		});

		/////////////////////////////////////////////
		/////////////////////////////////////////////
		/////////////////////////////////////////////

		it("addToHistory() should add one to the history list", () => {
			const [mediaPathToAdd] = testArray[1]!;

			nextTick(() =>
				console.log("next tick on 'usePlaylists.test.ts' at l:147"),
			);
			addToHistory(mediaPathToAdd);
			nextTick(() =>
				console.log("next tick on 'usePlaylists.test.ts' at l:147"),
			);

			const newHistory = getHistory();
			expect(getFirstKey(newHistory)).toBe(mediaPathToAdd);
			expect(newHistory.size).toBe(1);
		});

		/////////////////////////////////////////////
		/////////////////////////////////////////////
		/////////////////////////////////////////////

		const addOneMediaToFavorites = () => {
			const [mediaPath] = testArray[1]!;

			toggleFavoriteMedia(mediaPath);

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

			toggleFavoriteMedia(path!);

			expect(getFavorites().size).toBe(0);
		});

		/////////////////////////////////////////////
		/////////////////////////////////////////////
		/////////////////////////////////////////////

		/////////////////////////////////////////////
		/////////////////////////////////////////////
		/////////////////////////////////////////////

		it("addToMainList() should NOT add one media to mediaList because there already exists one with the same path", () => {
			const anyIndex = getRandomInt(0, numberOfMedias);
			const [path, newMedia] = testArray[anyIndex]!;
			expect(path).toBeTruthy();

			expect(getMainList().has(path)).toBe(true);

			addToMainList(path, newMedia);

			expect(getMainList().size).toBe(numberOfMedias);
		});

		/////////////////////////////////////////////
		/////////////////////////////////////////////
		/////////////////////////////////////////////

		it("addToMainList() should add one media to mediaList", () => {
			const title = "Test Title - add one media";
			const path = `home/Music/test/${title}.mp3`;
			const newMedia: Media = {
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

			addToMainList(path, newMedia);

			const newMainList = getMainList();

			expect(newMainList.size).toBe(numberOfMedias + 1);
			expect(newMainList.has(path)).toBe(true);
		});

		/////////////////////////////////////////////
		/////////////////////////////////////////////
		/////////////////////////////////////////////

		it("removeMedia() should remove one media of mainList", () => {
			expect(getMainList().size).toBe(numberOfMedias);
			expect(getFavorites().size).toBe(0);
			expect(getHistory().size).toBe(0);

			const anyIndex = getRandomInt(0, numberOfMedias);
			const [path] = testArray[anyIndex]!;
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

		it("refreshMedia() should refresh one media (the caller should not update the media path, it will be updated, if needed, when calling refreshMedia(), at least it should...", () => {
			const [path, oldMedia] = testArray[15]!;
			const title = "I'm an updated title";
			const size = 1_000;
			const newMedia: Media = { ...oldMedia, title, size };

			expect(getMainList().size).toBe(numberOfMedias);

			refreshMedia(path, emptyString, newMedia);

			const newMainList = getMainList();
			const refreshedMedia = newMainList.get(path);

			expect(refreshedMedia).toBeTruthy();
			expect(newMainList).toHaveLength(numberOfMedias);
			expect(refreshedMedia).toHaveProperty("size", size);
			expect(refreshedMedia).toHaveProperty("title", title);
		});

		/////////////////////////////////////////////
		/////////////////////////////////////////////
		/////////////////////////////////////////////

		it("getPlaylistsFuncs().searchForMedia() should return a searched media", () => {
			const results = searchMedia("es");

			expect(results).toBeTruthy();
			expect(results.length).toBeGreaterThan(0);
		});

		dispose();
	}));
