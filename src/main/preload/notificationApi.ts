import type { MsgObjectReactToElectron } from "@common/@types/electron-window";

import { ipcRenderer } from "electron";

import { ElectronIpcMainProcessNotificationEnum } from "@common/@types/electron-window";

export const receiveMsgFromElectronWindow = (
	handleMsg: (msgObject: MsgObjectReactToElectron) => void,
): void => {
	ipcRenderer.on("async-msg", (_, msgObject: MsgObjectReactToElectron) =>
		handleMsg(msgObject),
	);
};

export const sendNotificationToElectronIpcMainProcess = (
	object: Readonly<{
		type: ElectronIpcMainProcessNotificationEnum;
		msg?: string;
	}>,
): void => ipcRenderer.send("notify", object);
