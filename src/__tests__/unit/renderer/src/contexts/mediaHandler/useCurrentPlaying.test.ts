/* eslint-disable @typescript-eslint/no-non-null-assertion */

import type { Media } from "@common/@types/typesAndEnums";

import { beforeEach, describe, expect, it, vi } from "vitest";
import { faker } from "@faker-js/faker";

import { formatDuration } from "@common/utils";
import { string2number } from "@common/hash";

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

import { MEDIA_LIST } from "@contexts/mediaHandler/usePlaylistsHelper";
import {
	CurrentPlayingEnum,
	useCurrentPlaying,
	PlaylistActions,
	usePlaylists,
	DefaultLists,
	PlaylistEnum,
} from "@contexts";

const { getState: getCurrentPlaying } = useCurrentPlaying;
const { getState: getPlaylistsFuncs } = usePlaylists;

const getPlaylist = (listName: DefaultLists) =>
	getPlaylistsFuncs().playlists.find(p => p.name === listName)!;

// Make a test list full of fake medias:
const testList: Media[] = [];
const numberOfMedias = 30;
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

describe("Testing useCurrentPlaying", () => {
	beforeEach(() => {
		getPlaylistsFuncs().setPlaylists({
			whatToDo: PlaylistActions.REPLACE_ENTIRE_LIST,
			type: PlaylistEnum.UPDATE_MEDIA_LIST,
			list: testList,
		});

		getPlaylistsFuncs().setPlaylists({
			type: PlaylistEnum.UPDATE_HISTORY,
			whatToDo: PlaylistActions.CLEAN,
		});

		const currMediaList = getPlaylist(MEDIA_LIST).list;

		expect(currMediaList).toEqual(testList);
	});

	it("(CurrentPlayingEnum.PLAY_THIS_MEDIA) should set the currentPlaying media", () => {
		const playlist = getPlaylist(MEDIA_LIST);

		for (let i = 0; i < numberOfMedias; ++i) {
			const media = testList[i];

			getCurrentPlaying().setCurrentPlaying({
				type: CurrentPlayingEnum.PLAY_THIS_MEDIA,
				playlist,
				media,
			});

			const currentPlaying = getCurrentPlaying().currentPlaying;
			const expected = {
				currentTime: 0,
				playlist,
				media,
			};

			expect(expected).toEqual(currentPlaying);
		}
	});

	it("(CurrentPlayingEnum.PLAY_PREVIOUS_FROM_HISTORY) should play the previous media from history", () => {
		const playlist = getPlaylist(MEDIA_LIST);

		for (let i = 0; i < numberOfMedias - 1; ++i) {
			getCurrentPlaying().setCurrentPlaying({
				type: CurrentPlayingEnum.PLAY_THIS_MEDIA,
				media: testList[20],
				playlist,
			});
			getCurrentPlaying().setCurrentPlaying({
				type: CurrentPlayingEnum.PLAY_THIS_MEDIA,
				media: testList[20 + 1],
				playlist,
			});

			getCurrentPlaying().setCurrentPlaying({
				type: CurrentPlayingEnum.PLAY_PREVIOUS_FROM_HISTORY,
				playlist,
			});

			const currentPlaying = getCurrentPlaying().currentPlaying;
			const expected = {
				media: testList[20],
				currentTime: 0,
				playlist,
			};

			expect(expected).toEqual(currentPlaying);
		}
	});

	it("(CurrentPlayingEnum.PLAY_PREVIOUS_FROM_LIST) should play the previous media from mediaList", () => {
		const playlist = getPlaylist(MEDIA_LIST);

		for (let i = 0; i < numberOfMedias - 1; ++i) {
			getCurrentPlaying().setCurrentPlaying({
				type: CurrentPlayingEnum.PLAY_THIS_MEDIA,
				media: testList[i],
				playlist,
			});

			getCurrentPlaying().setCurrentPlaying({
				type: CurrentPlayingEnum.PLAY_PREVIOUS_FROM_LIST,
				playlist,
			});

			const currentPlaying = getCurrentPlaying().currentPlaying;
			const expected = {
				media: testList.at(i - 1),
				currentTime: 0,
				playlist,
			};

			expect(expected).toEqual(currentPlaying);
		}
	});

	it("(CurrentPlayingEnum.PLAY_NEXT_FROM_PLAYLIST) should play the next media from a given playlist", () => {
		const playlist = getPlaylist(MEDIA_LIST);

		for (let i = 0; i < numberOfMedias - 1; ++i) {
			getCurrentPlaying().setCurrentPlaying({
				type: CurrentPlayingEnum.PLAY_THIS_MEDIA,
				media: testList[i],
				playlist,
			});

			getCurrentPlaying().setCurrentPlaying({
				type: CurrentPlayingEnum.PLAY_NEXT_FROM_PLAYLIST,
				playlist,
			});

			const currMedia = getCurrentPlaying().currentPlaying.media;
			const expectedMedia = testList[i + 1];

			expect(expectedMedia).toEqual(currMedia);
		}
	});
});
