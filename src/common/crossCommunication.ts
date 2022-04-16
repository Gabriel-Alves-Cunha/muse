import {
	MsgObjectElectronToReact,
	MsgObjectReactToElectron,
} from "@common/@types/electron-window";
import { dbg } from "@common/utils";

export const sendMsgToBackend = (
	type: MsgObjectReactToElectron,
	electronPort?: MessagePort,
) => {
	dbg("Sending message to backend:", { type, electronPort, window });

	electronPort
		? window.postMessage(type, "*", [electronPort])
		: window.postMessage(type, "*");
};

export const sendMsgToClient = (obj: MsgObjectElectronToReact) => {
	dbg("Sending message to client:", obj);

	window.postMessage(obj);
};
