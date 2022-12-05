import type { DateAsNumber, Media, Path } from "@common/@types/generalTypes";
import type { ValuesOf } from "@common/@types/utils";

import { batch, createEffect, createSignal } from "solid-js";

import { defaultCurrentPlaying, setCurrentPlaying } from "./useCurrentPlaying";
import { assertUnreachable, time } from "@utils/utils";
import { dbg, dbgPlaylists } from "@common/debug";
import { playlistList } from "@common/enums";
import { error, warn } from "@utils/log";
import { getSettings } from "@contexts/settings";
import { getFirstKey } from "@utils/map-set";
import {
	getFromLocalStorage,
	setLocalStorage,
	keys,
} from "@utils/localStorage";
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

export const [isLoadingMedias, setIsLoadingMedias] = createSignal(false);

export const [getPlaylists, setPlaylists] = createSignal<Playlists>({
	favorites: (getFromLocalStorage(keys.favorites) as Set<Path>) ?? new Set(),
	history: (getFromLocalStorage(keys.history) as History) ?? new Map(),
	sortedByNameAndMainList: new Map(),
	sortedByDate: new Set(),
});

createEffect(() => {
	dbg("Saving favorites in LocalStorage.");

	setLocalStorage(keys.favorites, getPlaylists().favorites);
});

createEffect(() => {
	dbg("Saving history in LocalStorage.");

	setLocalStorage(keys.history, getPlaylists().history);
});

////////////////////////////////////////////////

export const addToHistory = (path: Path): void => {
	const { maxSizeOfHistory } = getSettings();
	const { history } = getPlaylists();

	const dates: DateAsNumber[] = [];

	// Add to history if there isn't one yet:
	const historyOfDates = history.get(path);
	historyOfDates
		? dates.unshift(...historyOfDates, Date.now())
		: dates.unshift(Date.now());

	history.set(path, dates);

	if (history.size > maxSizeOfHistory) {
		// history has a max size of `maxSizeOfHistory`:
		const firstPath = getFirstKey(history)!;
		// remove the first element:
		history.delete(firstPath);
	}

	for (const [, dates] of history)
		if (dates.length > maxSizeOfHistory) dates.length = maxSizeOfHistory;

	setPlaylists((prev) => ({ ...prev, history }));

	console.log(`Added path to history: "${path}"`);
	console.count("Added to history");
};

////////////////////////////////////////////////

export const clearHistory = (): void =>
	setPlaylists((prev) => {
		const { history } = prev;

		history.clear();

		return { ...prev, history };
	}) as unknown as void;

////////////////////////////////////////////////

export const clearFavorites = (): void =>
	setPlaylists((prev) => {
		const { favorites } = prev;

		favorites.clear();

		return { ...prev, favorites };
	}) as unknown as void;

////////////////////////////////////////////////

export const toggleFavoriteMedia = (path: Path) => {
	if (!path) return;

	const { favorites } = getPlaylists();

	// map.delete() returns true if an element in the Map
	// object existed and has been removed, or false if
	// the element does not exist.
	if (!favorites.delete(path)) favorites.add(path);

	setPlaylists((prev) => ({ ...prev, favorites }));
};

////////////////////////////////////////////////

const updateAndSortSortedAndMainLists = (newMainList: MainList): void =>
	setPlaylists((prev) => ({
		...prev,
		sortedByDate: sortByDate(newMainList),
		sortedByNameAndMainList: sortByName(newMainList),
	})) as unknown as void;

////////////////////////////////////////////////

export const addToMainList = (path: Path, newMedia: Media): void => {
	const { sortedByNameAndMainList: mainList } = getPlaylists();

	if (mainList.has(path))
		return warn(
			`A media with path "${path}" already exists. Therefore, I'm not gonna add it. If you want to update it, call this function with type = PlaylistActions.REFRESH_ONE_MEDIA_BY_PATH`,
		);

	updateAndSortSortedAndMainLists(mainList.set(path, newMedia));
};

////////////////////////////////////////////////

export const removeMedia = (path: Path): void => {
	const {
		sortedByNameAndMainList: mainList,
		sortedByDate,
		favorites,
		history,
	} = getPlaylists();

	if (!mainList.delete(path))
		return error(`A media with path "${path}" does not exist at sortedByName.`);

	if (!sortedByDate.delete(path))
		return error(`A media with path "${path}" does not exist at sortedByDate.`);

	batch(() => {
		setPlaylists((prev) => ({
			...prev,
			sortedByNameAndMainList: mainList,
			sortedByDate: sortedByDate,
		}));

		// If the media is in the favorites, remove it from the favorites
		if (favorites.delete(path))
			setPlaylists((prev) => ({ ...prev, favorites }));

		// If the media is in the history, remove it from the history
		if (history.delete(path)) setPlaylists((prev) => ({ ...prev, history }));
	});
};

////////////////////////////////////////////////

export const replaceEntireMainList = (list: MainList): void =>
	time(() => {
		const { favorites, history } = getPlaylists();
		const allSelectedMedias = getAllSelectedMedias();

		// If the media in the favorites list is not on the new
		// list, remove it from all other lists if present:
		for (const path of favorites)
			if (!list.has(path)) {
				allSelectedMedias.delete(path);
				favorites.delete(path);
				history.delete(path);
			}

		// If the media in the history list is not on
		// action.list, remove it from the favorites:
		for (const [path] of history)
			if (!list.has(path)) {
				allSelectedMedias.delete(path);
				favorites.delete(path);
				history.delete(path);
			}

		// Update allSelectedMedias:
		for (const path of allSelectedMedias)
			if (!list.has(path)) {
				allSelectedMedias.delete(path);
				favorites.delete(path);
				history.delete(path);
			}

		batch(() => {
			setAllSelectedMedias(allSelectedMedias);

			setPlaylists((prev) => ({ ...prev, history, favorites }));
			updateAndSortSortedAndMainLists(list);
		});
	}, "replaceEntireMainList");

////////////////////////////////////////////////

export const refreshMedia = async (
	path: Path,
	newPath: Path,
	newMedia?: Media,
): Promise<void> => {
	const { sortedByNameAndMainList: mainList } = getPlaylists();
	const oldMedia = mainList.get(path);

	if (!oldMedia) {
		warn(
			`There should be a media with path = "${path}" to be refreshed, but there isn't!\nRefreshing all media instead.`,
		);

		return await searchLocalComputerForMedias();
	}

	// If a new media was given, just update it:
	if (newMedia)
		return setPlaylists((prev) => ({
			...prev,
			sortedByNameAndMainList: mainList.set(path, newMedia),
		})) as unknown as void;

	const { assureMediaSizeIsGreaterThan60KB, ignoreMediaWithLessThan60Seconds } =
		getSettings();

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
		mainList.delete(path);
		mainList.set(newPath, refreshedMedia);

		// Only sort if the their titles are different:
		refreshedMedia.title !== oldMedia.title
			? updateAndSortSortedAndMainLists(mainList)
			: // Else, just update the media in the main list,
			  // cause the title is the same, so no need to sort:
			  setPlaylists((prev) => ({
					...prev,
					sortedByNameAndMainList: mainList,
			  }));
	} ////////////////////////////////////////////////
	else if (refreshedMedia.title !== oldMedia.title)
		updateAndSortSortedAndMainLists(mainList.set(path, refreshedMedia));
	////////////////////////////////////////////////
	else
		setPlaylists((prev) => ({
			...prev,
			sortedByNameAndMainList: mainList.set(path, refreshedMedia),
		}));
};

////////////////////////////////////////////////

export const cleanAllLists = (): void => {
	const { favorites, history, sortedByDate, sortedByNameAndMainList } =
		getPlaylists();
	const allSelectedMedias = getAllSelectedMedias();

	sortedByNameAndMainList.clear();
	allSelectedMedias.clear();
	sortedByDate.clear();
	favorites.clear();
	history.clear();

	batch(() => {
		setPlaylists({
			sortedByNameAndMainList,
			isLoadingMedias: false,
			sortedByDate,
			favorites,
			history,
		});

		setCurrentPlaying(defaultCurrentPlaying);

		setAllSelectedMedias(allSelectedMedias);
	});
};

///////////////////////////////////////////////////
///////////////////////////////////////////////////
///////////////////////////////////////////////////
// Helper funtions:

export const getMainList = () => getPlaylists().sortedByNameAndMainList;
export const getSortedByDate = () => getPlaylists().sortedByDate;
export const getFavorites = () => getPlaylists().favorites;
export const getHistory = () => getPlaylists().history;

///////////////////////////////////////////////////

export const getPlaylist = (
	list: ValuesOf<typeof playlistList>,
): Set<Path> | MainList | History => {
	switch (list) {
		case playlistList.sortedByDate:
			return getSortedByDate();

		case playlistList.favorites:
			return getFavorites();

		case playlistList.mainList:
			return getMainList();

		case playlistList.history:
			return getHistory();

		default:
			assertUnreachable(list);
	}
};

///////////////////////////////////////////////////

export const searchLocalComputerForMedias = async (): Promise<void> => {
	try {
		setIsLoadingMedias(true);

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
		setIsLoadingMedias(false);
	}
};

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

export const searchMedia = (highlight: string): [Path, Media][] =>
	time(() => {
		const medias: [Path, Media][] = [];
		const mainList = getMainList();

		for (const [path, media] of mainList)
			if (unDiacritic(media.title).includes(highlight))
				medias.push([path, media]);

		return medias;
	}, `searchMedia('${highlight}')`);

///////////////////////////////////////////////////
///////////////////////////////////////////////////
///////////////////////////////////////////////////
// Types:

export type History = Map<Path, DateAsNumber[]>;

export type MainList = Map<Path, Media>;

type Playlists = {
	sortedByNameAndMainList: MainList;
	sortedByDate: Set<Path>;
	favorites: Set<Path>;
	history: History;
};
