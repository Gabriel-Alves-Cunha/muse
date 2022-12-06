import { expect } from "vitest";

import { numberOfMedias, testList } from "./fakeTestList";
import {
	defaultCurrentPlaying,
	currentPlaying,
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
	expect(testList.size).toBe(numberOfMedias);

	replaceEntireMainList(new Map(testList));

	expect(getMainList().size).toBe(numberOfMedias);
	expect(getMainList()).toEqual(testList);
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

	expect(currentPlaying()).toStrictEqual(defaultCurrentPlaying);
}

export function cleanUpBeforeEachTest() {
	setCurrentPlayingToDefault();
	setMainListToTestList();
	cleanFavorites();
	cleanHistory();
}
