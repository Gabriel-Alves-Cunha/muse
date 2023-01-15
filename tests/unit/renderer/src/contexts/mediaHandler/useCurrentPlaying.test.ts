import type { CurrentPlaying } from "@contexts/useCurrentPlaying";

import { beforeEach, describe, expect, it } from "vitest";

// Getting everything ready for the tests...
import { mockElectronPlusNodeGlobalsBeforeTests } from "@tests/unit/mockElectronPlusNodeGlobalsBeforeTests";
mockElectronPlusNodeGlobalsBeforeTests();
//

import { cleanUpBeforeEachTest } from "./beforeEach";
import { playlistList } from "@common/enums";
import {
	firstMediaPathFromMainList,
	arrayFromMainList,
	numberOfMedias,
	testMap,
} from "./fakeTestList";

const { getPlayOptions } = await import("@contexts/usePlayOptions");
const { getHistory, getMainList, getFavorites } = await import(
	"@contexts/usePlaylists"
);
const { playPreviousMedia, getCurrentPlaying, playThisMedia, playNextMedia } =
	await import("@contexts/useCurrentPlaying");

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////

describe("Testing useCurrentPlaying", () => {
	/////////////////////////////////////////////
	/////////////////////////////////////////////
	/////////////////////////////////////////////

	beforeEach(() => cleanUpBeforeEachTest());

	/////////////////////////////////////////////
	/////////////////////////////////////////////
	/////////////////////////////////////////////

	it("should set the currentPlaying media", () => {
		for (const [path] of testMap) {
			playThisMedia(path, playlistList.mainList);

			const expected: CurrentPlaying = {
				listType: playlistList.mainList,
				lastStoppedTime: 0,
				path,
			};

			expect(expected).toEqual(getCurrentPlaying());
		}
	});

	/////////////////////////////////////////////
	/////////////////////////////////////////////
	/////////////////////////////////////////////

	it("should play the previous media from mainList and update history", () => {
		expect(getHistory().size, "history.length is wrong!").toBe(0);

		expect(
			getCurrentPlaying().path,
			"currentPlaying().id at the start should be set to an empty string!",
		).toBe("");

		let index = 0;
		for (const [prevMediaPath] of arrayFromMainList) {
			playThisMedia(prevMediaPath, playlistList.mainList);

			// There needs to be at least 2 medias on history to be able to play a previous one.
			if (index === 0) continue;

			expect(getCurrentPlaying().path).toBe(prevMediaPath);
			expect(getHistory().size, "history.length is wrong!").toBe(index + 1);

			playPreviousMedia();

			expect(
				getCurrentPlaying().path,
				"currentPlaying().path should be set to the previous path!",
			).toBe(prevMediaPath);

			const expected: CurrentPlaying = {
				listType: playlistList.mainList,
				path: prevMediaPath,
				lastStoppedTime: 0,
			};

			expect(expected, "The expected currentPlaying is wrong!").toEqual(
				getCurrentPlaying(),
			);

			++index;
		}
	});

	/////////////////////////////////////////////
	/////////////////////////////////////////////
	/////////////////////////////////////////////

	it("should play the next media from a given playlist and update history", () => {
		// A media needs to be currently selected to play a next media.
		playThisMedia(firstMediaPathFromMainList, playlistList.mainList);

		expect(
			getCurrentPlaying().path,
			"currentPlaying().path at the start should be set to the firstMediaPathFromMainList!",
		).toBe(firstMediaPathFromMainList);

		let index = 0;
		for (const [currPlayingPath] of arrayFromMainList) {
			const expectedMediaPath =
				arrayFromMainList[index + 1]?.[0] ?? firstMediaPathFromMainList;

			expect(getCurrentPlaying().path).toBe(currPlayingPath);
			expect(getPlayOptions().isRandom).toBe(false);

			playNextMedia();

			expect(expectedMediaPath).toBe(getCurrentPlaying().path);

			++index;
		}
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
				`There should be a firstMediaID = "${firstMediaPathFromMainList}"!`,
			).toBeTruthy();

			playThisMedia(firstMediaPathFromMainList, playlistList.mainList);

			expect(
				getCurrentPlaying().path,
				"currentPlaying().id should be equal to firstMediaID!",
			).toBe(firstMediaPathFromMainList);
			expect(getHistory().size, "history().length should be 1 here!").toBe(1);
		}

		// The firstMediaID has index = 0.
		let index = 0;
		for (const [currMediaPath] of arrayFromMainList) {
			// If is the last media, it is going
			// to go back to the first one:
			const nextIndex = index === numberOfMedias - 1 ? 0 : index + 1;

			const [expectedMediaPath] = arrayFromMainList[nextIndex]!;

			expect(
				getCurrentPlaying().path,
				`\ncurrentPlaying().id before playing the next media should be the currMediaID = "${currMediaPath}"!\n`,
			).toBe(currMediaPath);

			playNextMedia();

			expect(
				getCurrentPlaying().path,
				`currentPlaying().id after playing the next media should be the expectedMediaID = "${expectedMediaPath}"`,
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
});
