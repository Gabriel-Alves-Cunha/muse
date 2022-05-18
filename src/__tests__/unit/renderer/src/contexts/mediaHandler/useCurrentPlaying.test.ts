/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { beforeEach, describe, expect, it } from "vitest";

import { mockGlobalsBeforeTests } from "../../../mockGlobalsBeforeTests";
mockGlobalsBeforeTests();

import { HISTORY, MAIN_LIST } from "@contexts/mediaHandler/usePlaylistsHelper";
import { testList } from "./fakeTestList";
import {
	CurrentPlayingEnum,
	getCurrentPlaying,
	setCurrentPlaying,
	CurrentPlaying,
} from "@contexts/mediaHandler/useCurrentPlaying";
import {
	type DefaultLists,
	PlaylistActions,
	getPlaylists,
	setPlaylists,
	PlaylistEnum,
} from "@contexts/mediaHandler/usePlaylists";

const getPlaylist = (listName: DefaultLists) =>
	getPlaylists().playlists.find(p => p.name === listName)!;

describe("Testing useCurrentPlaying", () => {
	beforeEach(() => {
		setPlaylists({
			whatToDo: PlaylistActions.REPLACE_ENTIRE_LIST,
			type: PlaylistEnum.UPDATE_MAIN_LIST,
			list: testList,
		});
		{
			const mainList = getPlaylists().mainList;
			expect(mainList).toEqual(testList);
		}

		setPlaylists({
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
			setCurrentPlaying({
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

	it("(CurrentPlayingEnum.PLAY_PREVIOUS_FROM_PLAYLIST) should play the previous media from mediaList  and update history", () => {
		testList.forEach(({ id }, index) => {
			if (index === 29) return;

			setCurrentPlaying({
				type: CurrentPlayingEnum.PLAY_THIS_MEDIA,
				playlistName: MAIN_LIST,
				mediaID: id,
			});

			setCurrentPlaying({
				type: CurrentPlayingEnum.PLAY_PREVIOUS_FROM_PLAYLIST,
				playlistName: MAIN_LIST,
			});

			const history = getPlaylist(HISTORY).list;

			expect(history.length).toBe(index * 2 + 2);

			const currentPlaying = getCurrentPlaying().currentPlaying;
			const expected: CurrentPlaying = {
				mediaID: testList.at(index - 1)?.id,
				playlistName: MAIN_LIST,
				currentTime: 0,
			};

			expect(expected).toEqual(currentPlaying);
		});
	});

	it("(CurrentPlayingEnum.PLAY_NEXT_FROM_PLAYLIST) should play the next media from a given playlist", () => {
		testList.forEach((media, index) => {
			if (index === 29) return;

			setCurrentPlaying({
				type: CurrentPlayingEnum.PLAY_THIS_MEDIA,
				playlistName: MAIN_LIST,
				mediaID: media.id,
			});

			setCurrentPlaying({
				type: CurrentPlayingEnum.PLAY_NEXT_FROM_PLAYLIST,
				playlistName: MAIN_LIST,
			});

			const currMediaID = getCurrentPlaying().currentPlaying.mediaID;
			const expectedMediaID = testList[index + 1]!.id;

			expect(expectedMediaID).toEqual(currMediaID);
		});
	});
});
