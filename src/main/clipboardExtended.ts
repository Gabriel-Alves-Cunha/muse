import { EventEmitter } from "events";
import { clipboard } from "@tauri-apps/api";

const clipboardEmitter = new EventEmitter();

let watcherId: NodeJS.Timer | undefined = undefined;
let previousText = (await clipboard.readText()) ?? "";

(clipboard as ClipboardExtended).on = <T>(
	event: string,
	listener: (...args: T[]) => void,
) => {
	clipboardEmitter.on(event, listener);

	return clipboard;
};

(clipboard as ClipboardExtended).once = <T>(
	event: string,
	listener: (...args: T[]) => void,
) => {
	clipboardEmitter.once(event, listener);

	return clipboard;
};

(clipboard as ClipboardExtended).off = <T>(
	event: string,
	listener?: (...args: T[]) => void,
) => {
	if (listener) clipboardEmitter.removeListener(event, listener);
	else clipboardEmitter.removeAllListeners(event);

	return clipboard;
};

(clipboard as ClipboardExtended).startWatching = () => {
	if (!watcherId)
		watcherId = setInterval(async () => {
			if (previousText !== (previousText = (await clipboard.readText()) ?? ""))
				clipboardEmitter.emit("text-changed");
		}, 500);

	return clipboard;
};

(clipboard as ClipboardExtended).stopWatching = () => {
	if (watcherId) clearInterval(watcherId);

	return clipboard;
};

export { clipboard as ExtendedClipboard };

// Doing this Partial<{}> so typescript doesn't complain...
type ClipboardExtended = typeof clipboard &
	Partial<{
		startWatching: () => ClipboardExtended;
		stopWatching: () => ClipboardExtended;
		off: <T>(
			event: string,
			listener?: (...args: T[]) => void,
		) => ClipboardExtended;
		on: <T>(
			event: string,
			listener: (...args: T[]) => void,
		) => ClipboardExtended;
		once: <T>(
			event: string,
			listener: (...args: T[]) => void,
		) => ClipboardExtended;
	}>;
