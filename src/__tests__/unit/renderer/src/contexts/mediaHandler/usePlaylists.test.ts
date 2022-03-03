import type { Media } from "@common/@types/typesAndEnums";

import { expect, it, vi } from "vitest";
import { faker } from "@faker-js/faker";

import { formatDuration } from "@common/utils";
import { string2number } from "@main/hash";

// Mocking global.electron before importing code that calls it:
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

import {
	CurrentPlayingEnum,
	useCurrentPlaying,
	PlaylistActions,
	PlaylistEnum,
	usePlaylists,
} from "@contexts";

// Make a test list full of fake media:
const testList: Media[] = [];
for (let index = 0; index <= 30; ++index) {
	const title = faker.unique(faker.name.title);
	const path = `/music/test/${title}.mp3`;

	testList.push({
		dateOfArival: faker.date.past().getTime(),
		duration: formatDuration(index + 10),
		id: string2number(title),
		size: "3.0 MB",
		title,
		index,
		path,
	});
}

const { getState: getCurrentPlaying } = useCurrentPlaying;
const { getState: getPlaylists } = usePlaylists;

// Set the mediaList to our newly created test list:
getPlaylists().setPlaylists({
	whatToDo: PlaylistActions.REPLACE_ENTIRE_LIST,
	type: PlaylistEnum.UPDATE_MEDIA_LIST,
	list: testList,
});

// Set the current playing to the first media:

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const mediaList = getPlaylists().playlists.find(
	({ name }) => name === "mediaList",
)!;
const firstMedia = mediaList.list[0];

getCurrentPlaying().setCurrentPlaying({
	type: CurrentPlayingEnum.PLAY_THIS_MEDIA,
	playlist: mediaList,
	media: firstMedia,
});

// Tests:
it("should play the next media", () => {
	getCurrentPlaying().setCurrentPlaying({
		type: CurrentPlayingEnum.PLAY_NEXT,
		playlist: mediaList,
	});

	const currPlaying = getCurrentPlaying().currentPlaying.media;
	const secondMedia = mediaList.list[1];

	expect(currPlaying).toBe(secondMedia);
});
