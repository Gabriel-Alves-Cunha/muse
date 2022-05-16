import type {
	MsgObjectElectronToReact,
	MsgObjectReactToElectron,
} from "@common/@types/electron-window";

import { dbg as dbg_, dbgTests } from "@common/utils";

const dbg = (...args: unknown[]) => {
	dbgTests(args);
	dbg_(args);
};

export const sendMsgToBackend = (
	msg: MsgObjectReactToElectron,
	electronPort?: MessagePort
) => {
	dbg("Sending message to backend:", { msg, electronPort });

	electronPort
		? window.postMessage({ msg, source: reactSource }, "*", [electronPort])
		: window.postMessage({ msg, source: reactSource }, "*");
};

export const sendMsgToClient = (msg: MsgObjectElectronToReact) => {
	dbg_("Sending message to client:", msg);

	window.postMessage({ msg, source: electronSource }, "*");
};

const baseSource = "muse-";
export const electronSource = `${baseSource}electron`;
export const reactSource = `${baseSource}react`;

export type MsgWithSource<T> = {
	source: string;
	msg: T;
};
