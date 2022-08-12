import type { Path } from "@common/@types/generalTypes";

import { subscribeWithSelector } from "zustand/middleware";
import create from "zustand";

import { getSortedByDate } from "./usePlaylists";
import { emptySet } from "@utils/map-set";
import { time } from "@utils/utils";

///////////////////////////////////////////////////
///////////////////////////////////////////////////
///////////////////////////////////////////////////

export const useAllSelectedMedias = create<{ medias: ReadonlySet<Path>; }>()(
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	subscribeWithSelector((_set, _get, _api) => ({ medias: emptySet })),
);

export const allSelectedMedias = () => useAllSelectedMedias.getState().medias;
export const setAllSelectedMedias = (medias: ReadonlySet<Path>) =>
	useAllSelectedMedias.setState({ medias });

///////////////////////////////////////////////////
///////////////////////////////////////////////////
///////////////////////////////////////////////////
// Handle media selection:

if (!import.meta.vitest)
	useAllSelectedMedias.subscribe(
		state => state.medias,
		function handleDecorateMediasRow(selectedMedias, prevSelectedMedias): void {
			time(() => {
				// TODO: improve this:
				// Has to be this order:
				prevSelectedMedias.forEach(path =>
					document.querySelector(`[data-path="${path}"]`)?.classList.remove(
						"selected",
					)
				);
				selectedMedias.forEach(path =>
					document.querySelector(`[data-path="${path}"]`)?.classList.add(
						"selected",
					)
				);
			}, "handleDecorateMediasRow");
		},
	);

///////////////////////////////////////////////////

export function toggleSelectedMedia(path: Path): void {
	time(
		() =>
			allSelectedMedias().has(path) ?
				removeFromAllSelectedMedias(path) :
				addToAllSelectedMedias(path),
		"toggleSelectedMedia",
	);
}

///////////////////////////////////////////////////

export function addToAllSelectedMedias(path: Path): void {
	if (allSelectedMedias().has(path)) return;

	setAllSelectedMedias(new Set(allSelectedMedias()).add(path));
}

///////////////////////////////////////////////////

export function removeFromAllSelectedMedias(path: Path): void {
	if (!allSelectedMedias().has(path)) return;

	const newSet = new Set(allSelectedMedias());
	newSet.delete(path);

	setAllSelectedMedias(newSet);
}

///////////////////////////////////////////////////

export function deselectAllMedias(): void {
	if (allSelectedMedias().size === 0) return;

	setAllSelectedMedias(emptySet);
}

///////////////////////////////////////////////////

export function selectAllMedias(): void {
	if (allSelectedMedias().size === getSortedByDate().size) return;

	setAllSelectedMedias(getSortedByDate());
}
