import { EventEmitter } from "node:events";
import { clipboard } from "electron";

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Constants and variables:

const clipboardEmitter = new EventEmitter();

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

Object.assign(clipboard, {
	watcherId: undefined as NodeJS.Timer | undefined,
	previousText: "",

	/////////////////////////////////////////

	on<T>(eventName: string, listener: (...args: T[]) => void) {
		clipboardEmitter.on(eventName, listener);

		return clipboard;
	},

	/////////////////////////////////////////

	once<T>(eventName: string, listener: (...args: T[]) => void) {
		clipboardEmitter.once(eventName, listener);

		return clipboard;
	},

	/////////////////////////////////////////

	off<T>(eventName: string, listener?: (...args: T[]) => void) {
		if (listener) clipboardEmitter.removeListener(eventName, listener);
		else clipboardEmitter.removeAllListeners(eventName);

		return clipboard;
	},

	/////////////////////////////////////////

	startWatching() {
		this.watcherId = setInterval(() => {
			if (
				isTextDiff(
					this.previousText,
					(this.previousText = clipboard.readText()),
				)
			)
				clipboardEmitter.emit("text-changed");
		}, 400);

		return clipboard;
	},

	/////////////////////////////////////////

	stopWatching() {
		clearInterval(this.watcherId);
		this.watcherId = undefined;

		return clipboard;
	},
});

/////////////////////////////////////////

const isTextDiff = (str1 = "", str2 = "") => str1 !== str2;

/////////////////////////////////////////

export { clipboard as extendedClipboard };

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Types:

export interface ClipboardExtended
	extends Electron.Clipboard,
		ClipboardExtension {}

interface ClipboardExtension {
	watcherId: NodeJS.Timer | undefined;
	previousText: string;

	on<T>(eventName: string, listener: (...args: T[]) => void): ClipboardExtended;
	startWatching(): ClipboardExtended;
	stopWatching(): ClipboardExtended;
	off<T>(
		eventName: string,
		listener?: (...args: T[]) => void,
	): ClipboardExtended;
	once<T>(
		eventName: string,
		listener: (...args: T[]) => void,
	): ClipboardExtended;
}
