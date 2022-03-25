import type { MsgObject } from "@common/@types/electron-window";

import { ipcRenderer } from "electron";

import { NotificationEnum } from "@common/@types/typesAndEnums";

export function sendNotificationToElectron(
	object: Readonly<{
		type: NotificationEnum;
		msg?: string;
	}>,
): void {
	ipcRenderer.send("notify", object);
}

export function receiveMsgFromElectron(
	handleMsg: (msgObject: MsgObject) => void,
): void {
	ipcRenderer.on("async-msg", (_, msgObject: MsgObject) =>
		handleMsg(msgObject),
	);
}
