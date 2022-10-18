import type { DeepReadonly } from "./@types/utils";
import type {
	MsgObjectElectronToReact,
	MsgObjectReactToElectron,
} from "@common/@types/electron-window";

import { dbg } from "./debug";

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

export const sendMsgToBackend = (
	msg: MsgObjectReactToElectron,
	electronPort?: MessagePort,
): void => {
	dbg("Sending message to backend:", { msg, electronPort });

	electronPort ?
		window.postMessage({ msg, source: reactSource }, "*", [electronPort]) :
		window.postMessage({ msg, source: reactSource }, "*");
};

/////////////////////////////////////////

export const sendMsgToClient = (msg: MsgObjectElectronToReact): void => {
	dbg("Sending message to client:", msg);

	window.postMessage({ msg, source: electronSource }, "*");
};

/////////////////////////////////////////
/////////////////////////////////////////

export const electronSource = "muse-electron";
export const reactSource = "muse-react";

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Types:

export type MsgWithSource<T> = DeepReadonly<{ source: string; msg: T; }>;
