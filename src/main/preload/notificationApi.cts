import type { Values } from "@common/@types/utils";

import { ipcRenderer } from "electron";

import { ElectronIpcMainProcessNotification } from "@common/enums";

export function sendNotificationToElectronIpcMainProcess(
	type: Values<typeof ElectronIpcMainProcessNotification>,
): void {
	ipcRenderer.send("notify", type);
}
