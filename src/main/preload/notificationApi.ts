import type { ValuesOf } from "@common/@types/utils";

import { ipcRenderer } from "electron";

import { electronIpcMainProcessNotification } from "@common/enums";

export function sendNotificationToElectronIpcMainProcess(
	type: ValuesOf<typeof electronIpcMainProcessNotification>,
): void {
	ipcRenderer.send("notify", type);
}
