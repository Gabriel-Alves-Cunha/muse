import type { Path } from "@common/@types/generalTypes";

import { batch, createEffect } from "solid-js";
import { ReactiveSet } from "@solid-primitives/set";

import { playlists } from "./playlists";
import { time } from "@utils/utils";

///////////////////////////////////////////////////
///////////////////////////////////////////////////
///////////////////////////////////////////////////

export const allSelectedMedias = new ReactiveSet<Path>();

///////////////////////////////////////////////////
///////////////////////////////////////////////////
///////////////////////////////////////////////////
// Handle media selection:

let prevSelectedMedias: Set<Path> | undefined;

// Handle decorate medias row:
createEffect(
	() =>
		time(() => {
			if (!prevSelectedMedias) return;

			// Has to be this order:
			for (const path of prevSelectedMedias)
				for (const element of document.querySelectorAll(
					`[data-path="${path}"]`,
				)) {
					if (allSelectedMedias.has(path)) continue;

					element.classList.remove("selected");
				}

			for (const path of allSelectedMedias)
				for (const element of document.querySelectorAll(
					`[data-path="${path}"]`,
				))
					element.classList.add("selected");
		}, "handleDecorateMediasRow"),
	{ defer: true },
);

///////////////////////////////////////////////////

export const toggleSelectedMedia = (path: Path): void =>
	time(() => {
		allSelectedMedias.has(path)
			? allSelectedMedias.delete(path)
			: allSelectedMedias.add(path);
	}, "toggleSelectedMedia");

///////////////////////////////////////////////////

export const selectAllMedias = (): void => {
	const { sortedByDate } = playlists;

	if (allSelectedMedias.size === sortedByDate.size) return;

	batch(() => {
		allSelectedMedias.clear();

		for (const path of sortedByDate) allSelectedMedias.add(path);
	});
};
