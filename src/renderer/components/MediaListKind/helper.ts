import type { DateAsNumber, Media, Path } from "@common/@types/GeneralTypes";

import { isAModifierKeyPressed } from "@utils/keyboard";
import { selectAllMedias } from "@contexts/allSelectedMedias";

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

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
		e.stopPropagation();
		e.preventDefault();

		selectAllMedias();
	}
}
