import { ipcRenderer } from "electron";

import { ElectronIpcMainProcessNotificationEnum } from "@common/@types/electron-window";

export function sendNotificationToElectronIpcMainProcess(
	type: ElectronIpcMainProcessNotificationEnum,
): void {
	ipcRenderer.send("notify", type);
}
