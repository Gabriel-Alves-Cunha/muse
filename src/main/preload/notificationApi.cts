import type { ValuesOf } from "@common/@types/utils";

import { ipcRenderer } from "electron";

import { ElectronIpcMainProcessNotification } from "@common/enums";

export function sendNotificationToElectronIpcMainProcess(
	type: ValuesOf<typeof ElectronIpcMainProcessNotification>,
): void {
	ipcRenderer.send("notify", type);
}
