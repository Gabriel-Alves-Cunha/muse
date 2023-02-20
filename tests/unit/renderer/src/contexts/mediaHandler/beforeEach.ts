import { expect } from "vitest";

import { playlists, replaceEntireMainList } from "@contexts/playlists";
import { numberOfMedias, testMap } from "./fakeTestList";
import { PlaylistListEnum } from "@common/enums";
import {
	setDefaultCurrentPlaying,
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
	playlists.history.clear();

	expect(playlists.history.size).toBe(0);
}

/////////////////////////////////////////////

function cleanFavorites() {
	playlists.favorites.clear();

	expect(playlists.favorites.size).toBe(0);
}

function setCurrentPlayingToDefault() {
	setDefaultCurrentPlaying();

	expect(currentPlaying).toStrictEqual({
		listType: PlaylistListEnum.mainList,
		lastStoppedTime: 0,
		path: "",
	});
}

export function cleanUpBeforeEachTest() {
	setCurrentPlayingToDefault();
	setMainListToTestList();
	cleanFavorites();
	cleanHistory();
}
