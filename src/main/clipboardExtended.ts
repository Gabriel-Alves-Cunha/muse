import { EventEmitter } from "events";
import { clipboard } from "electron";

export type ClipboardExtended = Electron.Clipboard & {
	startWatching?: () => ClipboardExtended;
	stopWatching?: () => ClipboardExtended;
	off?: <T>(
		event: string,
		listener?: (...args: T[]) => void
	) => ClipboardExtended;
};

const clipboardEmitter = new EventEmitter();

let watcherId: NodeJS.Timer | undefined = undefined;
let previousText = clipboard.readText();

clipboard.on = <T>(event: string, listener: (...args: T[]) => void) => {
	clipboardEmitter.on(event, listener);

	return clipboard;
};

clipboard.once = <T>(event: string, listener: (...args: T[]) => void) => {
	clipboardEmitter.once(event, listener);

	return clipboard;
};

(clipboard as ClipboardExtended).off = <T>(
	event: string,
	listener?: (...args: T[]) => void
) => {
	if (listener) clipboardEmitter.removeListener(event, listener);
	else clipboardEmitter.removeAllListeners(event);

	return clipboard;
};

(clipboard as ClipboardExtended).startWatching = () => {
	if (!watcherId)
		watcherId = setInterval(() => {
			if (isTextDiff(previousText, (previousText = clipboard.readText())))
				clipboardEmitter.emit("text-changed");
		}, 500);

	return clipboard;
};

(clipboard as ClipboardExtended).stopWatching = () => {
	if (watcherId) clearInterval(watcherId);
	watcherId = undefined;

	return clipboard;
};

const isTextDiff = (str1: string, str2: string) => str2 && str1 !== str2;

export { clipboard as ExtendedClipboard };
