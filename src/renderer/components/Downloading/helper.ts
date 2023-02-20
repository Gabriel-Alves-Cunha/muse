import type { MediaBeingDownloaded } from ".";
import type { DownloadInfo } from "@common/@types/generalTypes";
import type { ValuesOf } from "@common/@types/utils";

import { ProgressStatus, ReactToElectronMessage } from "@common/enums";
import { errorToast, infoToast, successToast } from "../toasts";
import { logThatPortIsClosing } from "../Converting/helper";
import { assertUnreachable } from "@utils/utils";
import { sendMsgToBackend } from "@common/crossCommunication";
import { downloadingList } from "@contexts/downloadList";
import { error, assert } from "@common/log";
import { translation } from "@i18n";
import { dbg } from "@common/debug";

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////

/**
 * This function returns a MessagePort that will be sent to
 * Electron to enable 2 way communication between it
 * and React.
 */
export function createNewDownload(downloadInfo: DownloadInfo): void {
	dbg("Trying to create a new download.", { downloadingList });

	const { imageURL, title, url } = downloadInfo;

	// First, see if there is another one that has the same url
	// and quit if true:
	if (downloadingList.has(url)) {
		const { t } = translation;

		const info = `${t("toasts.downloadAlreadyExists")}"${title}"`;

		infoToast(info);

		return error(info, downloadingList);
	}

	// Since this a brand new download, let's create a new one.
	// MessageChannels are lightweight, it's cheap to create
	// a new one for each DownloadingMedia to communicate the
	// download progress between React and Electron:
	const { port1: frontEndPort, port2: backEndPort } = new MessageChannel();

	// Sending port so we can communicate with Electron:
	sendMsgToBackend(
		{ type: ReactToElectronMessage.CREATE_A_NEW_DOWNLOAD },
		backEndPort,
	);

	// Creating a new DownloadingMedia and adding it to the list:
	downloadingList.set(url, {
		status: ProgressStatus.WAITING_FOR_CONFIRMATION_FROM_ELECTRON,
		port: frontEndPort,
		percentage: 0,
		imageURL,
		title,
	});

	// Send msg to electronPort to download:
	frontEndPort.postMessage(downloadInfo);

	// Adding event listeners to React's MessagePort to receive and
	// handle download progress info:

	frontEndPort.addEventListener("close", logThatPortIsClosing);
	frontEndPort.addEventListener(
		"message",
		(e: MessageEvent<PartialExceptStatus>) =>
			handleUpdateDownloadingList(e, downloadInfo.url),
	);

	frontEndPort.start();
}

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Helper functions for `createNewDownload()`

function handleUpdateDownloadingList(
	{ data }: MessageEvent<PartialExceptStatus>,
	url: string,
): void {
	dbg(`Received a message from Electron on port for "${url}":`, {
		downloadingList,
		data,
	});

	// Assert that the download exists:
	const thisDownload = downloadingList.get(url);
	if (!thisDownload)
		return error(
			"Received a message from Electron but the url is not in the list!",
		);

	// Update React's information about this DownloadingMedia:
	downloadingList.set(url, { ...thisDownload, ...data });

	const { t } = translation;

	// Handle status:
	switch (data.status) {
		case ProgressStatus.FAILED: {
			// @ts-ignore => ^ In this case, `data` include an `error: Error` key:
			assert(data.error, "data.error should exist!");

			errorToast(
				`${t("toasts.downloadError.beforePath")}"${thisDownload.title}"${t(
					"toasts.downloadError.afterPath",
				)} ${(data as typeof data & { error: Error }).error.message}`,
			);

			cancelDownloadAndOrRemoveItFromList(url);
			break;
		}

		case ProgressStatus.SUCCESS: {
			successToast(`${t("toasts.downloadSuccess")}"${thisDownload.title}"!`);

			cancelDownloadAndOrRemoveItFromList(url);
			break;
		}

		case ProgressStatus.CANCEL: {
			infoToast(`${t("toasts.downloadCanceled")}"${thisDownload.title}"!`);

			cancelDownloadAndOrRemoveItFromList(url);
			break;
		}

		case ProgressStatus.WAITING_FOR_CONFIRMATION_FROM_ELECTRON:
		case ProgressStatus.ACTIVE:
		case undefined:
			break;

		default:
			assertUnreachable(data.status);
	}
}

/////////////////////////////////////////////
/////////////////////////////////////////////

export function cancelDownloadAndOrRemoveItFromList(url: string): void {
	// Assert that the download exists:
	const download = downloadingList.get(url);

	if (!download)
		return error(`"${url}" not found! downloadList =`, downloadingList);

	// Cancel download:
	if (download.status === ProgressStatus.ACTIVE)
		download.port.postMessage({ destroy: true, url });

	// Update downloading list:
	downloadingList.delete(url);
}

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Types:

interface PartialExceptStatus extends Partial<MediaBeingDownloaded> {
	status: ValuesOf<typeof ProgressStatus>;
}