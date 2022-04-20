import type {
	MsgObjectElectronToReact,
	MsgObjectReactToElectron,
} from "@common/@types/electron-window";

import { dbg } from "@common/utils";

export const sendMsgToBackend = (
	msg: MsgObjectReactToElectron,
	electronPort?: MessagePort,
) => {
	dbg("Sending message to backend:", { msg, electronPort, window });

	electronPort
		? window.postMessage({ msg, source: reactSource }, "*", [electronPort])
		: window.postMessage({ msg, source: reactSource }, "*");
};

export const sendMsgToClient = (msg: MsgObjectElectronToReact) => {
	dbg("Sending message to client:", msg);

	window.postMessage({ msg, source: electronSource }, "*");
};

const baseSource = "muse-";
export const electronSource = `${baseSource}electron`;
export const reactSource = `${baseSource}react`;

export type MsgWithSource<T> = {
	source: string;
	msg: T;
};