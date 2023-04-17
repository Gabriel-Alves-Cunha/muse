import { expect } from "vitest";

import { numberOfMedias, testMap } from "./fakeTestList";
import { emptyArray, emptySet } from "@utils/empty";
import {
	replaceEntireMainList,
	getPlaylists,
	setPlaylists,
} from "@contexts/playlists";
import {
	setDefaultCurrentPlaying,
	defaultCurrentPlaying,
	getCurrentPlaying,
} from "@contexts/currentPlaying";

function setMainListToTestList(): void {
	expect(testMap.size).toBe(numberOfMedias);

	replaceEntireMainList(testMap);

	expect(getPlaylists().sortedByTitleAndMainList.size).toBe(numberOfMedias);
	expect(getPlaylists().sortedByTitleAndMainList.entries()).toEqual(
		testMap.entries(),
	);
}

/////////////////////////////////////////////

function cleanHistory(): void {
	setPlaylists({ history: emptyArray });

	expect(getPlaylists().history.length).toBe(0);
}

/////////////////////////////////////////////

function cleanFavorites(): void {
	setPlaylists({ favorites: emptySet });

	expect(getPlaylists().favorites.size).toBe(0);
}

function setCurrentPlayingToDefault(): void {
	setDefaultCurrentPlaying();

	expect(getCurrentPlaying()).toStrictEqual(defaultCurrentPlaying);
}

export function cleanUpBeforeEachTest(): void {
	setCurrentPlayingToDefault();
	setMainListToTestList();
	cleanFavorites();
	cleanHistory();
}
