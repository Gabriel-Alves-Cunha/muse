import type { Path } from "@common/@types/GeneralTypes";

import { create } from "zustand";

import { getPlaylists } from "./playlists";
import { EMPTY_SET } from "@utils/empty";
import { time } from "@utils/utils";

///////////////////////////////////////////////////
///////////////////////////////////////////////////
///////////////////////////////////////////////////

export const allSelectedMediasRef = create<AllSelectedMedias>(() => ({
	current: EMPTY_SET,
}));

export const getAllSelectedMedias = (): AllSelectedMedias["current"] =>
	allSelectedMediasRef.getState().current;

export const setAllSelectedMedias = (newAllSelectedMedias: Set<Path>): void =>
	allSelectedMediasRef.setState({ current: newAllSelectedMedias });

export const clearAllSelectedMedias = (): void =>
	setAllSelectedMedias(EMPTY_SET);

///////////////////////////////////////////////////
///////////////////////////////////////////////////
///////////////////////////////////////////////////
// Listeners:

export const selectDataPath = (path: Path): string => `[data-path="${path}"]`;
const IS_SELECTED_ROW_DATA_STRING = "isSelectedRow";

// Handle decorate medias row:
allSelectedMediasRef.subscribe((selectedMediasRef, prevSelectedMediasRef) =>
	time((): void => {
		const list = document.getElementById("list");

		if (!list) return;

		// Has to be this order:
		// 1º
		for (const path of prevSelectedMediasRef.current)
			for (const element of list.querySelectorAll<HTMLElement>(
				selectDataPath(path),
			)) {
				if (selectedMediasRef.current.has(path)) continue;

				element.dataset[IS_SELECTED_ROW_DATA_STRING] = "false";
			}

		// 2º
		for (const path of selectedMediasRef.current)
			for (const element of list.querySelectorAll<HTMLElement>(
				selectDataPath(path),
			))
				element.dataset[IS_SELECTED_ROW_DATA_STRING] = "true";
	}, "handleDecorateMediasRow"),
);

///////////////////////////////////////////////////

export function toggleSelectedMedia(path: Path): void {
	const allSelectedMedias = getAllSelectedMedias();
	const newAllSelectedMedias = new Set(allSelectedMedias);

	newAllSelectedMedias[newAllSelectedMedias.has(path) ? "delete" : "add"](path);

	setAllSelectedMedias(newAllSelectedMedias);
}

///////////////////////////////////////////////////

export function selectAllMedias(): void {
	const mainList = getPlaylists().sortedByTitleAndMainList;
	const allSelectedMedias = getAllSelectedMedias();

	if (allSelectedMedias.size === mainList.size) return;

	const newAllSelectedMedias = new Set(mainList.keys());

	setAllSelectedMedias(newAllSelectedMedias);
}

///////////////////////////////////////////////////
///////////////////////////////////////////////////
///////////////////////////////////////////////////
// Types:

export type AllSelectedMedias = Readonly<{ current: ReadonlySet<Path> }>;
