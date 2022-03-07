/* eslint-disable @typescript-eslint/no-non-null-assertion */

import type { Media } from "@common/@types/typesAndEnums";

import { beforeEach, describe, expect, it, vi } from "vitest";
import { faker } from "@faker-js/faker";

import { formatDuration } from "@common/utils";
import { string2number } from "@main/hash";
import { getRandomInt } from "@utils/utils";

// Mocking `global.electron` before importing code that calls it:
global.electron = {
	notificationApi: {
		sendNotificationToElectron: vi.fn(),
		receiveMsgFromElectron: vi.fn(),
	},
	fs: {
		getFullPathOfFilesForFilesInThisDirectory: vi.fn(),
		readdir: vi.fn(),
		readFile: vi.fn(),
		rm: vi.fn(),
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
		getInfo: vi.fn(),
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

		return keys[index];
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
	SORTED_BY_DATE,
	SORTED_BY_NAME,
	MEDIA_LIST,
	FAVORITES,
	HISTORY,
} from "@contexts/mediaHandler/usePlaylistsHelper";

// Make a test list full of fake medias:
const numberOfMedias = 30;
const testList: Media[] = [];
for (let index = 0; index < numberOfMedias; ++index) {
	const title = faker.unique(faker.name.title);

	testList.push({
		dateOfArival: faker.date.past().getTime(),
		duration: formatDuration(index + 10),
		path: `home/Music/test/${title}.mp3`,
		id: string2number(title),
		size: "3.0 MB",
		title,
		index,
	});
}

const { getState: getCurrentPlaying } = useCurrentPlaying;
const { getState: getPlaylistsFuncs } = usePlaylists;

const getPlaylist = (listName: DefaultLists) =>
	getPlaylistsFuncs().playlists.find(p => p.name === listName);

// Tests:
describe("Testing list updates", () => {
	it("should update the mediaList", () => {
		getPlaylistsFuncs().setPlaylists({
			whatToDo: PlaylistActions.REPLACE_ENTIRE_LIST,
			type: PlaylistEnum.UPDATE_MEDIA_LIST,
			list: testList,
		});

		const currMediaList = getPlaylist(MEDIA_LIST)?.list;

		expect(currMediaList).toEqual(testList);
	});
});

describe("Testing functions that depend on `getPlaylistsFuncs().playlists` working correctly", () => {
	beforeEach(() => {
		// Set the mediaList to our test list:
		getPlaylistsFuncs().setPlaylists({
			whatToDo: PlaylistActions.REPLACE_ENTIRE_LIST,
			type: PlaylistEnum.UPDATE_MEDIA_LIST,
			list: testList,
		});

		// Clean history:
		getPlaylistsFuncs().setPlaylists({
			type: PlaylistEnum.UPDATE_HISTORY,
			whatToDo: PlaylistActions.CLEAN,
		});
		{
			const history = getPlaylist(HISTORY)?.list;
			expect(history?.length).toBe(0);
		}

		// Set currentPlaying to first media:
		const mediaPlaylistList = getPlaylist(MEDIA_LIST)!;
		const firstMedia = mediaPlaylistList!.list[0];
		getCurrentPlaying().setCurrentPlaying({
			type: CurrentPlayingEnum.PLAY_THIS_MEDIA,
			playlist: mediaPlaylistList,
			media: firstMedia,
		});

		{
			const history = getPlaylist(HISTORY)?.list;
			expect(history?.length).toBe(1);
		}
	});

	const playNextMediaFn = () => {
		const mediaListPlaylist = getPlaylist(MEDIA_LIST)!;

		for (let i = 0; i < numberOfMedias; ++i) {
			getCurrentPlaying().setCurrentPlaying({
				type: CurrentPlayingEnum.PLAY_NEXT,
				playlist: mediaListPlaylist,
			});

			// If is the last media, it is going to go back
			// to the first one:
			const expectedMedia =
				mediaListPlaylist.list[i < numberOfMedias - 1 ? i + 1 : 0];
			const currMedia = getCurrentPlaying().currentPlaying.media;

			expect(currMedia).toBe(expectedMedia);
		}

		const history = getPlaylist(HISTORY)?.list;
		// The extra 1 is the first media:
		expect(history?.length).toBe(numberOfMedias + 1);
	};

	it("should play the next media", playNextMediaFn);

	it("should play the previous media", () => {
		const mediaListPlaylist = getPlaylist(MEDIA_LIST)!;

		for (let i = numberOfMedias; i === 0; --i) {
			getCurrentPlaying().setCurrentPlaying({
				type: CurrentPlayingEnum.PLAY_PREVIOUS,
				playlist: mediaListPlaylist,
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
				media: mediaListPlaylist.list[index],
				playlist: mediaListPlaylist,
			});

			const currMedia = getCurrentPlaying().currentPlaying.media;
			const expectedMedia = mediaListPlaylist.list.at(index);

			expect(currMedia).toBe(expectedMedia);
		}
	});

	it("should update the history list", () => {
		playNextMediaFn();

		const history = getPlaylist(HISTORY)?.list;

		// The extra 1 is because the extra firstMedia added
		// at `playNextMediaFn()` above:
		expect(history?.length).toBe(numberOfMedias + 1);
	});

	it("should add one to the history list", () => {
		const mediaList = getPlaylist(MEDIA_LIST)!.list;

		getPlaylistsFuncs().setPlaylists({
			whatToDo: PlaylistActions.ADD_ONE_MEDIA,
			type: PlaylistEnum.UPDATE_HISTORY,
			media: mediaList[1],
		});

		const newHistory = getPlaylist(HISTORY)?.list;

		// The extra 1 is because the extra firstMedia added
		// at `playNextMediaFn()` above:
		expect(newHistory?.length).toBe(1 + 1);

		expect(newHistory?.slice(-1)[0]).toEqual(mediaList[1]);
	});
});
