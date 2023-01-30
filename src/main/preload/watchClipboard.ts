import { readText } from "@tauri-apps/api/clipboard";

class Clipboard extends EventTarget {
	watcherId: NodeJS.Timer | undefined;
	previousText = "";

	constructor() {
		super();
	}

	startWatching() {
		this.watcherId = setInterval(async () => {
			if (this.previousText !== (this.previousText = (await readText()) ?? ""))
				this.dispatchEvent(new Event("text-changed"));
		}, 400);

		return this;
	}

	/////////////////////////////////////////

	stopWatching() {
		clearInterval(this.watcherId);
		this.watcherId = undefined;

		return clipboard;
	}
}

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

export const clipboard = new Clipboard();
