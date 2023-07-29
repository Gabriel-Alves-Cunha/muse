import type { DateAsNumber, Media, Path } from "@common/@types/GeneralTypes";

import { isAModifierKeyPressed } from "@utils/keyboard";
import { selectAllMedias } from "@contexts/allSelectedMedias";

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

export const computeItemKey = (_index: number, [path]: [Path, Media]): Path =>
	path;

/////////////////////////////////////////

export const computeHistoryItemKey = (
	_index: number,
	[path, media]: [Path, Media],
): `${Path}${DateAsNumber}` => `${path}${media.lastModified}`;

/////////////////////////////////////////

export const reloadWindow = location.reload;

/////////////////////////////////////////

export function selectAllMediasOnCtrlPlusA(e: KeyboardEvent): void {
	if (e.ctrlKey && e.key === "a" && !isAModifierKeyPressed(e, ["Control"])) {
		e.stopPropagation();
		e.preventDefault();

		selectAllMedias();
	}
}
