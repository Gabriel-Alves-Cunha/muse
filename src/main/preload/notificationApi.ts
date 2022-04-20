import { ipcRenderer } from "electron";

import { ElectronIpcMainProcessNotificationEnum } from "@common/@types/electron-window";

export const sendNotificationToElectronIpcMainProcess = (
	object: Readonly<{
		type: ElectronIpcMainProcessNotificationEnum;
		msg?: string;
	}>,
): void => ipcRenderer.send("notify", object);
