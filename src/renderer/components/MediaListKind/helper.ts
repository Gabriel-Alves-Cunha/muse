import type { DateAsNumber, Media, ID } from "@common/@types/generalTypes";

import { ElectronIpcMainProcessNotification } from "@common/enums";

import { isAModifierKeyPressed } from "@utils/keyboard";
import { isCtxMenuOpen } from "./states";
import { dbg } from "@common/debug";
import {
	addToAllSelectedMedias,
	getAllSelectedMedias,
	deselectAllMedias,
	selectAllMedias,
} from "@contexts/useAllSelectedMedias";

const notify =
	electron.notificationApi.sendNotificationToElectronIpcMainProcess;

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

export function selectMediaByPointerEvent(
	e: React.PointerEvent<HTMLDivElement>,
): void {
	const mediaClickedMediaId = (e.target as HTMLElement)
		.closest<HTMLDivElement>(".row-wrapper")
		?.getAttribute("data-id");

	if (!mediaClickedMediaId) return dbg("No 'data-id' found!");

	addToAllSelectedMedias(mediaClickedMediaId);
}

/////////////////////////////////////////////

export const computeItemKey = (
	_index: number,
	[id]: [ID, Media, DateAsNumber],
): ID => id;

/////////////////////////////////////////

export const computeHistoryItemKey = (
	_index: number,
	[id, , date]: [ID, Media, DateAsNumber],
): `${ID}${DateAsNumber}` => `${id}${date}`;

/////////////////////////////////////////

export const reloadWindow = (): void =>
	notify(ElectronIpcMainProcessNotification.RELOAD_WINDOW);

/////////////////////////////////////////

export function selectAllMediasOnCtrlPlusA(e: KeyboardEvent) {
	if (e.ctrlKey && e.key === "a" && !isAModifierKeyPressed(e, ["Control"])) {
		e.preventDefault();
		selectAllMedias();
	}
}

/////////////////////////////////////////

export function handleDeselectAllMedias() {
	if (!isCtxMenuOpen() && getAllSelectedMedias().size > 0) deselectAllMedias();
}
