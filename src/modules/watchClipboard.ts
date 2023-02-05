import { validateURL as isUrlValid, getBasicInfo } from "ytdl-core";
import { readText } from "@tauri-apps/api/clipboard";
import {
	isPermissionGranted,
	requestPermission,
	sendNotification,
} from "@tauri-apps/api/notification";

// @ts-ignore => It's alright:
import museLogoPath from "@assets/logo.png";

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Main class:

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
// Main function:

const clipboard = new Clipboard();

export async function watchClipboard() {
	let isPermissionGranted_ = await isPermissionGranted();

	if (!isPermissionGranted_) {
		const permission = await requestPermission();
		isPermissionGranted_ = permission === "granted";

		if (!isPermissionGranted_) return;
	}

	clipboard.addEventListener("text-changed", async () => {
		const url = clipboard.previousText;

		if (!isUrlValid(url)) return;

		const {
			media: { artist = "" },
			thumbnails,
			title,
		} = (await getBasicInfo(url)).videoDetails;

		const thumbnail = thumbnails.at(-1)?.url ?? "";

		sendNotification({
			body: "Click to download this media as 'mp3'",
			icon: museLogoPath,
			title,
		});

		// 		.on("click", () => {
		// 				const downloadInfo: DownloadInfo = {
		// 					imageURL: thumbnail,
		// 					extension: "mp3",
		// 					artist,
		// 					title,
		// 					url,
		// 				};
		//
		// 				sendMsgToClient({
		// 					type: ElectronToReactMessage.CREATE_A_NEW_DOWNLOAD,
		// 					downloadInfo,
		// 				});
		//
		// 				dbg("Clicked notification and sent data:", downloadInfo);
		// 			})
	});

	clipboard.startWatching();
}
