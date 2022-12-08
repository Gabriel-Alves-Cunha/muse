import type { DateAsNumber, Media, Path } from "@common/@types/generalTypes";
import type { ValuesOf } from "@common/@types/utils";

import { subscribeWithSelector } from "zustand/middleware";
import create from "zustand";

import { defaultCurrentPlaying, setCurrentPlaying } from "./useCurrentPlaying";
import { setPlaylistsOnLocalStorage } from "./localStorageHelpers";
import { getFromLocalStorage, keys } from "@utils/localStorage";
import { emptyMap, emptySet } from "@common/empty";
import { playlistList } from "@common/enums";
import { dbgPlaylists } from "@common/debug";
import { error, warn } from "@utils/log";
import { getSettings } from "@contexts/settings";
import { getFirstKey } from "@utils/map-set";
import { time } from "@utils/utils";
import {
	getAllSelectedMedias,
	setAllSelectedMedias,
} from "./useAllSelectedMedias";
import {
	searchDirectoryResult,
	getAllowedMedias,
	sortByDate,
	sortByName,
} from "./usePlaylistsHelper";

const { transformPathsToMedias } = electron.media;

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Type for the main function:

export type UsePlaylistsStatesAndActions = Readonly<{
	isLoadingMedias: boolean;

	sortedByNameAndMainList: MainList;
	sortedByDate: ReadonlySet<Path>;
	favorites: ReadonlySet<Path>;
	history: History;

	getSortedByDate(): ReadonlySet<Path>;
	getFavorites(): ReadonlySet<Path>;
	getMainList(): MainList;
	getHistory(): History;

	addToHistory(path: Path): void;
	clearHistory(): void;

	toggleFavoriteMedia(path: Path): void;
	removeFromFavorites(path: Path): void;
	addToFavorites(path: Path): void;
	clearFavorites(): void;

	refreshMedia(path: Path, newPath: Path, newMedia?: Media): Promise<void>;
	updateAndSortSortedAndMainLists(newMainList: MainList): void;
	addToMainList(path: Path, newMedia: Media): void;
	replaceEntireMainList(list: MainList): void;

	removeMedia(path: Path): void;
	cleanAllLists(): void;
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
				(getFromLocalStorage(keys.favorites) as ReadonlySet<Path>) ?? emptySet,
			history: (getFromLocalStorage(keys.history) as History) ?? emptyMap,
			sortedByNameAndMainList: emptyMap,
			sortedByDate: emptySet,

			///////////////////////////////////////////////////

			getMainList: () => get().sortedByNameAndMainList,
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
				if (!path) return;

				const newFavorites = new Set(get().favorites);

				// map.delete() returns true if an element in the Map
				// object existed and has been removed, or false if
				// the element does not exist.
				if (!newFavorites.delete(path)) newFavorites.add(path);

				set({ favorites: newFavorites });
			},

			///////////////////////////////////////////////////
			///////////////////////////////////////////////////

			removeFromFavorites(path) {
				const { favorites } = get();

				if (!favorites.has(path)) return error("Media not found in favorites");

				const newFavorites = new Set(favorites);
				newFavorites.delete(path);

				set({ favorites: newFavorites });
			},

			///////////////////////////////////////////////////
			///////////////////////////////////////////////////

			updateAndSortSortedAndMainLists(newMainList: MainList) {
				set({
					sortedByNameAndMainList: sortByName(newMainList),
					sortedByDate: sortByDate(newMainList),
				});
			},

			///////////////////////////////////////////////////
			///////////////////////////////////////////////////

			addToMainList(path, newMedia) {
				const {
					sortedByNameAndMainList: mainList,
					updateAndSortSortedAndMainLists,
				} = get();

				if (mainList.has(path))
					return warn(
						`A media with path "${path}" already exists. Therefore, I'm not gonna add it. If you want to update it, call this function with type = PlaylistActions.REFRESH_ONE_MEDIA_BY_PATH`,
					);

				const newMainList = new Map(mainList);

				updateAndSortSortedAndMainLists(newMainList.set(path, newMedia));
			},

			///////////////////////////////////////////////////
			///////////////////////////////////////////////////

			removeMedia(path) {
				const { sortedByNameAndMainList, sortedByDate, favorites, history } =
					get();

				const newMainList = new Map(sortedByNameAndMainList);
				const newSortedByDate = new Set(sortedByDate);
				const newFavorites = new Set(favorites);
				const newHistory = new Map(history);

				if (!newMainList.delete(path))
					return error(
						`A media with path "${path}" does not exist at sortedByName.`,
					);

				if (!newSortedByDate.delete(path))
					return error(
						`A media with path "${path}" does not exist at newSortedByDate.`,
					);

				set({
					sortedByNameAndMainList: newMainList,
					sortedByDate: newSortedByDate,
				});

				// If the media is in the favorites, remove it from the favorites
				if (newFavorites.delete(path)) set({ favorites: newFavorites });

				// If the media is in the history, remove it from the history
				if (newHistory.delete(path)) set({ history: newHistory });
			},

			///////////////////////////////////////////////////
			///////////////////////////////////////////////////

			// TODO: This can surely be optimised...
			replaceEntireMainList(list) {
				time(() => {
					const { favorites, history, updateAndSortSortedAndMainLists } = get();
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

					if (history.size !== newHistory.size) set({ history: newHistory });
					if (allSelectedMedias.size !== newAllSelectedMedias.size)
						setAllSelectedMedias(newAllSelectedMedias);
					if (favorites.size !== newFavorites.size)
						set({ favorites: newFavorites });

					updateAndSortSortedAndMainLists(list);
				}, "replaceEntireMainList");
			},

			///////////////////////////////////////////////////
			///////////////////////////////////////////////////

			async refreshMedia(path, newPath, newMedia) {
				const {
					sortedByNameAndMainList: mainList,
					updateAndSortSortedAndMainLists,
				} = get();
				const oldMedia = mainList.get(path);

				if (!oldMedia) {
					warn(
						`There should be a media with path = "${path}" to be refreshed, but there isn't!\nRefreshing all media instead.`,
					);

					return await searchLocalComputerForMedias();
				}

				const newMainList = new Map(mainList);

				// If a new media was given, just update it:
				if (newMedia)
					return set({
						sortedByNameAndMainList: newMainList.set(path, newMedia),
					});

				const {
					assureMediaSizeIsGreaterThan60KB,
					ignoreMediaWithLessThan60Seconds,
				} = getSettings();

				const refreshedMediaInArray: readonly [Path, Media][] =
					await transformPathsToMedias(
						[path],
						assureMediaSizeIsGreaterThan60KB,
						ignoreMediaWithLessThan60Seconds,
					);

				const refreshedMedia = refreshedMediaInArray[0]?.[1];

				if (!refreshedMedia) {
					error(
						`I wasn't able to transform this path (${path}) to a media to be refreshed!\nRefreshing all media instead.`,
					);

					return await searchLocalComputerForMedias();
				}

				if (newPath) {
					newMainList.delete(path);
					newMainList.set(newPath, refreshedMedia);

					// Only sort if the their titles are different:
					if (refreshedMedia.title !== oldMedia.title)
						updateAndSortSortedAndMainLists(newMainList);
					// Else, just update the media in the main list,
					// cause the title is the same, so no need to sort:
					else set({ sortedByNameAndMainList: newMainList });
				} ////////////////////////////////////////////////
				else if (refreshedMedia.title !== oldMedia.title)
					updateAndSortSortedAndMainLists(
						newMainList.set(path, refreshedMedia),
					);
				////////////////////////////////////////////////
				else
					set({
						sortedByNameAndMainList: newMainList.set(path, refreshedMedia),
					});
			},

			///////////////////////////////////////////////////
			///////////////////////////////////////////////////

			cleanAllLists() {
				set({
					sortedByNameAndMainList: emptyMap,
					sortedByDate: emptySet,
					favorites: emptySet,
					history: emptyMap,
				});

				setCurrentPlaying(defaultCurrentPlaying);

				setAllSelectedMedias(emptySet);
			},
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
} = usePlaylists.getState();

///////////////////////////////////////////////////

export function getPlaylist(
	list: ValuesOf<typeof playlistList>,
): ReadonlySet<Path> | MainList | History {
	if (list === playlistList.sortedByDate) return getSortedByDate();
	if (list === playlistList.favorites) return getFavorites();
	if (list === playlistList.mainList) return getMainList();
	if (list === playlistList.history) return getHistory();

	throw new Error(`List ${list} is not handled!`);
}

///////////////////////////////////////////////////

export async function searchLocalComputerForMedias(): Promise<void> {
	try {
		usePlaylists.setState({ isLoadingMedias: true });

		const paths = getAllowedMedias(await searchDirectoryResult());

		const {
			assureMediaSizeIsGreaterThan60KB,
			ignoreMediaWithLessThan60Seconds,
		} = getSettings();

		const newMainList: MainList = new Map(
			await transformPathsToMedias(
				paths,
				assureMediaSizeIsGreaterThan60KB,
				ignoreMediaWithLessThan60Seconds,
			),
		);

		dbgPlaylists(
			"Finished searching, paths =",
			paths,
			"Finished searching, newMainList =",
			newMainList,
		);

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
	str.toLocaleLowerCase().normalize("NFD").replaceAll(diacriticRegex, "");

export function searchMedia(highlight: string): [Path, Media][] {
	return time(() => {
		const medias: [Path, Media][] = [];

		for (const [path, media] of getMainList())
			if (unDiacritic(media.title).includes(highlight))
				medias.push([path, media]);

		return medias;
	}, `searchMedia('${highlight}')`);
}

///////////////////////////////////////////////////
///////////////////////////////////////////////////
///////////////////////////////////////////////////
// Types:

export type History = ReadonlyMap<Path, DateAsNumber[]>;

export type MainList = ReadonlyMap<Path, Media>;
