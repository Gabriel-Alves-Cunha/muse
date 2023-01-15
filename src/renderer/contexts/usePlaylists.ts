import type { DateAsNumber, Media, Path } from "@common/@types/generalTypes";
import type { ValuesOf } from "@common/@types/utils";

import { subscribeWithSelector } from "zustand/middleware";
import { create } from "zustand";

import { defaultCurrentPlaying, setCurrentPlaying } from "./useCurrentPlaying";
import { sortByDateOfBirth, sortByTitle } from "./usePlaylistsHelper";
import { setPlaylistsOnLocalStorage } from "./localStorageHelpers";
import { getFromLocalStorage, localStorageKeys } from "@utils/localStorage";
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
	sortedByDate: ReadonlySet<Path>;
	favorites: ReadonlySet<Path>;
	history: History;

	getSortedByDate(): ReadonlySet<Path>;
	getFavorites(): ReadonlySet<Path>;
	getMainList(): MainList;
	getHistory(): History;

	removeFromHistory(path: Path): void;
	addToHistory(path: Path): void;
	clearHistory(): void;

	toggleFavoriteMedia(path: Path): void;
	removeFromFavorites(path: Path): void;
	addToFavorites(path: Path): void;
	clearFavorites(): void;

	updateSortedLists(newMainList: MainList): {
		sortedByTitleAndMainList: MainList;
		sortedByDate: ReadonlySet<Path>;
		favorites?: ReadonlySet<Path>;
		history?: History;
	};
	rescanMedia(path: Path, newMedia?: Media): Promise<void>;
	addToMainList(path: Path, newMedia: Media): void;
	replaceEntireMainList(list: MainList): void;

	removeMedia(path: Path): void;
	cleanAllLists(): void;

	getMedia(path: Path): Media | undefined;
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
				(getFromLocalStorage(
					localStorageKeys.favorites,
				) as ReadonlySet<Path>) ?? emptySet,
			history:
				(getFromLocalStorage(localStorageKeys.history) as History) ?? emptyMap,
			sortedByTitleAndMainList: emptyMap,
			sortedByDate: emptySet,

			///////////////////////////////////////////////////

			getMainList: () => get().sortedByTitleAndMainList,
			getSortedByDate: () => get().sortedByDate,
			getFavorites: () => get().favorites,
			getHistory: () => get().history,

			///////////////////////////////////////////////////

			addToHistory(path) {
				const { maxSizeOfHistory } = getSettings();
				const { history } = get();

				const dates: DateAsNumber[] = [];

				// Add to history if there isn't one yet:
				const historyOfDates = history.get(path);
				historyOfDates
					? dates.unshift(...historyOfDates, Date.now())
					: dates.unshift(Date.now());

				const newHistory = new Map(history).set(path, dates);

				if (newHistory.size > maxSizeOfHistory) {
					// history has a max size of `maxSizeOfHistory`:
					const firstPath = getFirstKey(newHistory)!;
					// remove the first element:
					newHistory.delete(firstPath);
				}

				for (const [, dates] of newHistory)
					if (dates.length > maxSizeOfHistory) dates.length = maxSizeOfHistory;

				set({ history: newHistory });
			},

			///////////////////////////////////////////////////
			///////////////////////////////////////////////////

			removeFromHistory(path) {
				const newHistory = new Map(get().history);

				// Map.delete() returns true if an element in the Map
				// object existed and has been removed, or false if
				// the element does not exist.
				if (newHistory.delete(path)) set({ history: newHistory });
			},

			///////////////////////////////////////////////////
			///////////////////////////////////////////////////

			clearHistory() {
				set({ history: emptyMap });
			},

			///////////////////////////////////////////////////
			///////////////////////////////////////////////////

			addToFavorites(path) {
				const newFavorites = new Set(get().favorites).add(path);

				set({ favorites: newFavorites });
			},

			///////////////////////////////////////////////////
			///////////////////////////////////////////////////

			clearFavorites() {
				set({ favorites: emptySet });
			},

			///////////////////////////////////////////////////
			///////////////////////////////////////////////////

			toggleFavoriteMedia(path) {
				const newFavorites = new Set(get().favorites);

				// Map.delete() returns true if an element in the Map
				// object existed and has been removed, or false if
				// the element does not exist.
				if (!newFavorites.delete(path)) newFavorites.add(path);

				set({ favorites: newFavorites });
			},

			///////////////////////////////////////////////////
			///////////////////////////////////////////////////

			removeFromFavorites(path) {
				const newFavorites = new Set(get().favorites);

				// Set.delete() returns true if an element in the Map
				// object existed and has been removed, or false if
				// the element does not exist.
				if (newFavorites.delete(path)) set({ favorites: newFavorites });
			},

			///////////////////////////////////////////////////
			///////////////////////////////////////////////////

			updateSortedLists: (newMainList: MainList) => ({
				sortedByTitleAndMainList: sortByTitle(newMainList),
				sortedByDate: sortByDateOfBirth(newMainList),
			}),

			///////////////////////////////////////////////////
			///////////////////////////////////////////////////

			addToMainList(path, newMedia) {
				const { sortedByTitleAndMainList: mainList, updateSortedLists } = get();

				if (mainList.has(path))
					return warn(
						`Media "${path}" already exists. So, I'm not gonna add it. If you want to update it, use 'rescanMedia()'.`,
					);

				const newMainList = new Map(mainList);

				set(updateSortedLists(newMainList.set(path, newMedia)));
			},

			///////////////////////////////////////////////////
			///////////////////////////////////////////////////

			removeMedia(path) {
				const {
					sortedByTitleAndMainList,
					updateSortedLists,
					favorites,
					history,
				} = get();

				dbg("Removing media with path =", path);

				const newMainList = new Map(sortedByTitleAndMainList);

				if (!newMainList.delete(path))
					error(`Media "${path}" doesn't exist at mainList!`);

				const newAllSelectedMedias = new Set(getAllSelectedMedias());
				const newFavorites = new Set(favorites);
				const newHistory = new Map(history);

				if (newAllSelectedMedias.delete(path))
					setAllSelectedMedias(newAllSelectedMedias);

				const updatedLists = updateSortedLists(newMainList);
				if (newFavorites.delete(path)) updatedLists.favorites = newFavorites;
				if (newHistory.delete(path)) updatedLists.history = newHistory;

				set(updatedLists);
			},

			///////////////////////////////////////////////////
			///////////////////////////////////////////////////

			replaceEntireMainList(list) {
				time(() => {
					const { favorites, history, updateSortedLists } = get();
					const allSelectedMedias = getAllSelectedMedias();

					const newAllSelectedMedias = new Set(allSelectedMedias);
					const newFavorites = new Set(favorites);
					const newHistory = new Map(history);

					// If the media in the favorites list is not on the new
					// list, remove it from all other lists if present:
					for (const path of favorites)
						if (!list.has(path)) {
							newAllSelectedMedias.delete(path);
							newFavorites.delete(path);
							newHistory.delete(path);
						}

					// If the media in the history list is not on
					// action.list, remove it from the favorites:
					for (const [path] of history)
						if (!list.has(path)) {
							newAllSelectedMedias.delete(path);
							newFavorites.delete(path);
							newHistory.delete(path);
						}

					// Update allSelectedMedias:
					for (const path of newAllSelectedMedias)
						if (!list.has(path)) {
							newAllSelectedMedias.delete(path);
							newFavorites.delete(path);
							newHistory.delete(path);
						}

					const updatedLists = updateSortedLists(list);

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

			async rescanMedia(path, newMedia) {
				function updateLists(newMedia: Media) {
					const newAllSelectedMedias = new Set(getAllSelectedMedias());
					newMainList.delete(path);

					if (newAllSelectedMedias.delete(path))
						setAllSelectedMedias(newAllSelectedMedias);

					const updatedLists = updateSortedLists(
						newMainList.set(path, newMedia),
					);
					const newFavorites = new Set(favorites);
					const newHistory = new Map(history);

					if (newFavorites.delete(path)) {
						newFavorites.add(path);
						updatedLists.favorites = newFavorites;
					}

					const oldMediaOnHistory = newHistory.get(path);
					if (newHistory.delete(path)) {
						newHistory.set(path, oldMediaOnHistory!);
						updatedLists.history = newHistory;
					}

					set(updatedLists);
				}

				const {
					sortedByTitleAndMainList: mainList,
					updateSortedLists,
					favorites,
					history,
				} = get();
				const oldMedia = mainList.get(path);

				if (!oldMedia) {
					warn(`There's no "${path}" to be refreshed. Refreshing all.`);

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
					path,
					assureMediaSizeIsGreaterThan60KB,
					ignoreMediaWithLessThan60Seconds,
				);

				const refreshedMedia = refreshedMediaInArray[0]?.[1];

				if (!refreshedMedia) {
					error(`Transforming "${path}" to a media failed! Refreshing all.`);

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

			getMedia: (path) => get().sortedByTitleAndMainList.get(path),
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
	getFavorites,
	rescanMedia,
	removeMedia,
	getMainList,
	getHistory,
	getMedia,
} = usePlaylists.getState();

///////////////////////////////////////////////////

export function getPlaylist(
	list: ValuesOf<typeof playlistList>,
): ReadonlySet<Path> | MainList | History {
	if (list === playlistList.sortedByDate) return getSortedByDate();
	if (list === playlistList.favorites) return getFavorites();
	if (list === playlistList.mainList) return getMainList();
	if (list === playlistList.history) return getHistory();

	throwErr(`List ${list} is not handled!`);
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
				"",
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

export const searchMedia = (highlight: string): [Path, Media][] =>
	time(() => {
		const medias: [Path, Media][] = [];

		for (const [path, media] of getMainList())
			if (unDiacritic(media.title).includes(highlight))
				medias.push([path, media]);

		return medias;
	}, `searchMedia('${highlight}')`);

///////////////////////////////////////////////////
///////////////////////////////////////////////////
///////////////////////////////////////////////////
// Types:

export type History = ReadonlyMap<Path, DateAsNumber[]>;

export type MainList = ReadonlyMap<Path, Media>;
