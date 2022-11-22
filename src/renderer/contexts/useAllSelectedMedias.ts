import type { Path } from "@common/@types/generalTypes";

import { observable, observe } from "@legendapp/state";

import { getSortedByDate } from "./usePlaylists";
import { time } from "@utils/utils";

///////////////////////////////////////////////////
///////////////////////////////////////////////////
///////////////////////////////////////////////////

export const selectedMedias = observable<Set<Path>>(new Set());

///////////////////////////////////////////////////
///////////////////////////////////////////////////
///////////////////////////////////////////////////
// Handle media selection:

if (import.meta.vitest === undefined)
	observe<typeof selectedMedias>(function handleDecorateMediasRow({
		previous: prevSelectedMedias,
	}): void {
		time(() => {
			// Has to be this order: first prev then current!!!
			if (prevSelectedMedias)
				for (const path of prevSelectedMedias.get())
					for (const element of document.querySelectorAll(
						`[data-path="${path}"]`,
					)) {
						if (selectedMedias.has(path)) return;

						element.classList.remove("selected");
					}

			// This observe will automatically track selectedMedias for changes
			for (const path of selectedMedias.get())
				for (const element of document.querySelectorAll(
					`[data-path="${path}"]`,
				))
					element.classList.add("selected");
		}, "handleDecorateMediasRow");
	});

///////////////////////////////////////////////////

export function toggleSelectedMedia(path: Path): void {
	time(
		() =>
			selectedMedias.peek().has(path)
				? removeFromAllSelectedMedias(path)
				: addToAllSelectedMedias(path),
		"toggleSelectedMedia",
	);
}

///////////////////////////////////////////////////

export function addToAllSelectedMedias(path: Path): void {
	const allSelectedMedias = selectedMedias.get();

	if (allSelectedMedias.has(path)) return;

	allSelectedMedias.add(path);
}

///////////////////////////////////////////////////

export function removeFromAllSelectedMedias(path: Path): void {
	const allSelectedMedias = selectedMedias.get();

	if (!allSelectedMedias.has(path)) return;

	allSelectedMedias.delete(path);
}

///////////////////////////////////////////////////

export function deselectAllMedias(): void {
	if (selectedMedias.peek().size === 0) return;

	selectedMedias.get().clear();
}

///////////////////////////////////////////////////

export function selectAllMedias(): void {
	const sortedByDate = getSortedByDate();

	if (selectedMedias.peek().size === sortedByDate.size) return;

	selectedMedias.set(sortedByDate);
}
