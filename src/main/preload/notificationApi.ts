import type { ValuesOf } from "@common/@types/Utils";

import { ipcRenderer } from "electron";

import { ElectronIpcMainProcessNotificationEnum } from "@common/enums";

export const sendNotificationToElectronIpcMainProcess = (
	type: ValuesOf<typeof ElectronIpcMainProcessNotificationEnum>,
): void => ipcRenderer.send("notify", type);
