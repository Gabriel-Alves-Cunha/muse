import { expect } from "vitest";

import { numberOfMedias, testMap } from "./fakeTestList";
import {
	defaultCurrentPlaying,
	getCurrentPlaying,
	setCurrentPlaying,
} from "@contexts/useCurrentPlaying";
import {
	replaceEntireMainList,
	clearFavorites,
	getFavorites,
	clearHistory,
	getMainList,
	getHistory,
} from "@contexts/usePlaylists";

function setMainListToTestList() {
	expect(testMap.size).toBe(numberOfMedias);

	replaceEntireMainList(testMap);

	expect(getMainList()).toEqual(testMap);
	expect(getMainList().size).toBe(numberOfMedias);
}

/////////////////////////////////////////////

function cleanHistory() {
	clearHistory();

	expect(getHistory().size).toBe(0);
}

/////////////////////////////////////////////

function cleanFavorites() {
	clearFavorites();

	expect(getFavorites().size).toBe(0);
}

function setCurrentPlayingToDefault() {
	setCurrentPlaying(defaultCurrentPlaying);

	expect(getCurrentPlaying()).toStrictEqual(defaultCurrentPlaying);
}

export function cleanUpBeforeEachTest() {
	setCurrentPlayingToDefault();
	setMainListToTestList();
	cleanFavorites();
	cleanHistory();
}
