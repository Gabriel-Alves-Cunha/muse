import type { CurrentPlaying } from "@contexts/useCurrentPlaying";

import { beforeEach, describe, expect, it } from "vitest";

// Getting everything ready for the tests...
import { mockElectronPlusNodeGlobalsBeforeTests } from "@tests/unit/mockElectronPlusNodeGlobalsBeforeTests";
mockElectronPlusNodeGlobalsBeforeTests();
//

import { createRoot } from "solid-js";
import { nextTick } from "process";

import { cleanUpBeforeEachTest } from "./beforeEach";
import { playlistList } from "@common/enums";
import {
	firstMediaPathFromTestArray,
	firstMediaPathFromMainList,
	arrayFromMainList,
	testList,
} from "./fakeTestList";

const { playPreviousMedia, getCurrentPlaying, playThisMedia, playNextMedia } =
	await import("@contexts/useCurrentPlaying");
const { getHistory } = await import("@contexts/usePlaylists");

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////

describe("Testing useCurrentPlaying", () =>
	createRoot((dispose) => {
		/////////////////////////////////////////////
		/////////////////////////////////////////////
		/////////////////////////////////////////////

		beforeEach(() => cleanUpBeforeEachTest());

		/////////////////////////////////////////////
		/////////////////////////////////////////////
		/////////////////////////////////////////////

		it("should set the currentPlaying media", () => {
			for (const [path] of testList) {
				nextTick(() =>
					console.log("next tick on 'useCurrentPlaying.test.ts' at l:45"),
				);
				playThisMedia(path, playlistList.mainList);
				nextTick(() =>
					console.log("next tick on 'useCurrentPlaying.test.ts' at l:49"),
				);

				const expected: CurrentPlaying = {
					listType: playlistList.mainList,
					currentTime: 0,
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
				"currentPlaying().path at the start should be set to an empty string!",
			).toBe("");

			let index = 0;
			for (const [prevMediaPath] of arrayFromMainList) {
				nextTick(() =>
					console.log("next tick on 'useCurrentPlaying.test.ts' at l:77"),
				);
				playThisMedia(prevMediaPath, playlistList.mainList);
				nextTick(() =>
					console.log("next tick on 'useCurrentPlaying.test.ts' at l:81"),
				);

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
					currentTime: 0,
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
			nextTick(() =>
				console.log("next tick on 'useCurrentPlaying.test.ts' at l:119"),
			);

			expect(
				getCurrentPlaying().path,
				"currentPlaying().path at the start should be set to the firstMediaPathFromMainList!",
			).toBe(firstMediaPathFromMainList);

			let index = 0;
			for (const _ of arrayFromMainList) {
				playNextMedia();

				const currMediaPath = getCurrentPlaying().path;
				const expectedMediaPath =
					arrayFromMainList[index + 1]?.[0] ?? firstMediaPathFromTestArray;

				expect(expectedMediaPath).toEqual(currMediaPath);

				++index;
			}
		});

		/////////////////////////////////////////////
		/////////////////////////////////////////////
		/////////////////////////////////////////////

		dispose();
	}));
