import type { DateAsNumber, Media, Path } from "@common/@types/generalTypes";
import type { ValuesOf } from "@common/@types/utils";

import { proxyMap, proxySet } from "valtio/utils";
import { proxy, subscribe } from "valtio";

import {
	getFromLocalStorage,
	localStorageKeys,
	setLocalStorage,
} from "@utils/localStorage";
import { sortByDateOfBirth, sortByTitle } from "./playlistsHelper";
import { allSelectedMedias } from "./allSelectedMedias";
import { dbg, dbgPlaylists } from "@common/debug";
import { PlaylistListEnum } from "@common/enums";
import { getFirstKey } from "@utils/map-set";
import { error, warn } from "@common/log";
import { settings } from "@contexts/settings";
import { throwErr } from "@common/log";
import { time } from "@utils/utils";

const { transformPathsToMedias } = electron.media;

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Main function:

export const playlists = proxy<Playlists>({
	isLoadingMedias: false,

	favorites: proxySet(
		getFromLocalStorage(localStorageKeys.favorites) as
			| ReadonlySet<Path>
			| undefined,
	),
	history: proxyMap(
		getFromLocalStorage(localStorageKeys.history) as History | undefined,
	),
	sortedByTitleAndMainList: proxyMap(),
	sortedByDate: proxySet(),
});

subscribe(playlists.favorites, () => {
	setLocalStorage(localStorageKeys.favorites, playlists.favorites);
});

subscribe(playlists.history, () => {
	setLocalStorage(localStorageKeys.history, playlists.history);
});

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Helper functions:

export function addToHistory(path: Path): void {
	const { maxSizeOfHistory } = settings;
	const { history } = playlists;

	const dates: DateAsNumber[] = [];

	// Add to history if there isn't one yet:
	const historyOfDates = history.get(path);
	historyOfDates
		? dates.unshift(...historyOfDates, Date.now())
		: dates.unshift(Date.now());

	history.set(path, dates);

	// history has a max size of `maxSizeOfHistory`:
	if (history.size > maxSizeOfHistory) {
		const firstPath = getFirstKey(history)!;
		// remove the first element:
		history.delete(firstPath);
	}

	for (const [, dates] of history)
		if (dates.length > maxSizeOfHistory) dates.length = maxSizeOfHistory;
}

////////////////////////////////////////////////
////////////////////////////////////////////////

function updateSortedLists(newMainList: MainList) {
	const { sortedByTitleAndMainList: mainList, sortedByDate } = playlists;

	sortedByDate.clear();
	mainList.clear();

	for (const [path, media] of sortByTitle(newMainList))
		mainList.set(path, media);

	for (const [path] of sortByDateOfBirth(newMainList)) sortedByDate.add(path);
}

///////////////////////////////////////////////////
///////////////////////////////////////////////////

export function addToMainList(path: Path, newMedia: Media): void {
	const { sortedByTitleAndMainList: mainList } = playlists;

	if (mainList.has(path))
		return warn(
			`Media "${path}" already exists. So, I'm not gonna add it. If you want to update it, use 'rescanMedia()'.`,
		);

	const newMainList = new Map(mainList).set(path, newMedia);

	updateSortedLists(newMainList);
}

////////////////////////////////////////////////
////////////////////////////////////////////////

export function toggleFavoriteMedia(path: Path): void {
	// Map.delete() returns true if an element in the Map
	// object existed and has been removed, or false if
	// the element does not exist.
	if (!playlists.favorites.delete(path)) playlists.favorites.add(path);
}

////////////////////////////////////////////////
////////////////////////////////////////////////

export const getMedia = (path: Path): Media | undefined =>
	playlists.sortedByTitleAndMainList.get(path);

////////////////////////////////////////////////
////////////////////////////////////////////////

export function removeMedia(path: Path): void {
	dbg("Removing media with path =", path);

	const { sortedByTitleAndMainList: mainList, favorites, history } = playlists;

	allSelectedMedias.delete(path);
	favorites.delete(path);
	mainList.delete(path);
	history.delete(path);
}

////////////////////////////////////////////////
////////////////////////////////////////////////

export function replaceEntireMainList(list: MainList): void {
	time(() => {
		const { favorites, history } = playlists;

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

		updateSortedLists(list);
	}, "replaceEntireMainList");
}

////////////////////////////////////////////////
////////////////////////////////////////////////

export function clearAllLists(): void {
	for (const [_key, value] of Object.entries(playlists))
		if (typeof value !== "boolean") value.clear();
}

////////////////////////////////////////////////
////////////////////////////////////////////////

export async function rescanMedia(path: Path, newMedia?: Media): Promise<void> {
	const { sortedByTitleAndMainList: mainList } = playlists;
	const oldMedia = mainList.get(path);

	if (!oldMedia) {
		warn(`There's no "${path}" to be refreshed. Refreshing all.`);

		return await searchLocalComputerForMedias();
	}

	// If a new media was given, just update it:
	if (newMedia) return updateSortedLists(mainList.set(path, newMedia));

	const { assureMediaSizeIsGreaterThan60KB, ignoreMediaWithLessThan60Seconds } =
		settings;

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

	mainList.set(path, refreshedMedia);
}

///////////////////////////////////////////////////
///////////////////////////////////////////////////
///////////////////////////////////////////////////
// Helper funtions:

export function getPlaylist(
	list: ValuesOf<typeof PlaylistListEnum>,
): ReadonlySet<Path> | MainList | History {
	if (list === PlaylistListEnum.mainList)
		return playlists.sortedByTitleAndMainList;
	if (list === PlaylistListEnum.sortedByDate) return playlists.sortedByDate;
	if (list === PlaylistListEnum.favorites) return playlists.favorites;
	if (list === PlaylistListEnum.history) return playlists.history;

	throwErr(`List ${list} is not handled!`);
}

///////////////////////////////////////////////////

export async function searchLocalComputerForMedias(): Promise<void> {
	try {
		playlists.isLoadingMedias = true;

		const {
			assureMediaSizeIsGreaterThan60KB,
			ignoreMediaWithLessThan60Seconds,
		} = settings;

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
		playlists.isLoadingMedias = false;
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

		for (const [path, media] of playlists.sortedByTitleAndMainList)
			if (unDiacritic(media.title).includes(highlight))
				medias.push([path, media]);

		return medias;
	}, `searchMedia('${highlight}')`);

///////////////////////////////////////////////////
///////////////////////////////////////////////////
///////////////////////////////////////////////////
// Types:

export type History = Map<Path, DateAsNumber[]>;

///////////////////////////////////////////////////

export type MainList = Map<Path, Media>;

///////////////////////////////////////////////////

type Playlists = {
	isLoadingMedias: boolean;

	sortedByTitleAndMainList: MainList;
	sortedByDate: Set<Path>;
	favorites: Set<Path>;
	history: History;
};
