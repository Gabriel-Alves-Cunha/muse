import type { Path } from "@renderer/common/@types/generalTypes";

import { subscribeWithSelector } from "zustand/middleware";
import { create } from "zustand";

import { getSortedByDate } from "./usePlaylists";
import { emptySet } from "@renderer/common/empty";
import { time } from "@utils/utils";

///////////////////////////////////////////////////
///////////////////////////////////////////////////
///////////////////////////////////////////////////

export const useAllSelectedMedias = create<{ medias: ReadonlySet<Path> }>()(
	subscribeWithSelector((_set, _get, _api) => ({ medias: emptySet })),
);

export const getAllSelectedMedias = () =>
	useAllSelectedMedias.getState().medias;
export const setAllSelectedMedias = (medias: ReadonlySet<Path>) =>
	useAllSelectedMedias.setState({ medias });

///////////////////////////////////////////////////
///////////////////////////////////////////////////
///////////////////////////////////////////////////
// Handle media selection:

export const data_path = (path: Path) => `[data-path="${path}"]`;
const isSelectedRowDataString = "isSelectedRow";

useAllSelectedMedias.subscribe(
	(state) => state.medias,
	// Handle decorate medias row
	(selectedMedias, prevSelectedMedias): void =>
		time(() => {
			// Has to be this order:
			for (const path of prevSelectedMedias)
				for (const element of document.querySelectorAll(
					data_path(path),
				) as NodeListOf<HTMLElement>) {
					if (selectedMedias.has(path)) continue;

					element.dataset[isSelectedRowDataString] = "false";
				}

			for (const path of selectedMedias)
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
			getAllSelectedMedias().has(path)
				? removeFromAllSelectedMedias(path)
				: addToAllSelectedMedias(path),
		"toggleSelectedMedia",
	);
};

///////////////////////////////////////////////////

export function addToAllSelectedMedias(path: Path): void {
	const allSelectedMedias = getAllSelectedMedias();

	if (allSelectedMedias.has(path)) return;

	setAllSelectedMedias(new Set(allSelectedMedias).add(path));
}

///////////////////////////////////////////////////

export function removeFromAllSelectedMedias(path: Path): void {
	const allSelectedMedias = getAllSelectedMedias();

	if (!allSelectedMedias.has(path)) return;

	const newSet = new Set(allSelectedMedias);
	newSet.delete(path);

	setAllSelectedMedias(newSet);
}

///////////////////////////////////////////////////

export function deselectAllMedias(): void {
	if (getAllSelectedMedias().size === 0) return;

	setAllSelectedMedias(emptySet);
}

///////////////////////////////////////////////////

export function selectAllMedias(): void {
	const sortedByDate = getSortedByDate();

	if (getAllSelectedMedias().size === sortedByDate.size) return;

	setAllSelectedMedias(sortedByDate);
}
