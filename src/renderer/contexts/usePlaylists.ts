import type { DateAsNumber, Media, ID } from "@common/@types/generalTypes";
import type { ValuesOf } from "@common/@types/utils";

import { subscribeWithSelector } from "zustand/middleware";
import create from "zustand";

import { defaultCurrentPlaying, setCurrentPlaying } from "./useCurrentPlaying";
import { setPlaylistsOnLocalStorage } from "./localStorageHelpers";
import { getFromLocalStorage, keys } from "@utils/localStorage";
import { sortByDate, sortByTitle } from "./usePlaylistsHelper";
import { emptyMap, emptySet } from "@common/empty";
import { dbg, dbgPlaylists } from "@common/debug";
import { playlistList } from "@common/enums";
import { error, warn } from "@common/log";
import { getSettings } from "@contexts/settings";
import { getFirstKey } from "@utils/map-set";
import { throwErr } from "@common/log";
import { time } from "@utils/utils";
import {
	getAllSelectedMedias,
	setAllSelectedMedias,
} from "./useAllSelectedMedias";

const { transformPathsToMedias } = electron.media;

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Type for the main function:

export type UsePlaylistsStatesAndActions = Readonly<{
	isLoadingMedias: boolean;

	sortedByTitleAndMainList: MainList;
	sortedByDate: ReadonlySet<ID>;
	favorites: ReadonlySet<ID>;
	history: History;

	getSortedByDate(): ReadonlySet<ID>;
	getFavorites(): ReadonlySet<ID>;
	getMainList(): MainList;
	getHistory(): History;

	removeFromHistory(id: ID): void;
	addToHistory(id: ID): void;
	clearHistory(): void;

	toggleFavoriteMedia(id: ID): void;
	removeFromFavorites(id: ID): void;
	addToFavorites(id: ID): void;
	clearFavorites(): void;

	updatedSorted(newMainList: MainList): {
		sortedByTitleAndMainList: MainList;
		sortedByDate: ReadonlySet<ID>;
		favorites?: ReadonlySet<ID>;
		history?: History;
	};
	refreshMedia(oldID: ID, newID: ID, newMedia?: Media): Promise<void>;
	addToMainList(id: ID, newMedia: Media): void;
	replaceEntireMainList(list: MainList): void;

	removeMedia(id: ID): void;
	cleanAllLists(): void;

	getMedia(id: ID): Media | undefined;
}>;

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Main function:

export const usePlaylists = create<UsePlaylistsStatesAndActions>()(
	subscribeWithSelector(
		setPlaylistsOnLocalStorage((set, get) => ({
			isLoadingMedias: false,

			favorites:
				(getFromLocalStorage(keys.favorites) as ReadonlySet<ID>) ?? emptySet,
			history: (getFromLocalStorage(keys.history) as History) ?? emptyMap,
			sortedByTitleAndMainList: emptyMap,
			sortedByDate: emptySet,

			///////////////////////////////////////////////////

			getMainList: () => get().sortedByTitleAndMainList,
			getSortedByDate: () => get().sortedByDate,
			getFavorites: () => get().favorites,
			getHistory: () => get().history,

			///////////////////////////////////////////////////

			addToHistory(id) {
				const { maxSizeOfHistory } = getSettings();
				const { history } = get();

				const dates: DateAsNumber[] = [];

				// Add to history if there isn't one yet:
				const historyOfDates = history.get(id);
				historyOfDates
					? dates.unshift(...historyOfDates, Date.now())
					: dates.unshift(Date.now());

				const newHistory = new Map(history).set(id, dates);

				if (newHistory.size > maxSizeOfHistory) {
					// history has a max size of `maxSizeOfHistory`:
					const firstID = getFirstKey(newHistory)!;
					// remove the first element:
					newHistory.delete(firstID);
				}

				for (const [, dates] of newHistory)
					if (dates.length > maxSizeOfHistory) dates.length = maxSizeOfHistory;

				set({ history: newHistory });
			},

			///////////////////////////////////////////////////
			///////////////////////////////////////////////////

			removeFromHistory(id) {
				const newHistory = new Map(get().history);

				// Map.delete() returns true if an element in the Map
				// object existed and has been removed, or false if
				// the element does not exist.
				if (newHistory.delete(id)) set({ history: newHistory });
			},

			///////////////////////////////////////////////////
			///////////////////////////////////////////////////

			clearHistory() {
				set({ history: emptyMap });
			},

			///////////////////////////////////////////////////
			///////////////////////////////////////////////////

			addToFavorites(id) {
				const newFavorites = new Set(get().favorites).add(id);

				set({ favorites: newFavorites });
			},

			///////////////////////////////////////////////////
			///////////////////////////////////////////////////

			clearFavorites() {
				set({ favorites: emptySet });
			},

			///////////////////////////////////////////////////
			///////////////////////////////////////////////////

			toggleFavoriteMedia(id) {
				const newFavorites = new Set(get().favorites);

				// Map.delete() returns true if an element in the Map
				// object existed and has been removed, or false if
				// the element does not exist.
				if (!newFavorites.delete(id)) newFavorites.add(id);

				set({ favorites: newFavorites });
			},

			///////////////////////////////////////////////////
			///////////////////////////////////////////////////

			removeFromFavorites(id) {
				const newFavorites = new Set(get().favorites);

				// Set.delete() returns true if an element in the Map
				// object existed and has been removed, or false if
				// the element does not exist.
				if (newFavorites.delete(id)) set({ favorites: newFavorites });
			},

			///////////////////////////////////////////////////
			///////////////////////////////////////////////////

			updatedSorted: (newMainList: MainList) => ({
				sortedByTitleAndMainList: sortByTitle(newMainList),
				sortedByDate: sortByDate(newMainList),
			}),

			///////////////////////////////////////////////////
			///////////////////////////////////////////////////

			addToMainList(id, newMedia) {
				const { sortedByTitleAndMainList: mainList, updatedSorted } = get();

				if (mainList.has(id))
					return warn(
						`A media with id "${id}" already exists. Therefore, I'm not gonna add it. If you want to update it, call the function refreshMedia().`,
					);

				const newMainList = new Map(mainList);

				set(updatedSorted(newMainList.set(id, newMedia)));
			},

			///////////////////////////////////////////////////
			///////////////////////////////////////////////////

			removeMedia(id) {
				const { sortedByTitleAndMainList, updatedSorted, favorites, history } =
					get();

				dbg("Removing media with id =", id);

				const newMainList = new Map(sortedByTitleAndMainList);

				if (!newMainList.delete(id))
					error(
						`A media with id "${id}" does not exist at sortedByNameAndMainList.`,
					);

				const newAllSelectedMedias = new Set(getAllSelectedMedias());
				const newFavorites = new Set(favorites);
				const newHistory = new Map(history);

				if (newAllSelectedMedias.delete(id))
					setAllSelectedMedias(newAllSelectedMedias);

				const updatedLists = updatedSorted(newMainList);
				if (newFavorites.delete(id)) updatedLists.favorites = newFavorites;
				if (newHistory.delete(id)) updatedLists.history = newHistory;

				set(updatedLists);
			},

			///////////////////////////////////////////////////
			///////////////////////////////////////////////////

			replaceEntireMainList(list) {
				time(() => {
					const { favorites, history, updatedSorted } = get();
					const allSelectedMedias = getAllSelectedMedias();

					const newAllSelectedMedias = new Set(allSelectedMedias);
					const newFavorites = new Set(favorites);
					const newHistory = new Map(history);

					// If the media in the favorites list is not on the new
					// list, remove it from all other lists if present:
					for (const id of favorites)
						if (!list.has(id)) {
							newAllSelectedMedias.delete(id);
							newFavorites.delete(id);
							newHistory.delete(id);
						}

					// If the media in the history list is not on
					// action.list, remove it from the favorites:
					for (const [id] of history)
						if (!list.has(id)) {
							newAllSelectedMedias.delete(id);
							newFavorites.delete(id);
							newHistory.delete(id);
						}

					// Update allSelectedMedias:
					for (const id of newAllSelectedMedias)
						if (!list.has(id)) {
							newAllSelectedMedias.delete(id);
							newFavorites.delete(id);
							newHistory.delete(id);
						}

					const updatedLists = updatedSorted(list);

					if (history.size !== newHistory.size)
						updatedLists.history = newHistory;
					if (favorites.size !== newFavorites.size)
						updatedLists.favorites = newFavorites;
					if (allSelectedMedias.size !== newAllSelectedMedias.size)
						setAllSelectedMedias(newAllSelectedMedias);

					set(updatedLists);
				}, "replaceEntireMainList");
			},

			///////////////////////////////////////////////////
			///////////////////////////////////////////////////

			async refreshMedia(oldID, newID, newMedia) {
				function updateLists(newMedia: Media) {
					const newAllSelectedMedias = new Set(getAllSelectedMedias());
					newMainList.delete(oldID);

					if (newAllSelectedMedias.delete(oldID))
						setAllSelectedMedias(newAllSelectedMedias);

					const updatedLists = updatedSorted(newMainList.set(newID, newMedia));
					const newFavorites = new Set(favorites);
					const newHistory = new Map(history);

					if (newFavorites.delete(oldID)) {
						newFavorites.add(newID);
						updatedLists.favorites = newFavorites;
					}
					const oldMediaOnHistory = newHistory.get(oldID);
					if (newHistory.delete(oldID)) {
						newHistory.set(newID, oldMediaOnHistory!);
						updatedLists.history = newHistory;
					}

					set(updatedLists);
				}

				const {
					sortedByTitleAndMainList: mainList,
					updatedSorted,
					favorites,
					history,
				} = get();
				const oldMedia = mainList.get(oldID);

				if (!oldMedia) {
					warn(
						`There should be a media with id = "${oldID}" to be refreshed, but there isn't!\nRefreshing all media instead.`,
					);

					return await searchLocalComputerForMedias();
				}

				const newMainList = new Map(mainList);

				// If a new media was given, just update it:
				if (newMedia) return updateLists(newMedia);

				const {
					assureMediaSizeIsGreaterThan60KB,
					ignoreMediaWithLessThan60Seconds,
				} = getSettings();

				const refreshedMediaInArray = await transformPathsToMedias(
					oldMedia.path,
					assureMediaSizeIsGreaterThan60KB,
					ignoreMediaWithLessThan60Seconds,
				);

				const refreshedMedia = refreshedMediaInArray[0]?.[1];

				if (!refreshedMedia) {
					error(
						`I wasn't able to transform this media (id = "${oldID}") to a media to be refreshed!\nRefreshing all media instead.`,
					);

					return await searchLocalComputerForMedias();
				}

				updateLists(refreshedMedia);
			},

			///////////////////////////////////////////////////
			///////////////////////////////////////////////////

			cleanAllLists() {
				set({
					sortedByTitleAndMainList: emptyMap,
					sortedByDate: emptySet,
					favorites: emptySet,
					history: emptyMap,
				});

				setCurrentPlaying(defaultCurrentPlaying);

				setAllSelectedMedias(emptySet);
			},

			///////////////////////////////////////////////////
			///////////////////////////////////////////////////

			getMedia: (id) => get().sortedByTitleAndMainList.get(id),
		})),
	),
);

///////////////////////////////////////////////////
///////////////////////////////////////////////////
///////////////////////////////////////////////////
// Helper funtions:

export const {
	replaceEntireMainList,
	toggleFavoriteMedia,
	removeFromFavorites,
	getSortedByDate,
	addToFavorites,
	clearFavorites,
	addToMainList,
	cleanAllLists,
	addToHistory,
	clearHistory,
	refreshMedia,
	getFavorites,
	removeMedia,
	getMainList,
	getHistory,
	getMedia,
} = usePlaylists.getState();

///////////////////////////////////////////////////

export function getPlaylist(
	list: ValuesOf<typeof playlistList>,
): ReadonlySet<ID> | MainList | History {
	if (list === playlistList.sortedByDate) return getSortedByDate();
	if (list === playlistList.favorites) return getFavorites();
	if (list === playlistList.mainList) return getMainList();
	if (list === playlistList.history) return getHistory();

	throw throwErr(`List ${list} is not handled!`);
}

///////////////////////////////////////////////////

export async function searchLocalComputerForMedias(): Promise<void> {
	try {
		usePlaylists.setState({ isLoadingMedias: true });

		const {
			assureMediaSizeIsGreaterThan60KB,
			ignoreMediaWithLessThan60Seconds,
		} = getSettings();

		const newMainList: MainList = new Map(
			await transformPathsToMedias(
				undefined,
				assureMediaSizeIsGreaterThan60KB,
				ignoreMediaWithLessThan60Seconds,
			),
		);

		dbgPlaylists("Finished searching, newMainList =", newMainList);

		replaceEntireMainList(newMainList);
	} catch (err) {
		error("Error on searchLocalComputerForMedias():", err);
	} finally {
		usePlaylists.setState({ isLoadingMedias: false });
	}
}

///////////////////////////////////////////////////

const diacriticRegex = /\p{Diacritic}/gu;

/** normalize()ing to NFD Unicode normal form decomposes
 * combined graphemes into the combination of simple ones.
 * The è of Crème ends up expressed as e +  ̀.
 * It is now trivial to globally get rid of the diacritics,
 * which the Unicode standard conveniently groups as the
 * Combining Diacritical Marks Unicode block.
 */
export const unDiacritic = (str: string): string =>
	str.normalize("NFD").toLowerCase().replaceAll(diacriticRegex, "");

export const searchMedia = (highlight: string): [ID, Media][] =>
	time(() => {
		const medias: [ID, Media][] = [];

		for (const [id, media] of getMainList())
			if (unDiacritic(media.title).includes(highlight))
				medias.push([id, media]);

		return medias;
	}, `searchMedia('${highlight}')`);

///////////////////////////////////////////////////
///////////////////////////////////////////////////
///////////////////////////////////////////////////
// Types:

export type History = ReadonlyMap<ID, DateAsNumber[]>;

export type MainList = ReadonlyMap<ID, Media>;
