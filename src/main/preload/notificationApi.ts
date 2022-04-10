import type { MsgObject } from "@common/@types/electron-window";

import { ipcRenderer } from "electron";

export function receiveMsgFromElectron(
	handleMsg: (msgObject: MsgObject) => void,
): void {
	ipcRenderer.on("async-msg", (_, msgObject: MsgObject) =>
		handleMsg(msgObject),
	);
}
