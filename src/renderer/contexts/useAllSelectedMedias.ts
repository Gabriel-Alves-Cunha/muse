import type { Path } from "@common/@types/generalTypes";

import { subscribeWithSelector } from "zustand/middleware";
import create from "zustand";

import { getSortedByDate } from "./usePlaylists";
import { emptySet } from "@common/empty";
import { time } from "@utils/utils";

///////////////////////////////////////////////////
///////////////////////////////////////////////////
///////////////////////////////////////////////////

export const useAllSelectedMedias = create<{ medias: ReadonlySet<Path> }>()(
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
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

if (import.meta.vitest === undefined)
	useAllSelectedMedias.subscribe(
		(state) => state.medias,
		function handleDecorateMediasRow(selectedMedias, prevSelectedMedias): void {
			time(() => {
				// Has to be this order:
				prevSelectedMedias.forEach((path) =>
					document
						.querySelectorAll(`[data-path="${path}"]`)
						?.forEach((element) => {
							if (selectedMedias.has(path)) return;

							element.classList.remove("selected");
						}),
				);
				selectedMedias.forEach((path) =>
					document
						.querySelectorAll(`[data-path="${path}"]`)
						?.forEach((element) => element.classList.add("selected")),
				);
			}, "handleDecorateMediasRow");
		},
	);

///////////////////////////////////////////////////

export function toggleSelectedMedia(path: Path): void {
	time(
		() =>
			getAllSelectedMedias().has(path)
				? removeFromAllSelectedMedias(path)
				: addToAllSelectedMedias(path),
		"toggleSelectedMedia",
	);
}

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
