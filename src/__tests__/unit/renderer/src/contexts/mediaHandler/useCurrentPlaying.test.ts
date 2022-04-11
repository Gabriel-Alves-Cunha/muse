/* eslint-disable @typescript-eslint/no-non-null-assertion */

import type { CurrentPlaying } from "@contexts";
import type { Media } from "@common/@types/typesAndEnums";

import { beforeEach, describe, expect, it, vi } from "vitest";
import { faker } from "@faker-js/faker";

import { formatDuration } from "@common/utils";
import { hash } from "@common/hash";

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

import { MEDIA_LIST, HISTORY } from "@contexts/mediaHandler/usePlaylistsHelper";
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
		favorite: false,
		id: hash(title),
		size: "3.0 MB",
		title,
		index,
	});
}

describe("Testing useCurrentPlaying", () => {
	beforeEach(() => {
		getPlaylistsFuncs().setPlaylists({
			whatToDo: PlaylistActions.REPLACE_ENTIRE_LIST,
			type: PlaylistEnum.UPDATE_MAIN_LIST,
			list: testList,
		});
		{
			const mediaList = getPlaylist(MEDIA_LIST)!.list;
			expect(mediaList).toEqual(testList);
		}

		getPlaylistsFuncs().setPlaylists({
			type: PlaylistEnum.UPDATE_HISTORY,
			whatToDo: PlaylistActions.CLEAN,
		});
		{
			const history = getPlaylist(HISTORY)!.list;
			expect(history.length).toBe(0);
		}
	});

	it("(CurrentPlayingEnum.PLAY_THIS_MEDIA) should set the currentPlaying media", () => {
		testList.forEach(media => {
			getCurrentPlaying().setCurrentPlaying({
				type: CurrentPlayingEnum.PLAY_THIS_MEDIA,
				playlistName: MEDIA_LIST,
				media,
			});

			const currentPlaying = getCurrentPlaying().currentPlaying;
			const expected: CurrentPlaying = {
				playlistName: MEDIA_LIST,
				currentTime: 0,
				media,
			};

			expect(expected).toEqual(currentPlaying);
		});
	});

	it("(CurrentPlayingEnum.PLAY_PREVIOUS_FROM_HISTORY) should play the previous media from history", () => {
		for (let i = 0; i < numberOfMedias - 1; ++i) {
			const nextMedia = testList[i + 1]!;
			const media = testList[i]!;

			// Play a media to make sure history is not empty:
			getCurrentPlaying().setCurrentPlaying({
				type: CurrentPlayingEnum.PLAY_THIS_MEDIA,
				playlistName: MEDIA_LIST,
				media,
			});

			const updatedHistory_1 = getPlaylist(HISTORY)!.list;
			expect(updatedHistory_1[0]).toEqual(media);

			// Play the next media:
			getCurrentPlaying().setCurrentPlaying({
				type: CurrentPlayingEnum.PLAY_THIS_MEDIA,
				playlistName: MEDIA_LIST,
				media: nextMedia,
			});

			const updatedHistory_2 = getPlaylist(HISTORY)!.list;
			expect(updatedHistory_2[0]).toEqual(nextMedia);

			// Play previous media:
			getCurrentPlaying().setCurrentPlaying({
				type: CurrentPlayingEnum.PLAY_PREVIOUS_FROM_HISTORY,
				playlistName: MEDIA_LIST,
			});

			const currentPlaying = getCurrentPlaying().currentPlaying;
			const expected: CurrentPlaying = {
				playlistName: MEDIA_LIST,
				currentTime: 0,
				media,
			};

			expect(expected).toEqual(currentPlaying);
		}
	});

	it("(CurrentPlayingEnum.PLAY_PREVIOUS_FROM_LIST) should play the previous media from mediaList", () => {
		for (let i = 0; i < numberOfMedias - 1; ++i) {
			getCurrentPlaying().setCurrentPlaying({
				type: CurrentPlayingEnum.PLAY_THIS_MEDIA,
				playlistName: MEDIA_LIST,
				media: testList[i]!,
			});

			getCurrentPlaying().setCurrentPlaying({
				type: CurrentPlayingEnum.PLAY_PREVIOUS_FROM_PLAYLIST,
				playlistName: MEDIA_LIST,
			});

			const currentPlaying = getCurrentPlaying().currentPlaying;
			const expected: CurrentPlaying = {
				media: testList.at(i - 1),
				playlistName: MEDIA_LIST,
				currentTime: 0,
			};

			expect(expected).toEqual(currentPlaying);
		}
	});

	it("(CurrentPlayingEnum.PLAY_NEXT_FROM_PLAYLIST) should play the next media from a given playlist", () => {
		for (let i = 0; i < numberOfMedias - 1; ++i) {
			getCurrentPlaying().setCurrentPlaying({
				type: CurrentPlayingEnum.PLAY_THIS_MEDIA,
				playlistName: MEDIA_LIST,
				media: testList[i]!,
			});

			getCurrentPlaying().setCurrentPlaying({
				type: CurrentPlayingEnum.PLAY_NEXT_FROM_PLAYLIST,
				playlistName: MEDIA_LIST,
			});

			const currMedia = getCurrentPlaying().currentPlaying.media;
			const expectedMedia = testList[i + 1];

			expect(expectedMedia).toEqual(currMedia);
		}
	});
});
