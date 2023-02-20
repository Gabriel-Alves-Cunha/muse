import type { Path } from "@common/@types/generalTypes";

import { subscribe } from "valtio";
import { proxySet } from "valtio/utils";

import { playlists } from "./playlists";
import { emptySet } from "@common/empty";
import { time } from "@utils/utils";

///////////////////////////////////////////////////
///////////////////////////////////////////////////
///////////////////////////////////////////////////

export const allSelectedMedias = proxySet<Path>();

///////////////////////////////////////////////////
///////////////////////////////////////////////////
///////////////////////////////////////////////////
// Handle media selection:

export const data_path = (path: Path) => `[data-path="${path}"]`;
const isSelectedRowDataString = "isSelectedRow";

subscribe(
	allSelectedMedias,
	// Handle decorate medias row
	(data): void =>
		time(() => {
			console.log("data of allSelectedMedias =", data);
			const [_operation, _path, newSelectedMedias, prevSelectedMedias] = data;

			// Has to be this order:
			for (const path of prevSelectedMedias)
				for (const element of document.querySelectorAll(
					data_path(path),
				) as NodeListOf<HTMLElement>) {
					if (newSelectedMedias.has(path)) continue;

					element.dataset[isSelectedRowDataString] = "false";
				}

			for (const path of newSelectedMedias)
				for (const element of document.querySelectorAll(
					data_path(path),
				) as NodeListOf<HTMLElement>)
					element.dataset[isSelectedRowDataString] = "true";
		}, "handleDecorateMediasRow"),
);

///////////////////////////////////////////////////

export const toggleSelectedMedia = (path: Path): void => {
	time(
		() =>
			allSelectedMedias.has(path)
				? removeFromAllSelectedMedias(path)
				: addToAllSelectedMedias(path),
		"toggleSelectedMedia",
	);
};

///////////////////////////////////////////////////

export function addToAllSelectedMedias(path: Path): void {
	allSelectedMedias.add(path);
}

///////////////////////////////////////////////////

export function removeFromAllSelectedMedias(path: Path): void {
	allSelectedMedias.delete(path);
}

///////////////////////////////////////////////////

export function deselectAllMedias(): void {
	if (allSelectedMedias.size === 0) return;

	allSelectedMedias.clear();
}

///////////////////////////////////////////////////

export function selectAllMedias(): void {
	const sortedByDate = playlists.sortedByDate;

	if (allSelectedMedias.size === sortedByDate.size) return;

	allSelectedMedias.clear();

	for (const path of sortedByDate) allSelectedMedias.add(path);
}
