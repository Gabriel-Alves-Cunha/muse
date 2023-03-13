import type { Path } from "@common/@types/GeneralTypes";

import { subscribe } from "valtio";
import { proxySet } from "valtio/utils";

import { playlists } from "./playlists";
import { time } from "@utils/utils";

///////////////////////////////////////////////////
///////////////////////////////////////////////////
///////////////////////////////////////////////////

export const allSelectedMedias = proxySet<Path>();

///////////////////////////////////////////////////
///////////////////////////////////////////////////
///////////////////////////////////////////////////
// Listeners:

export const selectPath = (path: Path) => `[data-path="${path}"]`;
const isSelectedRowDataString = "isSelectedRow";
const prevSelectedMedias: Set<Path> = new Set();

// Handle decorate medias row:
subscribe(allSelectedMedias, (): void =>
	time((): void => {
		const list = document.getElementById("list");

		if (!list) return;

		// Has to be this order:
		for (const path of prevSelectedMedias)
			for (const element of list.querySelectorAll<HTMLElement>(
				selectPath(path),
			)) {
				if (allSelectedMedias.has(path)) continue;

				element.dataset[isSelectedRowDataString] = "false";

				prevSelectedMedias.delete(path);
			}

		for (const path of allSelectedMedias)
			for (const element of list.querySelectorAll<HTMLElement>(
				selectPath(path),
			)) {
				element.dataset[isSelectedRowDataString] = "true";

				prevSelectedMedias.add(path);
			}
	}, "handleDecorateMediasRow"),
);

///////////////////////////////////////////////////

export const toggleSelectedMedia = (path: Path): void => {
	allSelectedMedias[allSelectedMedias.has(path) ? "delete" : "add"](path);
};

///////////////////////////////////////////////////

export function selectAllMedias(): void {
	const sortedByDate = playlists.sortedByDate;

	if (allSelectedMedias.size === sortedByDate.size) return;

	for (const path of sortedByDate) allSelectedMedias.add(path);
}
