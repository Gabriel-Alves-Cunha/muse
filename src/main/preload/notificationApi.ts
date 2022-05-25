import { ipcRenderer } from "electron";

import { ElectronIpcMainProcessNotificationEnum } from "@common/@types/electron-window";

export const sendNotificationToElectronIpcMainProcess = (
	type: ElectronIpcMainProcessNotificationEnum
): void => ipcRenderer.send("notify", type);
