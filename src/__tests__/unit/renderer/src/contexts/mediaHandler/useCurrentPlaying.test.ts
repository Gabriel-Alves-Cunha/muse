/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { beforeEach, describe, expect, it } from "vitest";
import { faker } from "@faker-js/faker";

import { mockGlobalsBeforeTests } from "../../../mockGlobalsBeforeTests";
mockGlobalsBeforeTests();

import { formatDuration } from "@common/utils";
import { hash } from "@common/hash";

import { MAIN_LIST, HISTORY } from "@contexts/mediaHandler/usePlaylistsHelper";
import { Media } from "@common/@types/typesAndEnums";
import {
	CurrentPlayingEnum,
	useCurrentPlaying,
	PlaylistActions,
	CurrentPlaying,
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
	const title = faker.unique(faker.name.jobTitle);

	testList.push({
		dateOfArival: faker.date.past().getTime(),
		duration: formatDuration(index + 10),
		path: `home/Music/test/${title}.mp3`,
		favorite: false,
		id: hash(title),
		size: "3.0 MB",
		title,
	});
}
Object.freeze(testList);

describe("Testing useCurrentPlaying", () => {
	beforeEach(() => {
		getPlaylistsFuncs().setPlaylists({
			whatToDo: PlaylistActions.REPLACE_ENTIRE_LIST,
			type: PlaylistEnum.UPDATE_MAIN_LIST,
			list: testList,
		});
		{
			const mainList = getPlaylistsFuncs().mainList;
			expect(mainList).toEqual(testList);
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
				playlistName: MAIN_LIST,
				mediaID: media.id,
			});

			const currentPlaying = getCurrentPlaying().currentPlaying;
			const expected: CurrentPlaying = {
				playlistName: MAIN_LIST,
				mediaID: media.id,
				currentTime: 0,
			};

			expect(expected).toEqual(currentPlaying);
		});
	});

	it("(CurrentPlayingEnum.PLAY_PREVIOUS_FROM_HISTORY) should play the previous media from history", () => {
		testList.forEach((media, index) => {
			if (index === 29) return;

			const nextMedia = testList[index + 1]!;

			// Play a media to make sure history is not empty:
			getCurrentPlaying().setCurrentPlaying({
				type: CurrentPlayingEnum.PLAY_THIS_MEDIA,
				playlistName: MAIN_LIST,
				mediaID: media.id,
			});

			const updatedHistory_1 = getPlaylist(HISTORY)!.list;
			expect(updatedHistory_1[0]).toEqual(media.id);

			// Play the next media:
			getCurrentPlaying().setCurrentPlaying({
				type: CurrentPlayingEnum.PLAY_THIS_MEDIA,
				playlistName: MAIN_LIST,
				mediaID: nextMedia.id,
			});

			const updatedHistory_2 = getPlaylist(HISTORY)!.list;
			expect(updatedHistory_2[0]).toEqual(nextMedia.id);

			// Play previous media:
			getCurrentPlaying().setCurrentPlaying({
				type: CurrentPlayingEnum.PLAY_PREVIOUS_FROM_HISTORY,
				playlistName: MAIN_LIST,
			});

			const currentPlaying = getCurrentPlaying().currentPlaying;
			const expected: CurrentPlaying = {
				playlistName: MAIN_LIST,
				mediaID: media.id,
				currentTime: 0,
			};

			expect(expected).toEqual(currentPlaying);
		});
	});

	it("(CurrentPlayingEnum.PLAY_PREVIOUS_FROM_LIST) should play the previous media from mediaList", () => {
		testList.forEach((media, index) => {
			if (index === 29) return;

			getCurrentPlaying().setCurrentPlaying({
				type: CurrentPlayingEnum.PLAY_THIS_MEDIA,
				playlistName: MAIN_LIST,
				mediaID: media.id,
			});

			getCurrentPlaying().setCurrentPlaying({
				type: CurrentPlayingEnum.PLAY_PREVIOUS_FROM_PLAYLIST,
				playlistName: MAIN_LIST,
			});

			const currentPlaying = getCurrentPlaying().currentPlaying;
			const expected: CurrentPlaying = {
				mediaID: testList.at(index - 1)!.id,
				playlistName: MAIN_LIST,
				currentTime: 0,
			};

			expect(expected).toEqual(currentPlaying);
		});
	});

	it("(CurrentPlayingEnum.PLAY_NEXT_FROM_PLAYLIST) should play the next media from a given playlist", () => {
		testList.forEach((media, index) => {
			if (index === 29) return;

			getCurrentPlaying().setCurrentPlaying({
				type: CurrentPlayingEnum.PLAY_THIS_MEDIA,
				playlistName: MAIN_LIST,
				mediaID: media.id,
			});

			getCurrentPlaying().setCurrentPlaying({
				type: CurrentPlayingEnum.PLAY_NEXT_FROM_PLAYLIST,
				playlistName: MAIN_LIST,
			});

			const currMediaID = getCurrentPlaying().currentPlaying.mediaID;
			const expectedMediaID = testList[index + 1]!.id;

			expect(expectedMediaID).toEqual(currMediaID);
		});
	});
});
