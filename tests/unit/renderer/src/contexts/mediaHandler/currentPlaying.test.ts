import { beforeEach, describe, expect, it } from "vitest";

// Getting everything ready for the tests...
import "@tests/unit/mockElectronPlusNodeGlobalsBeforeTests";

import { cleanUpBeforeEachTest } from "./beforeEach";
import { PlaylistListEnum } from "@common/enums";
import { getPlayOptions } from "@contexts/playOptions";
import { getPlaylists } from "@contexts/playlists";
import {
	firstMediaPathFromMainList,
	arrayFromMainList,
	numberOfMedias,
	testMap,
} from "./fakeTestList";
import {
	type CurrentPlaying,
	getCurrentPlaying,
	playPreviousMedia,
	useCurrentPlaying,
	playThisMedia,
	playNextMedia,
} from "@contexts/currentPlaying";

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////

describe("Testing currentPlaying", () => {
	/////////////////////////////////////////////
	/////////////////////////////////////////////
	/////////////////////////////////////////////

	beforeEach(cleanUpBeforeEachTest);

	/////////////////////////////////////////////
	/////////////////////////////////////////////
	/////////////////////////////////////////////

	it("should set the currentPlaying media", () => {
		for (const [path] of testMap) {
			playThisMedia(path, PlaylistListEnum.mainList);

			const expected: CurrentPlaying = {
				listType: PlaylistListEnum.mainList,
				lastStoppedTimeInSeconds: 0,
				path,
			};

			expect(expected).toEqual(getCurrentPlaying());
		}
	});

	/////////////////////////////////////////////
	/////////////////////////////////////////////
	/////////////////////////////////////////////

	it("should play the previous media from mainList and update history", () => {
		expect(getPlaylists().history.length, "history.length is wrong!").toBe(0);

		expect(
			getCurrentPlaying().path,
			"currentPlaying.path at the start should be set to an empty string!",
		).toBe("");

		let index = 0;
		for (const [prevMediaPath] of arrayFromMainList) {
			playThisMedia(prevMediaPath, PlaylistListEnum.mainList);

			// There needs to be at least 2 medias on history to be able to play a previous one.
			if (index === 0) continue;

			expect(getCurrentPlaying().path).toBe(prevMediaPath);
			expect(getPlaylists().history.length, "history.length is wrong!").toBe(
				index + 1,
			);

			playPreviousMedia();

			expect(
				getCurrentPlaying().path,
				"currentPlaying.path should be set to the previous path!",
			).toBe(prevMediaPath);

			const expected: CurrentPlaying = {
				listType: PlaylistListEnum.mainList,
				lastStoppedTimeInSeconds: 0,
				path: prevMediaPath,
			} as const;

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
		playThisMedia(firstMediaPathFromMainList, PlaylistListEnum.mainList);

		expect(
			getCurrentPlaying().path,
			"currentPlaying.path at the start should be set to the firstMediaPathFromMainList!",
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
				getPlaylists().sortedByTitleAndMainList.size,
				"mainList.size at the start should be equal to numberOfMedias!",
			).toBe(numberOfMedias);
			expect(
				getPlaylists().favorites.size,
				"favorites.size at the start should be 0!",
			).toBe(0);
			expect(
				getPlaylists().history.length,
				"history.length at the start should be 0!",
			).toBe(0);

			expect(firstMediaPathFromMainList).toBeTruthy();

			// Set currentPlaying to first media:
			expect(
				firstMediaPathFromMainList,
				`There should be a firstMediaPath in mainList. firstMediaPathFromMainList = "${firstMediaPathFromMainList}".`,
			).toBeTruthy();

			playThisMedia(firstMediaPathFromMainList, PlaylistListEnum.mainList);

			expect(
				getCurrentPlaying().path,
				"currentPlaying.path should be equal to firstMediaPathFromMainList!",
			).toBe(firstMediaPathFromMainList);
			expect(
				getPlaylists().history.length,
				"playlists.history.length should be 1 here!",
			).toBe(1);

			expect(arrayFromMainList.length).toBe(numberOfMedias);
		}

		// The firstMediaID has index = 0.
		let index = 0;
		for (const [currMediaPath] of arrayFromMainList) {
			// If is the last media, it is going
			// to go back to the first one:
			const nextIndex = index === numberOfMedias - 1 ? 0 : index + 1;

			const expectedMediaPath = arrayFromMainList[nextIndex]?.[0];

			expect(expectedMediaPath).toBeTruthy();

			expect(
				getCurrentPlaying().path,
				`currentPlaying.path before playing the next media should be the currMediaPath = "${currMediaPath}".`,
			).toBe(currMediaPath);

			playNextMedia();

			expect(
				getCurrentPlaying().path,
				`currentPlaying.path after playing the next media should be the expectedMediaPath = "${expectedMediaPath}"`,
			).toBe(expectedMediaPath);

			++index;
		}

		expect(
			getPlaylists().history.length,
			`playlists.history.length should be ${numberOfMedias + 1}.`,
		).toBe(numberOfMedias + 1);
	});

	/////////////////////////////////////////////
	/////////////////////////////////////////////
	/////////////////////////////////////////////
});
