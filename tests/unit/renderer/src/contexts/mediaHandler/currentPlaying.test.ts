import type { CurrentPlaying } from "@contexts/currentPlaying";

import { beforeEach, describe, expect, it } from "vitest";

// Getting everything ready for the tests...
import "@tests/unit/mockElectronPlusNodeGlobalsBeforeTests";

import { cleanUpBeforeEachTest } from "./beforeEach";
import { PlaylistListEnum } from "@common/enums";
import { playOptions } from "@contexts/playOptions";
import { playlists } from "@contexts/playlists";
import {
	firstMediaPathFromMainList,
	arrayFromMainList,
	numberOfMedias,
	testMap,
} from "./fakeTestList";
import {
	playPreviousMedia,
	currentPlaying,
	playThisMedia,
	playNextMedia,
} from "@contexts/currentPlaying";

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
			playThisMedia(path, PlaylistListEnum.mainList);

			const expected: CurrentPlaying = {
				listType: PlaylistListEnum.mainList,
				lastStoppedTime: 0,
				path,
			};

			expect(expected).toEqual(currentPlaying);
		}
	});

	/////////////////////////////////////////////
	/////////////////////////////////////////////
	/////////////////////////////////////////////

	it("should play the previous media from mainList and update history", () => {
		expect(playlists.history.size, "history.length is wrong!").toBe(0);

		expect(
			currentPlaying.path,
			"currentPlaying().id at the start should be set to an empty string!",
		).toBe("");

		let index = 0;
		for (const [prevMediaPath] of arrayFromMainList) {
			playThisMedia(prevMediaPath, PlaylistListEnum.mainList);

			// There needs to be at least 2 medias on history to be able to play a previous one.
			if (index === 0) continue;

			expect(currentPlaying.path).toBe(prevMediaPath);
			expect(playlists.history.size, "history.length is wrong!").toBe(
				index + 1,
			);

			playPreviousMedia();

			expect(
				currentPlaying.path,
				"currentPlaying().path should be set to the previous path!",
			).toBe(prevMediaPath);

			const expected: CurrentPlaying = {
				listType: PlaylistListEnum.mainList,
				path: prevMediaPath,
				lastStoppedTime: 0,
			};

			expect(expected, "The expected currentPlaying is wrong!").toEqual(
				currentPlaying,
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
			currentPlaying.path,
			"currentPlaying().path at the start should be set to the firstMediaPathFromMainList!",
		).toBe(firstMediaPathFromMainList);

		let index = 0;
		for (const [currPlayingPath] of arrayFromMainList) {
			const expectedMediaPath =
				arrayFromMainList[index + 1]?.[0] ?? firstMediaPathFromMainList;

			expect(currentPlaying.path).toBe(currPlayingPath);
			expect(playOptions.isRandom).toBe(false);

			playNextMedia();

			console.dir({
				currPlayingPath,
				currentPlayingPath: currentPlaying.path,
				expectedMediaPath,
			});

			expect(expectedMediaPath).toBe(currentPlaying.path);

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
				playlists.sortedByTitleAndMainList.size,
				"mainList.size at the start should be equal to numberOfMedias!",
			).toBe(numberOfMedias);
			expect(
				playlists.favorites.size,
				"favorites.size at the start should be 0!",
			).toBe(0);
			expect(
				playlists.history.size,
				"history.length at the start should be 0!",
			).toBe(0);

			// Set currentPlaying to first media:
			expect(
				firstMediaPathFromMainList,
				`There should be a firstMediaID = "${firstMediaPathFromMainList}"!`,
			).toBeTruthy();

			playThisMedia(firstMediaPathFromMainList, PlaylistListEnum.mainList);

			expect(
				currentPlaying.path,
				"currentPlaying().path should be equal to firstMediaID!",
			).toBe(firstMediaPathFromMainList);
			expect(playlists.history.size, "history().length should be 1 here!").toBe(
				1,
			);
		}

		// The firstMediaID has index = 0.
		let index = 0;
		for (const [currMediaPath] of arrayFromMainList) {
			// If is the last media, it is going
			// to go back to the first one:
			const nextIndex = index === numberOfMedias - 1 ? 0 : index + 1;

			const [expectedMediaPath] = arrayFromMainList[nextIndex]!;

			expect(
				currentPlaying.path,
				`\ncurrentPlaying().id before playing the next media should be the currMediaID = "${currMediaPath}"!\n`,
			).toBe(currMediaPath);

			playNextMedia();

			expect(
				currentPlaying.path,
				`currentPlaying().id after playing the next media should be the expectedMediaID = "${expectedMediaPath}"`,
			).toBe(expectedMediaPath);

			++index;
		}

		expect(
			playlists.history.size,
			`history().length should be ${numberOfMedias}!`,
		).toBe(numberOfMedias);
	});

	/////////////////////////////////////////////
	/////////////////////////////////////////////
	/////////////////////////////////////////////
});
