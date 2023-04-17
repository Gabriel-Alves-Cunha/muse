import type { Path } from "@common/@types/GeneralTypes";

import { create } from "zustand";

import { getPlaylists } from "./playlists";
import { emptySet } from "@utils/empty";
import { time } from "@utils/utils";

///////////////////////////////////////////////////
///////////////////////////////////////////////////
///////////////////////////////////////////////////

export const allSelectedMediasRef = create<AllSelectedMedias>(() => ({
	current: emptySet,
}));

export const getAllSelectedMedias = (): AllSelectedMedias["current"] =>
	allSelectedMediasRef.getState().current;

export const setAllSelectedMedias = (newAllSelectedMedias: Set<Path>): void =>
	allSelectedMediasRef.setState({ current: newAllSelectedMedias });

export const clearAllSelectedMedias = (): void =>
	setAllSelectedMedias(emptySet);

///////////////////////////////////////////////////
///////////////////////////////////////////////////
///////////////////////////////////////////////////
// Listeners:

export const selectDataPath = (path: Path): string => `[data-path="${path}"]`;
const isSelectedRowDataString = "isSelectedRow";

// Handle decorate medias row:
allSelectedMediasRef.subscribe((selectedMediasRef, prevSelectedMediasRef) =>
	time((): void => {
		const list = document.getElementById("list");

		if (!list) return;

		// Has to be this order:
		for (const path of prevSelectedMediasRef.current)
			for (const element of list.querySelectorAll<HTMLElement>(
				selectDataPath(path),
			)) {
				if (selectedMediasRef.current.has(path)) continue;

				element.dataset[isSelectedRowDataString] = "false";
			}

		for (const path of selectedMediasRef.current)
			for (const element of list.querySelectorAll<HTMLElement>(
				selectDataPath(path),
			))
				element.dataset[isSelectedRowDataString] = "true";
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
	const allSelectedMedias = getAllSelectedMedias();
	const sortedByDate = getPlaylists().sortedByDate;

	if (allSelectedMedias.size === sortedByDate.size) return;

	const newAllSelectedMedias = new Set(sortedByDate);

	setAllSelectedMedias(newAllSelectedMedias);
}

///////////////////////////////////////////////////
///////////////////////////////////////////////////
///////////////////////////////////////////////////
// Types:

export type AllSelectedMedias = Readonly<{ current: ReadonlySet<Path> }>;
