import type { Media, Path } from "@common/@types/GeneralTypes";
import type { ValuesOf } from "@common/@types/Utils";

import { proxyMap, proxySet } from "valtio/utils";
import { proxy, subscribe } from "valtio";

import { sortByDateOfBirth, sortByTitle } from "./playlistsHelper";
import { allSelectedMedias } from "./allSelectedMedias";
import { dbg, dbgPlaylists } from "@common/debug";
import { PlaylistListEnum } from "@common/enums";
import { error, warn } from "@common/log";
import { settings } from "@contexts/settings";
import { throwErr } from "@common/log";
import { time } from "@utils/utils";
import {
	getFromLocalStorage,
	localStorageKeys,
	setLocalStorage,
} from "@utils/localStorage";

const { transformPathsToMedias } = electronApi.media;

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Main function:

export const playlists = proxy<Playlists>({
	isLoadingMedias: false,

	favorites: proxySet(
		getFromLocalStorage(localStorageKeys.favorites) as Path[],
	),
	history: getFromLocalStorage(localStorageKeys.history) as Path[],
	sortedByTitleAndMainList: proxyMap(),
	sortedByDate: proxySet(),
});

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Listeners:

export const IS_PROXY_MAP_OR_SET = true;

subscribe(playlists.favorites, (): void => {
	setLocalStorage(
		localStorageKeys.favorites,
		playlists.favorites,
		IS_PROXY_MAP_OR_SET,
	);
});

subscribe(playlists.history, (): void => {
	setLocalStorage(
		localStorageKeys.history,
		playlists.history,
		IS_PROXY_MAP_OR_SET,
	);
});

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Helper functions:

export function addToHistory(path: Path): void {
	const { maxSizeOfHistory } = settings;

	playlists.history.push(path);

	// history has a max size of `maxSizeOfHistory`:
	if (playlists.history.length > maxSizeOfHistory)
		playlists.history.length = maxSizeOfHistory;
}

export function removeFromHistory(path: Path): void {
	playlists.history = playlists.history.filter((path_) => path_ !== path);
}

////////////////////////////////////////////////
////////////////////////////////////////////////

function updateSortedLists(newMainList: MainList): void {
	const { sortedByTitleAndMainList: mainList, sortedByDate } = playlists;

	const newMainListAsArray = [...newMainList];

	sortedByDate.clear();
	mainList.clear();

	for (const [path, media] of sortByTitle(newMainListAsArray))
		mainList.set(path, media);

	for (const [path] of sortByDateOfBirth(newMainListAsArray))
		sortedByDate.add(path);
}

///////////////////////////////////////////////////
///////////////////////////////////////////////////

export function addToMainList(path: Path, newMedia: Media): void {
	const { sortedByTitleAndMainList: mainList } = playlists;

	if (mainList.has(path))
		return warn(
			`Media "${path}" already exists. So, I'm not gonna add it. If you want to update it, use 'rescanMedia()'.`,
		);

	updateSortedLists(mainList.set(path, newMedia));
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

	const { sortedByTitleAndMainList: mainList, favorites } = playlists;

	allSelectedMedias.delete(path);
	removeFromHistory(path);
	favorites.delete(path);
	mainList.delete(path);
}

////////////////////////////////////////////////
////////////////////////////////////////////////

export function replaceEntireMainList(list: MainList): void {
	time(() => {
		const { favorites, history } = playlists;

		const mediasToDelete: Path[] = [];

		// If the media in the X list is not on the new
		// list, remove it from all other lists:
		for (const path of favorites)
			if (!list.has(path)) mediasToDelete.push(path);

		for (const path of history) if (!list.has(path)) mediasToDelete.push(path);

		for (const path of allSelectedMedias)
			if (!list.has(path)) mediasToDelete.push(path);

		for (const path of mediasToDelete) {
			allSelectedMedias.delete(path);
			removeFromHistory(path);
			favorites.delete(path);
		}

		updateSortedLists(list);
	}, "replaceEntireMainList");
}

////////////////////////////////////////////////
////////////////////////////////////////////////

export function clearAllLists(): void {
	for (const value of Object.values(playlists))
		if (typeof value === "boolean") continue;
		else if (Array.isArray(value)) value.length = 0;
		else value.clear();
}

////////////////////////////////////////////////
////////////////////////////////////////////////

export async function rescanMedia(path: Path, newMedia?: Media): Promise<void> {
	const { sortedByTitleAndMainList: mainList } = playlists;
	const oldMedia = mainList.get(path);

	if (!oldMedia) {
		warn(`There's no "${path}" to be refreshed. Refreshing all.`);

		return searchLocalComputerForMedias();
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

		return searchLocalComputerForMedias();
	}

	mainList.set(path, refreshedMedia);
}

///////////////////////////////////////////////////
///////////////////////////////////////////////////
///////////////////////////////////////////////////
// Helper funtions:

export function getPlaylist(
	list: ValuesOf<typeof PlaylistListEnum>,
): ReadonlySet<Path> | MainList | readonly Path[] {
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

export type MainList = Map<Path, Media>;

///////////////////////////////////////////////////

type Playlists = {
	isLoadingMedias: boolean;

	sortedByTitleAndMainList: MainList;
	sortedByDate: Set<Path>;
	favorites: Set<Path>;
	history: Path[];
};
