import type {
	MsgObjectElectronToReact,
	MsgObjectReactToElectron,
} from "@common/@types/electron-window";

import { dbg, dbgTests } from "@common/utils";

const dbg_ = (...args: unknown[]) => {
	dbgTests(JSON.stringify(args, null, 2));
	dbg(JSON.stringify(args, null, 2));
};

export const sendMsgToBackend = (
	msg: MsgObjectReactToElectron,
	electronPort?: MessagePort
) => {
	dbg_("Sending message to backend:", { msg, electronPort });

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
