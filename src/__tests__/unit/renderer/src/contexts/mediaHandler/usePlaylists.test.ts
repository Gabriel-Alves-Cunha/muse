/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { beforeEach, describe, expect, it } from "vitest";
import { faker } from "@faker-js/faker";

import { mockGlobalsBeforeTests } from "../../../mockGlobalsBeforeTests";
mockGlobalsBeforeTests();

import { formatDuration } from "@common/utils";
import { getRandomInt } from "@utils/utils";
import { Media } from "@common/@types/typesAndEnums";
import { hash } from "@common/hash";

import {
	CurrentPlayingEnum,
	useCurrentPlaying,
	PlaylistActions,
	PlaylistEnum,
	usePlaylists,
	DefaultLists,
} from "@contexts";
import {
	// SORTED_BY_DATE,
	// SORTED_BY_NAME,
	MAIN_LIST,
	FAVORITES,
	HISTORY,
} from "@contexts/mediaHandler/usePlaylistsHelper";

// Make a test list full of fake medias:
const numberOfMedias = 30;
const testList: Media[] = [];
for (let index = 0; index < numberOfMedias; ++index) {
	const title = faker.unique(faker.name.jobTitle);

	const fakeMedia: Media = {
		dateOfArival: faker.date.past().getTime(),
		duration: formatDuration(index + 10),
		path: `home/Music/test/${title}.mp3`,
		favorite: false,
		id: hash(title),
		size: "3.0 MB",
		title,
	};

	testList.push(fakeMedia);
}
Object.freeze(testList);

const { getState: getCurrentPlaying } = useCurrentPlaying;
const { getState: getPlaylistsFuncs } = usePlaylists;

const getPlaylist = (listName: DefaultLists) =>
	getPlaylistsFuncs().playlists.find(p => p.name === listName)!;

// Tests:
describe("Testing list updates", () => {
	it("(PlaylistActions.REPLACE_ENTIRE_LIST) should update the mediaList", () => {
		getPlaylistsFuncs().setPlaylists({
			whatToDo: PlaylistActions.REPLACE_ENTIRE_LIST,
			type: PlaylistEnum.UPDATE_MAIN_LIST,
			list: testList,
		});

		const currMainList = getPlaylistsFuncs().mainList;

		expect(currMainList).toEqual(testList);
	});
});

describe("Testing functions that depend on `getPlaylistsFuncs().playlists` working correctly. In other words: testing the `getPlaylistsFuncs().setPlaylists()` fn", () => {
	beforeEach(() => {
		// (PlaylistActions.REPLACE_ENTIRE_LIST) Set the mediaList to our test list:
		getPlaylistsFuncs().setPlaylists({
			whatToDo: PlaylistActions.REPLACE_ENTIRE_LIST,
			type: PlaylistEnum.UPDATE_MAIN_LIST,
			list: testList,
		});

		// (PlaylistActions.CLEAN) Clean history:
		getPlaylistsFuncs().setPlaylists({
			type: PlaylistEnum.UPDATE_HISTORY,
			whatToDo: PlaylistActions.CLEAN,
		});
		{
			const history = getPlaylist(HISTORY).list;
			expect(history.length).toBe(0);
		}

		// (PlaylistActions.CLEAN) Clean favorites:
		getPlaylistsFuncs().setPlaylists({
			type: PlaylistEnum.UPDATE_FAVORITES,
			whatToDo: PlaylistActions.CLEAN,
		});
		{
			const favorites = getPlaylist(FAVORITES).list;
			expect(favorites.length).toBe(0);
		}

		// Set currentPlaying to first media:
		const currMainList = getPlaylistsFuncs().mainList;
		const firstMedia = currMainList[0]!;
		getCurrentPlaying().setCurrentPlaying({
			type: CurrentPlayingEnum.PLAY_THIS_MEDIA,
			playlistName: MAIN_LIST,
			mediaID: firstMedia.id,
		});

		{
			const history = getPlaylist(HISTORY).list;
			expect(history.length).toBe(1);
		}
	});

	const playNextMediaFn = () => {
		const currMainList = getPlaylistsFuncs().mainList;

		testList.forEach((_, index) => {
			getCurrentPlaying().setCurrentPlaying({
				type: CurrentPlayingEnum.PLAY_NEXT_FROM_PLAYLIST,
				playlistName: MAIN_LIST,
			});

			// If is the last media, it is going to go back
			// to the first one:
			const expectedMediaID =
				currMainList[index < numberOfMedias - 1 ? index + 1 : 0]?.id;
			const currMediaID = getCurrentPlaying().currentPlaying.mediaID;

			expect(currMediaID).toBe(expectedMediaID);
		});

		const history = getPlaylist(HISTORY).list;
		// The extra 1 is the first media that we added when we
		// 'Set currentPlaying to first media' at `beforeEach` above:
		expect(history.length).toBe(numberOfMedias + 1);
	};

	it("should play the next media", playNextMediaFn);

	it("should play the previous media", () => {
		const currMainList = getPlaylistsFuncs().mainList;

		for (let i = numberOfMedias; i === 0; --i) {
			getCurrentPlaying().setCurrentPlaying({
				type: CurrentPlayingEnum.PLAY_PREVIOUS_FROM_PLAYLIST,
				playlistName: MAIN_LIST,
			});

			const currMediaID = getCurrentPlaying().currentPlaying.mediaID;
			const expectedMediaID = currMainList.at(i - 1)?.id;

			expect(currMediaID).toBe(expectedMediaID);
		}
	});

	it("should play a chosen media", () => {
		const currMainList = getPlaylistsFuncs().mainList;
		const randomMediaIndexes = testList.map(() =>
			getRandomInt(0, numberOfMedias),
		);

		testList.forEach((_, index) => {
			const randomMediaID = currMainList[randomMediaIndexes[index]!]!.id;

			getCurrentPlaying().setCurrentPlaying({
				type: CurrentPlayingEnum.PLAY_THIS_MEDIA,
				playlistName: MAIN_LIST,
				mediaID: randomMediaID,
			});

			const currMediaID = getCurrentPlaying().currentPlaying.mediaID;

			expect(currMediaID).toBe(randomMediaID);
		});
	});

	describe("Testing PlaylistEnum.UPDATE_HISTORY", () => {
		it("(PlaylistActions.ADD_ONE_MEDIA) should update the history list", () => {
			playNextMediaFn();

			const history = getPlaylist(HISTORY).list;

			// The extra 1 is the first media that we added when we
			// 'Set currentPlaying to first media' at `beforeEach` above:
			expect(history.length).toBe(numberOfMedias + 1);
		});

		it("(PlaylistActions.ADD_ONE_MEDIA) should add one to the history list", () => {
			const mediaIdToAdd = getPlaylistsFuncs().mainList[1]!.id;

			getPlaylistsFuncs().setPlaylists({
				whatToDo: PlaylistActions.ADD_ONE_MEDIA,
				type: PlaylistEnum.UPDATE_HISTORY,
				mediaID: mediaIdToAdd,
			});

			const newHistory = getPlaylist(HISTORY)!.list;

			// The extra 1 is the first media that we added when we
			// 'Set currentPlaying to first media' at `beforeEach` above:
			expect(newHistory.length).toBe(1 + 1);

			expect(newHistory[0]).toEqual(mediaIdToAdd);
		});
	});

	describe("Testing PlaylistEnum.UPDATE_FAVORITES", () => {
		const addOneMediaToFavorites = () => {
			const mediaID = getPlaylistsFuncs().mainList[1]!.id;

			getPlaylistsFuncs().setPlaylists({
				whatToDo: PlaylistActions.ADD_ONE_MEDIA,
				type: PlaylistEnum.UPDATE_FAVORITES,
				mediaID,
			});

			const newFavorites = getPlaylist(FAVORITES)!.list;

			expect(newFavorites[0]).toBe(mediaID);
			expect(newFavorites.length).toBe(1);
		};

		it(
			"(PlaylistActions.ADD_ONE_MEDIA) should add one media to favorites",
			addOneMediaToFavorites,
		);

		it("(PlaylistActions.REMOVE_ONE_MEDIA) should remove one media of favorites", () => {
			addOneMediaToFavorites();

			const prevFavorites = getPlaylist(FAVORITES).list;

			expect(prevFavorites.length).toBe(1);

			getPlaylistsFuncs().setPlaylists({
				whatToDo: PlaylistActions.REMOVE_ONE_MEDIA,
				type: PlaylistEnum.UPDATE_FAVORITES,
				mediaID: prevFavorites[0]!,
			});

			const newFavorites = getPlaylist(FAVORITES).list;

			expect(newFavorites.length).toBe(0);
		});
	});

	describe("Testing PlaylistEnum.UPDATE_MEDIA_LIST", () => {
		it("(!PlaylistActions.ADD_ONE_MEDIA) should NOT add one media to mediaList because there already exists one with the same path", () => {
			getPlaylistsFuncs().setPlaylists({
				whatToDo: PlaylistActions.ADD_ONE_MEDIA,
				type: PlaylistEnum.UPDATE_MAIN_LIST,
				media: testList[0]!,
			});

			const newMainList = getPlaylistsFuncs().mainList;

			expect(newMainList).toHaveLength(numberOfMedias);
		});

		it("(PlaylistActions.ADD_ONE_MEDIA)should add one media to mediaList", () => {
			const title = faker.unique(faker.name.jobTitle);
			const newMedia: Media = {
				dateOfArival: faker.date.past().getTime(),
				path: `home/Music/test/${title}.mp3`,
				duration: formatDuration(100 + 10),
				favorite: false,
				id: hash(title),
				size: "3.0 MB",
				title,
			};

			getPlaylistsFuncs().setPlaylists({
				whatToDo: PlaylistActions.ADD_ONE_MEDIA,
				type: PlaylistEnum.UPDATE_MAIN_LIST,
				media: newMedia,
			});

			const newMainList = getPlaylistsFuncs().mainList;

			expect(newMainList).toHaveLength(numberOfMedias + 1);
			expect(newMainList.slice(-1)[0]).toEqual(newMedia);
		});

		it("(PlaylistActions.REMOVE_ONE_MEDIA) should remove one media to mediaList", () => {
			const prevMainList = getPlaylistsFuncs().mainList;
			const mediaToBeDeleted = prevMainList[15]!;

			getPlaylistsFuncs().setPlaylists({
				whatToDo: PlaylistActions.REMOVE_ONE_MEDIA,
				type: PlaylistEnum.UPDATE_MAIN_LIST,
				mediaID: mediaToBeDeleted.id,
			});

			const newMainList = getPlaylistsFuncs().mainList;

			expect(newMainList).toHaveLength(numberOfMedias - 1);

			const expected = newMainList.find(m => m.path === mediaToBeDeleted.path);
			expect(expected).toBe(undefined);
		});

		it("(PlaylistActions.CLEAN) should clean mediaList", () => {
			getPlaylistsFuncs().setPlaylists({
				type: PlaylistEnum.UPDATE_MAIN_LIST,
				whatToDo: PlaylistActions.CLEAN,
			});

			const newMainList = getPlaylistsFuncs().mainList;

			expect(newMainList).toHaveLength(0);
		});

		it("(PlaylistActions.REFRESH_ONE_MEDIA_BY_ID) should refresh one media (the caller should not update the media id, it will be updated, if needed, when calling PlaylistActions.REFRESH_ONE_MEDIA_BY_ID).", () => {
			const prevMainList = getPlaylistsFuncs().mainList;
			const title = "I'm an updated title";
			const size = "1.0 MB" as const;
			const index = 15;
			const mediaToBeRefreshed: Media = {
				...prevMainList[index]!,
				title,
				size,
			};

			getPlaylistsFuncs().setPlaylists({
				whatToDo: PlaylistActions.REFRESH_ONE_MEDIA_BY_ID,
				type: PlaylistEnum.UPDATE_MAIN_LIST,
				media: mediaToBeRefreshed,
			});

			const newMainList = getPlaylistsFuncs().mainList;
			const refreshedMedia = newMainList[index];

			expect(refreshedMedia).toHaveProperty("title", title);
			expect(refreshedMedia).toHaveProperty("size", size);
			expect(newMainList).toHaveLength(numberOfMedias);
		});
	});
});

describe("Testing the other fns of getPlaylistsFuncs()", () => {
	it("(getPlaylistsFuncs().searchForMedia()) should return a searched media", () => {
		const results = getPlaylistsFuncs().searchForMediaFromList("es", MAIN_LIST);

		expect(results.length).toBeGreaterThan(0);
	});
});
