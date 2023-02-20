import type { DateAsNumber, Media, Path } from "@common/@types/generalTypes";

import { isAModifierKeyPressed } from "@utils/keyboard";
import { dbg } from "@common/debug";
import {
	addToAllSelectedMedias,
	selectAllMedias,
} from "@contexts/allSelectedMedias";

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

export function selectMediaByPointerEvent(
	e: React.PointerEvent<HTMLDivElement>,
): void {
	const mediaClickedMediaId = (e.target as HTMLElement)
		.closest<HTMLDivElement>(".row-wrapper")
		?.getAttribute("data-path");

	if (!mediaClickedMediaId) return dbg("No 'data-path' found!");

	addToAllSelectedMedias(mediaClickedMediaId);
}

/////////////////////////////////////////////

export const computeItemKey = (
	_index: number,
	[path]: [Path, Media, DateAsNumber],
): Path => path;

/////////////////////////////////////////

export const computeHistoryItemKey = (
	_index: number,
	[path, , date]: [Path, Media, DateAsNumber],
): `${Path}${DateAsNumber}` => `${path}${date}`;

/////////////////////////////////////////

export const reloadWindow = (): void => location.reload();

/////////////////////////////////////////

export function selectAllMediasOnCtrlPlusA(e: KeyboardEvent) {
	if (e.ctrlKey && e.key === "a" && !isAModifierKeyPressed(e, ["Control"])) {
		e.preventDefault();
		selectAllMedias();
	}
}
