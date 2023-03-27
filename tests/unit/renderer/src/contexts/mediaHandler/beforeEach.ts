import { expect } from "vitest";

import { playlists, replaceEntireMainList } from "@contexts/playlists";
import { numberOfMedias, testMap } from "./fakeTestList";
import {
	setDefaultCurrentPlaying,
	defaultCurrentPlaying,
	currentPlaying,
} from "@contexts/currentPlaying";

function setMainListToTestList() {
	expect(testMap.size).toBe(numberOfMedias);

	replaceEntireMainList(testMap);

	expect(playlists.sortedByTitleAndMainList.size).toBe(numberOfMedias);
	expect(playlists.sortedByTitleAndMainList.entries()).toEqual(
		testMap.entries(),
	);
}

/////////////////////////////////////////////

function cleanHistory() {
	playlists.history.length = 0;

	expect(playlists.history.length).toBe(0);
}

/////////////////////////////////////////////

function cleanFavorites() {
	playlists.favorites.clear();

	expect(playlists.favorites.size).toBe(0);
}

function setCurrentPlayingToDefault() {
	setDefaultCurrentPlaying();

	expect(currentPlaying).toStrictEqual(defaultCurrentPlaying);
}

export function cleanUpBeforeEachTest() {
	setCurrentPlayingToDefault();
	setMainListToTestList();
	cleanFavorites();
	cleanHistory();
}
