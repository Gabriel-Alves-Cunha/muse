/* eslint-disable @typescript-eslint/no-non-null-assertion */

import type { Media } from "@common/@types/typesAndEnums";

import { beforeEach, describe, expect, it, vi } from "vitest";
import { faker } from "@faker-js/faker";

import { formatDuration } from "@common/utils";
import { hash } from "@common/hash";
import { getRandomInt } from "@utils/utils";

// Mocking `global.electron` before importing code that calls it:
global.electron = {
	notificationApi: {
		sendNotificationToElectronIpcMainProcess: vi.fn(),
		receiveMsgFromElectronWindow: vi.fn(),
	},
	fs: {
		getFullPathOfFilesForFilesInThisDirectory: vi.fn(),
		readdir: vi.fn(),
		readFile: vi.fn(),
		deleteFile: vi.fn(),
	},
	os: {
		homeDir: "test/homeDir",
		dirs: {
			documents: "test/documents",
			downloads: "test/downloads",
			music: "test/music",
		},
	},
	media: {
		transformPathsToMedias: vi.fn(),
		convertToAudio: vi.fn(),
		writeTags: vi.fn(),
		getBasicInfo: vi.fn(),
	},
};

// Mocking global.localStorage
class LocalStorageMock {
	#store: Record<string, string>;

	constructor() {
		this.#store = {};
	}

	get length() {
		return Object.keys(this.#store).length;
	}

	clear() {
		this.#store = {};
	}

	key(index: number): string | null {
		const keys = Object.keys(this.#store);

		if (index > keys.length) return null;

		return keys[index]!;
	}

	getItem(key: string) {
		return this.#store[key] ?? null;
	}

	setItem(key: string, value: string) {
		this.#store[key] = String(value);
	}

	removeItem(key: string) {
		delete this.#store[key];
	}
}

global.localStorage = new LocalStorageMock();

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
	MEDIA_LIST,
	FAVORITES,
	HISTORY,
} from "@contexts/mediaHandler/usePlaylistsHelper";

// Make a test list full of fake medias:
const numberOfMedias = 30;
const testList: Media[] = [];
for (let index = 0; index < numberOfMedias; ++index) {
	const title = faker.unique(faker.name.title);

	const fakeMedia: Media = {
		dateOfArival: faker.date.past().getTime(),
		duration: formatDuration(index + 10),
		path: `home/Music/test/${title}.mp3`,
		id: hash(title),
		size: "3.0 MB",
		title,
		index,
	};

	testList.push(fakeMedia);
}

const { getState: getCurrentPlaying } = useCurrentPlaying;
const { getState: getPlaylistsFuncs } = usePlaylists;

const getPlaylist = (listName: DefaultLists) =>
	getPlaylistsFuncs().playlists.find(p => p.name === listName)!;

// Tests:
describe("Testing list updates", () => {
	it("(PlaylistActions.REPLACE_ENTIRE_LIST) should update the mediaList", () => {
		getPlaylistsFuncs().setPlaylists({
			whatToDo: PlaylistActions.REPLACE_ENTIRE_LIST,
			type: PlaylistEnum.UPDATE_MEDIA_LIST,
			list: testList,
		});

		const currMediaList = getPlaylist(MEDIA_LIST).list;

		expect(currMediaList).toEqual(testList);
	});
});

describe("Testing functions that depend on `getPlaylistsFuncs().playlists` working correctly. In other words: testing the `getPlaylistsFuncs().setPlaylists()` fn", () => {
	beforeEach(() => {
		// (PlaylistActions.REPLACE_ENTIRE_LIST) Set the mediaList to our test list:
		getPlaylistsFuncs().setPlaylists({
			whatToDo: PlaylistActions.REPLACE_ENTIRE_LIST,
			type: PlaylistEnum.UPDATE_MEDIA_LIST,
			list: testList,
		});

		// (PlaylistActions.CLEAN) Clean history:
		getPlaylistsFuncs().setPlaylists({
			type: PlaylistEnum.UPDATE_HISTORY,
			whatToDo: PlaylistActions.CLEAN,
		});
		{
			const history = getPlaylist(HISTORY)!.list;
			expect(history.length).toBe(0);
		}

		// (PlaylistActions.CLEAN) Clean favorites:
		getPlaylistsFuncs().setPlaylists({
			type: PlaylistEnum.UPDATE_FAVORITES,
			whatToDo: PlaylistActions.CLEAN,
		});
		{
			const favorites = getPlaylist(FAVORITES)!.list;
			expect(favorites.length).toBe(0);
		}

		// Set currentPlaying to first media:
		const mediaPlaylistList = getPlaylist(MEDIA_LIST)!;
		const firstMedia = mediaPlaylistList.list[0]!;
		getCurrentPlaying().setCurrentPlaying({
			type: CurrentPlayingEnum.PLAY_THIS_MEDIA,
			playlistName: MEDIA_LIST,
			media: firstMedia,
		});

		{
			const history = getPlaylist(HISTORY).list;
			expect(history.length).toBe(1);
		}
	});

	const playNextMediaFn = () => {
		const mediaListPlaylist = getPlaylist(MEDIA_LIST)!;

		for (let i = 0; i < numberOfMedias; ++i) {
			getCurrentPlaying().setCurrentPlaying({
				type: CurrentPlayingEnum.PLAY_NEXT_FROM_PLAYLIST,
				playlistName: MEDIA_LIST,
			});

			// If is the last media, it is going to go back
			// to the first one:
			const expectedMedia =
				mediaListPlaylist.list[i < numberOfMedias - 1 ? i + 1 : 0];
			const currMedia = getCurrentPlaying().currentPlaying.media;

			expect(currMedia).toBe(expectedMedia);
		}

		const history = getPlaylist(HISTORY).list;
		// The extra 1 is the first media:
		expect(history.length).toBe(numberOfMedias + 1);
	};

	it("should play the next media", playNextMediaFn);

	it("should play the previous media", () => {
		const mediaListPlaylist = getPlaylist(MEDIA_LIST)!;

		for (let i = numberOfMedias; i === 0; --i) {
			getCurrentPlaying().setCurrentPlaying({
				type: CurrentPlayingEnum.PLAY_PREVIOUS_FROM_PLAYLIST,
				playlistName: MEDIA_LIST,
			});

			const expectedMedia = mediaListPlaylist.list.at(i - 1);
			const currMedia = getCurrentPlaying().currentPlaying.media;

			expect(currMedia).toBe(expectedMedia);

			console.log(i, { expectedMedia, currMedia });
		}
	});

	it("should play a chosen media", () => {
		const mediaListPlaylist = getPlaylist(MEDIA_LIST)!;
		const randomMediaIndexes = [];

		for (let i = 0; i < numberOfMedias; ++i)
			randomMediaIndexes.push(getRandomInt(0, numberOfMedias));

		for (let index = 0; index < numberOfMedias; ++index) {
			getCurrentPlaying().setCurrentPlaying({
				type: CurrentPlayingEnum.PLAY_THIS_MEDIA,
				media: mediaListPlaylist.list[index]!,
				playlistName: MEDIA_LIST,
			});

			const currMedia = getCurrentPlaying().currentPlaying.media;
			const expectedMedia = mediaListPlaylist.list.at(index);

			expect(currMedia).toBe(expectedMedia);
		}
	});

	describe("Testing PlaylistEnum.UPDATE_HISTORY", () => {
		it("(PlaylistActions.ADD_ONE_MEDIA) should update the history list", () => {
			playNextMediaFn();

			const history = getPlaylist(HISTORY).list;

			// The extra 1 is because the extra firstMedia added
			// at `playNextMediaFn()` above:
			expect(history.length).toBe(numberOfMedias + 1);
		});

		it("(PlaylistActions.ADD_ONE_MEDIA) should add one to the history list", () => {
			const mediaList = getPlaylist(MEDIA_LIST)!.list;

			getPlaylistsFuncs().setPlaylists({
				whatToDo: PlaylistActions.ADD_ONE_MEDIA,
				type: PlaylistEnum.UPDATE_HISTORY,
				media: mediaList[1]!,
			});

			const newHistory = getPlaylist(HISTORY)!.list;

			// The extra 1 is because the extra firstMedia added
			// at `playNextMediaFn()` above:
			expect(newHistory.length).toBe(1 + 1);

			expect(newHistory[0]).toEqual(mediaList[1]);
		});
	});

	describe("Testing PlaylistEnum.UPDATE_FAVORITES", () => {
		const addOneMediaToFavorites = () => {
			const mediaList = getPlaylist(MEDIA_LIST).list;

			getPlaylistsFuncs().setPlaylists({
				whatToDo: PlaylistActions.ADD_ONE_MEDIA,
				type: PlaylistEnum.UPDATE_FAVORITES,
				media: mediaList[1]!,
			});

			const newFavorites = getPlaylist(FAVORITES)!.list;

			expect(newFavorites.length).toBe(1);

			// The media inside the favorites list will have a new index (indexes are put there to accelerate fns):
			expect(newFavorites[0]).toEqual({ ...mediaList[1], index: 0 });
		};

		it(
			"(PlaylistActions.ADD_ONE_MEDIA) should add one media to favorites",
			addOneMediaToFavorites,
		);

		it("(PlaylistActions.REMOVE_ONE_MEDIA) should remove one media of favorites", () => {
			addOneMediaToFavorites();

			const prevFavorites = getPlaylist(FAVORITES).list;

			getPlaylistsFuncs().setPlaylists({
				whatToDo: PlaylistActions.REMOVE_ONE_MEDIA,
				type: PlaylistEnum.UPDATE_FAVORITES,
				mediaIndex: prevFavorites[0]!.index,
			});

			const newFavorites = getPlaylist(FAVORITES).list;

			expect(newFavorites.length).toBe(0);
		});
	});

	describe("Testing PlaylistEnum.UPDATE_MEDIA_LIST", () => {
		it("(!PlaylistActions.ADD_ONE_MEDIA) should NOT add one media to mediaList because there already exists one with the same path", () => {
			getPlaylistsFuncs().setPlaylists({
				whatToDo: PlaylistActions.ADD_ONE_MEDIA,
				type: PlaylistEnum.UPDATE_MEDIA_LIST,
				media: testList[0]!,
			});

			const newMediaList = getPlaylist(MEDIA_LIST).list;

			expect(newMediaList).toHaveLength(numberOfMedias);
		});

		it("(PlaylistActions.ADD_ONE_MEDIA)should add one media to mediaList", () => {
			const title = faker.unique(faker.name.title);
			const newMedia: Media = {
				dateOfArival: faker.date.past().getTime(),
				path: `home/Music/test/${title}.mp3`,
				duration: formatDuration(100 + 10),
				id: hash(title),
				size: "3.0 MB",
				index: 100,
				title,
			};

			getPlaylistsFuncs().setPlaylists({
				whatToDo: PlaylistActions.ADD_ONE_MEDIA,
				type: PlaylistEnum.UPDATE_MEDIA_LIST,
				media: newMedia,
			});

			const newMediaList = getPlaylist(MEDIA_LIST)!.list;

			expect(newMediaList).toHaveLength(numberOfMedias + 1);
			expect(newMediaList.slice(-1)[0]).toEqual({
				...newMedia,
				index: newMediaList.length - 1,
			});
		});

		it("(PlaylistActions.REMOVE_ONE_MEDIA) should remove one media to mediaList", () => {
			const prevMediaList = getPlaylist(MEDIA_LIST).list;
			const mediaToBeDeleted = prevMediaList[15]!;

			getPlaylistsFuncs().setPlaylists({
				whatToDo: PlaylistActions.REMOVE_ONE_MEDIA,
				type: PlaylistEnum.UPDATE_MEDIA_LIST,
				mediaIndex: mediaToBeDeleted.index,
			});

			const newMediaList = getPlaylist(MEDIA_LIST)!.list;

			expect(newMediaList).toHaveLength(numberOfMedias - 1);
			const expected = newMediaList.find(m => m.path === mediaToBeDeleted.path);
			expect(expected).toBe(undefined);
		});

		it("(PlaylistActions.CLEAN) should clean mediaList", () => {
			getPlaylistsFuncs().setPlaylists({
				type: PlaylistEnum.UPDATE_MEDIA_LIST,
				whatToDo: PlaylistActions.CLEAN,
			});

			const newMediaList = getPlaylist(MEDIA_LIST)!.list;

			expect(newMediaList).toHaveLength(0);
		});

		it("(PlaylistActions.REFRESH_ONE_MEDIA_BY_ID) should refresh one media (the caller should not update the media id, it will be updated, if needed, when calling PlaylistActions.REFRESH_ONE_MEDIA_BY_ID).", () => {
			const prevMediaList = getPlaylist(MEDIA_LIST)!.list;
			const title = "I'm an updated title";
			const size = "1.0 MB" as const;
			const index = 15;
			const mediaToBeRefreshed: Media = {
				...prevMediaList[index]!,
				index: 3290,
				title,
				size,
			};

			getPlaylistsFuncs().setPlaylists({
				whatToDo: PlaylistActions.REFRESH_ONE_MEDIA_BY_ID,
				type: PlaylistEnum.UPDATE_MEDIA_LIST,
				media: mediaToBeRefreshed,
			});

			const newMediaList = getPlaylist(MEDIA_LIST)!.list;

			expect(newMediaList).toHaveLength(numberOfMedias);
			const refreshedMedia = newMediaList[index];
			expect(refreshedMedia).toHaveProperty("title", title);
			expect(refreshedMedia).toHaveProperty("index", index);
			expect(refreshedMedia).toHaveProperty("size", size);
		});
	});
});

describe("Testing the other fns of getPlaylistsFuncs()", () => {
	it("(getPlaylistsFuncs().searchForMedia()) should return a searched media", () => {
		const results = getPlaylistsFuncs().searchForMedia("es");

		expect(results.length).toBeGreaterThan(0);
	});
});
