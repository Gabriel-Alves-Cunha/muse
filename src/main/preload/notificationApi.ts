import { ipcRenderer } from "electron";

import { ElectronIpcMainProcessNotificationEnum } from "@common/enums";

export function sendNotificationToElectronIpcMainProcess(
	type: ElectronIpcMainProcessNotificationEnum,
): void {
	ipcRenderer.send("notify", type);
}
