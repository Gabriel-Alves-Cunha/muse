import type { MsgObject } from "@common/@types/electron-window";

import { ipcRenderer } from "electron";

import { writeTags } from "./media";
import {
	ListenToNotification,
	NotificationEnum,
} from "@common/@types/typesAndEnums";

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

// For window.twoWayComm_React_Electron:
export function addListeners(port: MessagePort): Readonly<MessagePort> {
	port.onmessage = async event => {
		const { data } = event;

		console.log("At addListeners on file 'preload.ts', line 57:", data);

		switch (data.type) {
			case "write tag": {
				// details: [mediaPath, whatToChange.whatToChange, value.trim()],
				const [mediaPath, whatToChange, value] = data.details;

				try {
					console.assert(mediaPath, whatToChange, value);

					await writeTags(mediaPath, { [whatToChange]: value });
				} catch (error) {
					console.error(error);
				}
				break;
			}

			// TODO: handle this and other cases from writeTag!
			case ListenToNotification.ADD_ONE_MEDIA: {
				break;
			}

			default: {
				console.error(
					"Message received on electron side of 2way-comm, but there is no function to handle it:",
					data,
				);
				break;
			}
		}
	};

	return port;
}
