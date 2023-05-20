import { expect } from "vitest";

import { numberOfMedias, testMap } from "./fakeTestList";
import { EMPTY_ARRAY, EMPTY_SET } from "@utils/empty";
import {
	replaceEntireMainList,
	getPlaylists,
	setPlaylists,
} from "@contexts/playlists";
import {
	setDefaultCurrentPlaying,
	DEFAULT_CURRENT_PLAYING,
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
	setPlaylists({ history: EMPTY_ARRAY });

	expect(getPlaylists().history.length).toBe(0);
}

/////////////////////////////////////////////

function cleanFavorites(): void {
	setPlaylists({ favorites: EMPTY_SET });

	expect(getPlaylists().favorites.size).toBe(0);
}

function setCurrentPlayingToDefault(): void {
	setDefaultCurrentPlaying();

	expect(getCurrentPlaying()).toStrictEqual(DEFAULT_CURRENT_PLAYING);
}

export function cleanUpBeforeEachTest(): void {
	setCurrentPlayingToDefault();
	setMainListToTestList();
	cleanFavorites();
	cleanHistory();
}
