import type { Path } from "@common/@types/generalTypes";

import { createEffect, createSignal } from "solid-js";

import { getSortedByDate } from "./usePlaylists";
import { time } from "@utils/utils";

///////////////////////////////////////////////////
///////////////////////////////////////////////////
///////////////////////////////////////////////////

export const [getAllSelectedMedias, setAllSelectedMedias] = createSignal<
	Set<Path>
>(new Set());

///////////////////////////////////////////////////
///////////////////////////////////////////////////
///////////////////////////////////////////////////
// Handle media selection:

let prevSelectedMedias: Set<Path> | undefined;

// Handle decorate medias row:
createEffect(() =>
	time(() => {
		if (!prevSelectedMedias) return;

		const selectedMedias = getAllSelectedMedias();

		// Has to be this order:
		for (const path of prevSelectedMedias)
			for (const element of document.querySelectorAll(
				`[data-path="${path}"]`,
			)) {
				if (selectedMedias.has(path)) continue;

				element.classList.remove("selected");
			}

		for (const path of selectedMedias)
			for (const element of document.querySelectorAll(`[data-path="${path}"]`))
				element.classList.add("selected");
	}, "handleDecorateMediasRow"),
);

///////////////////////////////////////////////////

export const toggleSelectedMedia = (path: Path): void =>
	time(
		() =>
			getAllSelectedMedias().has(path)
				? removeFromAllSelectedMedias(path)
				: addToAllSelectedMedias(path),
		"toggleSelectedMedia",
	);

///////////////////////////////////////////////////

export const addToAllSelectedMedias = (path: Path): void => {
	const allSelectedMedias = getAllSelectedMedias();

	if (allSelectedMedias.has(path)) return;

	setAllSelectedMedias(allSelectedMedias.add(path));
};

///////////////////////////////////////////////////

export const removeFromAllSelectedMedias = (path: Path): void => {
	const allSelectedMedias = getAllSelectedMedias();

	if (!allSelectedMedias.has(path)) return;

	allSelectedMedias.delete(path);

	setAllSelectedMedias(allSelectedMedias);
};

///////////////////////////////////////////////////

export const deselectAllMedias = (): void => {
	const allSelectedMedias = getAllSelectedMedias();

	if (allSelectedMedias.size === 0) return;

	allSelectedMedias.clear();

	setAllSelectedMedias(allSelectedMedias);
};

///////////////////////////////////////////////////

export const selectAllMedias = (): void => {
	const allSelectedMedias = getAllSelectedMedias();
	const sortedByDate = getSortedByDate();

	if (allSelectedMedias.size === sortedByDate.size) return;

	setAllSelectedMedias(sortedByDate);
};
