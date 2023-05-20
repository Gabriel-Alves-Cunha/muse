import type { Media, Path } from "@common/@types/GeneralTypes";
import type { ValuesOf } from "@common/@types/Utils";

import { subscribeWithSelector } from "zustand/middleware";
import { create } from "zustand";

import { EMPTY_ARRAY, EMPTY_MAP, EMPTY_SET } from "@utils/empty";
import { error, warn, throwErr } from "@common/log";
import { dbg, dbgPlaylists } from "@common/debug";
import { PlaylistListEnum } from "@common/enums";
import { getSettings } from "@contexts/settings";
import { sortByTitle } from "./playlistsHelper";
import { time } from "@utils/utils";
import {
	getAllSelectedMedias,
	setAllSelectedMedias,
} from "./allSelectedMedias";
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

export const usePlaylists = create(
	subscribeWithSelector<Playlists>(() => ({
		history: getFromLocalStorage(localStorageKeys.history) as Path[],
		sortedByTitleAndMainList: EMPTY_MAP,
		sortedByDate: EMPTY_MAP,
		favorites: new Set(
			getFromLocalStorage(localStorageKeys.favorites) as Path[],
		),
	})),
);

export const useIsLoadingMedias = create(() => ({ current: false }));

export const { setState: setPlaylists, getState: getPlaylists } = usePlaylists;

export const getIsLoadingMedias = (): boolean =>
	useIsLoadingMedias.getState().current;

export const setIsLoadingMedias = (newValue: boolean): void =>
	useIsLoadingMedias.setState({ current: newValue });

export const selectFavorites = (): Playlists["favorites"] =>
	getPlaylists().favorites;

export const selectMainList = (): Playlists["sortedByTitleAndMainList"] =>
	getPlaylists().sortedByTitleAndMainList;

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Listeners:

usePlaylists.subscribe(
	(state) => state.favorites,
	(favorites): void => {
		setLocalStorage(localStorageKeys.favorites, favorites);
	},
);

usePlaylists.subscribe(
	(state) => state.history,
	(history): void => {
		setLocalStorage(localStorageKeys.history, history);
	},
);

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Helper functions:

export function addToMainList(path: Path, newMedia: Media): void {
	const mainList = getPlaylists().sortedByTitleAndMainList;

	if (mainList.has(path)) {
		warn(
			`Media "${path}" already exists. So, I'm not gonna add it. If you want to update it, use 'rescanMedia()'.`,
		);

		return;
	}

	const newUnsortedMainList = new Map(mainList).set(path, newMedia);

	setPlaylists({ sortedByTitleAndMainList: sortByTitle(newUnsortedMainList) });
}

////////////////////////////////////////////////
////////////////////////////////////////////////

export function toggleFavoriteMedia(path: Path): void {
	const favorites = getPlaylists().favorites;
	const newFavorites = new Set(favorites);

	newFavorites[newFavorites.has(path) ? "delete" : "add"](path);

	setPlaylists({ favorites: newFavorites });
}

////////////////////////////////////////////////
////////////////////////////////////////////////

export const getMedia = (path: Path): Media | undefined =>
	getPlaylists().sortedByTitleAndMainList.get(path);

////////////////////////////////////////////////
////////////////////////////////////////////////

export function removeMedia(path: Path): void {
	dbg("Removing media with path =", path);

	const {
		sortedByTitleAndMainList: mainList,
		favorites,
		history,
	} = getPlaylists();

	if (!mainList.has(path)) {
		warn(`Media "${path}" does not exist.`);

		return;
	}

	{
		const newMainList = new Map(mainList);

		newMainList.delete(path);

		setPlaylists({ sortedByTitleAndMainList: newMainList });
	}

	{
		const indexToRemove = history.indexOf(path);

		if (indexToRemove !== -1) {
			const newHistory = [...history];

			newHistory.splice(indexToRemove, 1);

			setPlaylists({ history: newHistory });
		}
	}

	if (favorites.has(path)) {
		const newFavorites = new Set(favorites);

		newFavorites.delete(path);

		setPlaylists({ favorites: newFavorites });
	}

	{
		const allSelectedMedias = getAllSelectedMedias();

		if (allSelectedMedias.has(path)) {
			const newAllSelectedMedias = new Set(allSelectedMedias);

			newAllSelectedMedias.delete(path);

			setAllSelectedMedias(newAllSelectedMedias);
		}
	}
}

////////////////////////////////////////////////
////////////////////////////////////////////////

export function replaceEntireMainList(
	newMainList: Playlists["sortedByTitleAndMainList"],
): void {
	time(() => {
		const { favorites, history } = getPlaylists();
		const allSelectedMedias = getAllSelectedMedias();

		const mediasToDelete: Set<Path> = new Set();

		// If the media in the favorites/history list is not on the new
		// list, remove it from all other lists:
		for (const path of favorites)
			if (!newMainList.has(path)) mediasToDelete.add(path);

		for (const path of history)
			if (!newMainList.has(path)) mediasToDelete.add(path);

		for (const path of allSelectedMedias)
			if (!newMainList.has(path)) mediasToDelete.add(path);

		const newHistory = history.filter((path) => !mediasToDelete.has(path));
		const newAllSelectedMedias = new Set(allSelectedMedias);
		const newFavorites = new Set(favorites);

		for (const path of mediasToDelete) {
			newAllSelectedMedias.delete(path);
			newFavorites.delete(path);
		}

		setAllSelectedMedias(newAllSelectedMedias);

		setPlaylists({
			sortedByTitleAndMainList: sortByTitle(newMainList),
			favorites: newFavorites,
			history: newHistory,
		});
	}, "replaceEntireMainList");
}

////////////////////////////////////////////////
////////////////////////////////////////////////

export function addToFavorites(path: Path): void {
	const favorites = getPlaylists().favorites;

	if (favorites.has(path)) {
		warn(
			`Media "${path}" already exists in favorites. So, I'm not gonna add it.`,
		);

		return;
	}

	const newFavorites = new Set(favorites).add(path);

	setPlaylists({ favorites: newFavorites });
}

////////////////////////////////////////////////
////////////////////////////////////////////////

export function removeFromFavorites(path: Path): void {
	const favorites = getPlaylists().favorites;

	if (!favorites.has(path)) {
		warn(
			`Media "${path}" does not exist in favorites. So, I'm not gonna remove it.`,
		);

		return;
	}

	const newFavorites = new Set(favorites);

	newFavorites.delete(path);

	setPlaylists({ favorites: newFavorites });
}

////////////////////////////////////////////////
////////////////////////////////////////////////

export function toggleFavorite(path: Path): void {
	getPlaylists().favorites.has(path)
		? removeFromFavorites(path)
		: addToFavorites(path);
}

////////////////////////////////////////////////
////////////////////////////////////////////////

export function clearAllLists(): void {
	setPlaylists({
		sortedByTitleAndMainList: EMPTY_MAP,
		favorites: EMPTY_SET,
		history: EMPTY_ARRAY,
	});
}

////////////////////////////////////////////////
////////////////////////////////////////////////

export async function rescanMedia(path: Path, newMedia?: Media): Promise<void> {
	const mainList = getPlaylists().sortedByTitleAndMainList;
	const oldMedia = mainList.get(path);

	if (!oldMedia) {
		warn(`There's no "${path}" to be refreshed. Refreshing all.`);

		searchLocalComputerForMedias();

		return;
	}

	const newMainList = new Map(mainList);

	// If a new media was given, just update it:
	if (newMedia) {
		newMainList.set(path, newMedia);

		setPlaylists({ sortedByTitleAndMainList: sortByTitle(newMainList) });

		return;
	}

	const { assureMediaSizeIsGreaterThan60KB, ignoreMediaWithLessThan60Seconds } =
		getSettings();

	const refreshedMediaInArray = await transformPathsToMedias(
		path,
		assureMediaSizeIsGreaterThan60KB,
		ignoreMediaWithLessThan60Seconds,
	);

	const refreshedMedia = refreshedMediaInArray[0]?.[1];

	if (!refreshedMedia) {
		error(`Transforming "${path}" to a media failed! Refreshing all.`);

		searchLocalComputerForMedias();

		return;
	}

	newMainList.set(path, refreshedMedia);

	setPlaylists({ sortedByTitleAndMainList: sortByTitle(newMainList) });
}

///////////////////////////////////////////////////
///////////////////////////////////////////////////
///////////////////////////////////////////////////
// Helper funtions:

export function getPlaylist(
	list: ValuesOf<typeof PlaylistListEnum>,
): ValuesOf<Playlists> {
	const desiredList = getPlaylists()[list];

	if (!desiredList) throwErr(`List ${list} is not handled!`);

	return desiredList;
}

///////////////////////////////////////////////////

export async function searchLocalComputerForMedias(): Promise<void> {
	try {
		setIsLoadingMedias(true);

		const {
			assureMediaSizeIsGreaterThan60KB,
			ignoreMediaWithLessThan60Seconds,
		} = getSettings();

		const newMainList = await transformPathsToMedias(
			"",
			assureMediaSizeIsGreaterThan60KB,
			ignoreMediaWithLessThan60Seconds,
		);

		dbgPlaylists("Finished searching, newMainList =", newMainList);

		setPlaylists({ sortedByTitleAndMainList: sortByTitle(newMainList) });
	} catch (err) {
		error("Error on searchLocalComputerForMedias():", err);
	} finally {
		setIsLoadingMedias(false);
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
		const mainList = getPlaylists().sortedByTitleAndMainList;
		const medias: [Path, Media][] = [];

		for (const entry of mainList)
			if (unDiacritic(entry[1].title).includes(highlight))
				medias.push(entry);

		return medias;
	}, `searchMedia('${highlight}')`);

///////////////////////////////////////////////////
///////////////////////////////////////////////////
///////////////////////////////////////////////////
// Types:

export type Playlists = Readonly<{
	sortedByTitleAndMainList: ReadonlyMap<Path, Media>;
	sortedByDate: ReadonlyMap<Path, Media>;
	favorites: ReadonlySet<Path>;
	history: readonly Path[];
}>;
