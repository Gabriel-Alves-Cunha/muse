import type {
	MsgObjectElectronToReact,
	MsgObjectReactToElectron,
} from "@common/@types/electron-window";

import { dbg } from "./utils";

export const sendMsgToBackend = (
	msg: Readonly<MsgObjectReactToElectron>,
	electronPort?: Readonly<MessagePort>,
): void => {
	dbg("Sending message to backend:", { msg, electronPort });

	electronPort ?
		window.postMessage({ msg, source: reactSource }, "*", [electronPort]) :
		window.postMessage({ msg, source: reactSource }, "*");
};

export const sendMsgToClient = (
	msg: Readonly<MsgObjectElectronToReact>,
): void => {
	dbg("Sending message to client:", msg);

	window.postMessage({ msg, source: electronSource }, "*");
};

const baseSource = "muse-";
export const electronSource = `${baseSource}electron`;
export const reactSource = `${baseSource}react`;

export const port = 8080;

export type MsgWithSource<T> = Readonly<{ source: string; msg: T; }>;
