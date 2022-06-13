import { EventEmitter } from "node:events";
import { clipboard } from "electron";

const clipboardEmitter = new EventEmitter();

let watcherId: NodeJS.Timer | undefined;
let previousText = clipboard.readText();

(clipboard as ClipboardExtended).on = <T>(
	eventName: string,
	listener: (...args: T[]) => void,
) => {
	clipboardEmitter.on(eventName, listener);

	return clipboard;
};

(clipboard as ClipboardExtended).once = <T>(
	eventName: string,
	listener: (...args: T[]) => void,
) => {
	clipboardEmitter.once(eventName, listener);

	return clipboard;
};

(clipboard as ClipboardExtended).off = <T>(
	eventName: string,
	listener?: (...args: T[]) => void,
) => {
	if (listener) clipboardEmitter.removeListener(eventName, listener);
	else clipboardEmitter.removeAllListeners(eventName);

	return clipboard;
};

(clipboard as ClipboardExtended).startWatching = () => {
	if (!watcherId)
		watcherId = setInterval(() => {
			if (isTextDiff(previousText, previousText = clipboard.readText()))
				clipboardEmitter.emit("text-changed");
		}, 500);

	return clipboard;
};

(clipboard as ClipboardExtended).stopWatching = () => {
	if (watcherId) clearInterval(watcherId);
	watcherId = undefined;

	return clipboard;
};

const isTextDiff = (str1 = "", str2 = "") => str1 !== str2;

export { clipboard as ExtendedClipboard };

// Doing this Partial<{}> so typescript doesn't complain...
type ClipboardExtended =
	& Electron.Clipboard
	& Partial<
		{
			startWatching: () => ClipboardExtended;
			stopWatching: () => ClipboardExtended;
			off: <T>(
				eventName: string,
				listener?: (...args: T[]) => void,
			) => ClipboardExtended;
			on: <T>(
				eventName: string,
				listener: (...args: T[]) => void,
			) => ClipboardExtended;
			once: <T>(
				eventName: string,
				listener: (...args: T[]) => void,
			) => ClipboardExtended;
		}
	>;
