import type { DeepReadonly } from "./@types/utils";
import type {
	MsgObjectElectronToReact,
	MsgObjectReactToElectron,
} from "@common/@types/electron-window";

import { dbg } from "./utils";

export const sendMsgToBackend = (
	msg: MsgObjectReactToElectron,
	electronPort?: Readonly<MessagePort>,
): void => {
	dbg("Sending message to backend:", { msg, electronPort });

	electronPort ?
		window.postMessage({ msg, source: reactSource }, "*", [electronPort]) :
		window.postMessage({ msg, source: reactSource }, "*");
};

export const sendMsgToClient = (msg: MsgObjectElectronToReact): void => {
	dbg("Sending message to client:", msg);

	window.postMessage({ msg, source: electronSource }, "*");
};

const baseSource = "muse-";
export const electronSource = `${baseSource}electron`;
export const reactSource = `${baseSource}react`;

export type MsgWithSource<T> = DeepReadonly<{ source: string; msg: T; }>;
