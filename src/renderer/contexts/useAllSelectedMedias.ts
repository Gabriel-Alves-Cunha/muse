import type { ID } from "@common/@types/generalTypes";

import { subscribeWithSelector } from "zustand/middleware";
import create from "zustand";

import { getSortedByDate } from "./usePlaylists";
import { emptySet } from "@common/empty";
import { time } from "@utils/utils";

///////////////////////////////////////////////////
///////////////////////////////////////////////////
///////////////////////////////////////////////////

export const useAllSelectedMedias = create<{ medias: ReadonlySet<ID> }>()(
	subscribeWithSelector((_set, _get, _api) => ({ medias: emptySet })),
);

export const getAllSelectedMedias = () =>
	useAllSelectedMedias.getState().medias;
export const setAllSelectedMedias = (medias: ReadonlySet<ID>) =>
	useAllSelectedMedias.setState({ medias });

///////////////////////////////////////////////////
///////////////////////////////////////////////////
///////////////////////////////////////////////////
// Handle media selection:

useAllSelectedMedias.subscribe(
	(state) => state.medias,
	// Handle decorate medias row
	(selectedMedias, prevSelectedMedias): void =>
		time(() => {
			// Has to be this order:
			for (const id of prevSelectedMedias)
				for (const element of document.querySelectorAll(`[data-id="${id}"]`)) {
					if (selectedMedias.has(id)) continue;

					element.classList.remove("selected");
				}

			for (const id of selectedMedias)
				for (const element of document.querySelectorAll(`[data-id="${id}"]`))
					element.classList.add("selected");
		}, "handleDecorateMediasRow"),
);

///////////////////////////////////////////////////

export const toggleSelectedMedia = (id: ID): void => {
	time(
		() =>
			getAllSelectedMedias().has(id)
				? removeFromAllSelectedMedias(id)
				: addToAllSelectedMedias(id),
		"toggleSelectedMedia",
	);
};

///////////////////////////////////////////////////

export function addToAllSelectedMedias(id: ID): void {
	const allSelectedMedias = getAllSelectedMedias();

	if (allSelectedMedias.has(id)) return;

	setAllSelectedMedias(new Set(allSelectedMedias).add(id));
}

///////////////////////////////////////////////////

export function removeFromAllSelectedMedias(id: ID): void {
	const allSelectedMedias = getAllSelectedMedias();

	if (!allSelectedMedias.has(id)) return;

	const newSet = new Set(allSelectedMedias);
	newSet.delete(id);

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
