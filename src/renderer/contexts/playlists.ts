import type { DateAsNumber, Media, Path } from "@common/@types/generalTypes";
import type { ValuesOf } from "@common/@types/utils";

import { batch, createEffect, createSignal } from "solid-js";
import { ReactiveSet } from "@solid-primitives/set";
import { ReactiveMap } from "@solid-primitives/map";
import { createStore } from "solid-js/store";

import { defaultCurrentPlaying, setCurrentPlaying } from "./currentPlaying";
import { assertUnreachable, time } from "@utils/utils";
import { allSelectedMedias } from "./allSelectedMedias";
import { dbg, dbgPlaylists } from "@common/debug";
import { playlistList } from "@common/enums";
import { error, warn } from "@utils/log";
import { getFirstKey } from "@utils/map-set";
import { settings } from "@contexts/settings";
import {
	getFromLocalStorage,
	setLocalStorage,
	keys,
} from "@utils/localStorage";
import {
	searchDirectoryResult,
	getAllowedMedias,
	sortByDate,
	sortByName,
} from "./playlistsHelper";

const { transformPathsToMedias } = electron.media;

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Type for the main function:

export const [isLoadingMedias, setIsLoadingMedias] = createSignal(false);

export const [playlists, setPlaylists] = createStore<Playlists>({
	favorites:
		(getFromLocalStorage(keys.favorites) as ReactiveSet<Path>) ??
		new ReactiveSet(),
	history: (getFromLocalStorage(keys.history) as History) ?? new ReactiveMap(),
	sortedByNameAndMainList: new ReactiveMap(),
	sortedByDate: new ReactiveSet(),
});

createEffect(
	() => {
		dbg("Saving favorites in LocalStorage.");

		setLocalStorage(keys.favorites, playlists.favorites);
	},
	{ defer: true },
);

createEffect(
	() => {
		dbg("Saving history in LocalStorage.");

		setLocalStorage(keys.history, playlists.history);
	},
	{ defer: true },
);

////////////////////////////////////////////////

export const addToHistory = (path: Path): void =>
	batch(() => {
		const { maxSizeOfHistory } = settings;
		const { history } = playlists;

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

		console.log(`Added path to history: "${path}"`);
		console.count("Added to history");
	});

////////////////////////////////////////////////

export const clearHistory = (): void => playlists.history.clear();

////////////////////////////////////////////////

export const clearFavorites = (): void => playlists.favorites.clear();

////////////////////////////////////////////////

export const toggleFavoriteMedia = (path: Path) => {
	if (!path) return;

	const { favorites } = playlists;

	// map.delete() returns true if an element in the Map
	// object existed and has been removed, or false if
	// the element does not exist.
	if (!favorites.delete(path)) favorites.add(path);
};

////////////////////////////////////////////////

const updateAndSortSortedAndMainLists = (newMainList: MainList): void =>
	setPlaylists({
		sortedByNameAndMainList: sortByName(newMainList),
		sortedByDate: sortByDate(newMainList),
	}) as unknown as void;

////////////////////////////////////////////////

export const addToMainList = (path: Path, newMedia: Media): void => {
	const mainList = playlists.sortedByNameAndMainList;

	if (mainList.has(path))
		return warn(
			`A media with path "${path}" already exists. Therefore, I'm not gonna add it. If you want to update it, call this function with type = PlaylistActions.REFRESH_ONE_MEDIA_BY_PATH`,
		);

	batch(() => updateAndSortSortedAndMainLists(mainList.set(path, newMedia)));
};

////////////////////////////////////////////////

export const removeMedia = (path: Path): void => {
	const {
		sortedByNameAndMainList: mainList,
		sortedByDate,
		favorites,
		history,
	} = playlists;

	batch(() => {
		sortedByDate.delete(path);
		mainList.delete(path);

		// If the media is in the favorites, remove it from the favorites
		favorites.delete(path);

		// If the media is in the history, remove it from the history
		history.delete(path);
	});
};

////////////////////////////////////////////////

export const replaceEntireMainList = (list: MainList): void =>
	time(() => {
		const { favorites, history } = playlists;

		batch(() => {
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

			updateAndSortSortedAndMainLists(list);
		});
	}, "replaceEntireMainList");

////////////////////////////////////////////////

export const refreshMedia = async (
	path: Path,
	newPath: Path,
	newMedia?: Media,
): Promise<void> => {
	const mainList = playlists.sortedByNameAndMainList;
	const oldMedia = mainList.get(path);

	if (!oldMedia) {
		warn(
			`There should be a media with path = "${path}" to be refreshed, but there isn't!\nRefreshing all media instead.`,
		);

		return await searchLocalComputerForMedias();
	}

	// If a new media was given, just update it:
	if (newMedia) return mainList.set(path, newMedia) as unknown as void;

	const { assureMediaSizeIsGreaterThan60KB, ignoreMediaWithLessThan60Seconds } =
		settings;

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

	batch(() => {
		if (newPath) {
			mainList.delete(path);
			mainList.set(newPath, refreshedMedia);

			// Only sort if the their titles are different:
			if (refreshedMedia.title !== oldMedia.title)
				updateAndSortSortedAndMainLists(mainList);
		} ////////////////////////////////////////////////
		else if (refreshedMedia.title !== oldMedia.title)
			updateAndSortSortedAndMainLists(mainList.set(path, refreshedMedia));
		////////////////////////////////////////////////
		else mainList.set(path, refreshedMedia);
	});
};

////////////////////////////////////////////////

export const cleanAllLists = (): void => {
	const { favorites, history, sortedByDate, sortedByNameAndMainList } =
		playlists;

	batch(() => {
		sortedByNameAndMainList.clear();
		allSelectedMedias.clear();
		allSelectedMedias.clear();
		sortedByDate.clear();
		favorites.clear();
		history.clear();

		setCurrentPlaying(defaultCurrentPlaying);
	});
};

///////////////////////////////////////////////////
///////////////////////////////////////////////////
///////////////////////////////////////////////////
// Helper funtions:

export const getPlaylist = (
	list: ValuesOf<typeof playlistList>,
): Set<Path> | MainList | History => {
	switch (list) {
		case playlistList.sortedByDate:
			return playlists.sortedByDate;

		case playlistList.favorites:
			return playlists.favorites;

		case playlistList.mainList:
			return playlists.sortedByNameAndMainList;

		case playlistList.history:
			return playlists.history;

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
		} = settings;

		const newMainList: MainList = new ReactiveMap(
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

		for (const [path, media] of playlists.sortedByNameAndMainList)
			if (unDiacritic(media.title).includes(highlight))
				medias.push([path, media]);

		return medias;
	}, `searchMedia('${highlight}')`);

///////////////////////////////////////////////////
///////////////////////////////////////////////////
///////////////////////////////////////////////////
// Types:

export type History = ReactiveMap<Path, DateAsNumber[]>;

export type MainList = ReactiveMap<Path, Media>;

type Playlists = {
	sortedByNameAndMainList: MainList;
	sortedByDate: ReactiveSet<Path>;
	favorites: ReactiveSet<Path>;
	history: History;
};
