import type { MediaBeingDownloaded } from ".";
import type { DownloadInfo } from "@common/@types/GeneralTypes";
import type { ValuesOf } from "@common/@types/Utils";

import { ProgressStatusEnum, ReactToElectronMessageEnum } from "@common/enums";
import { errorToast, infoToast, successToast } from "../toasts";
import { logThatPortIsClosing } from "../Converting/helper";
import { assertUnreachable } from "@utils/utils";
import { sendMsgToBackend } from "@common/crossCommunication";
import { error, assert } from "@common/log";
import { dbg } from "@common/debug";
import { t } from "@i18n";
import {
	downloadingListRef,
	getDownloadingList,
	setDownloadingList,
} from "@contexts/downloadList";

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////

/**
 * This function returns a MessagePort that will be sent to
 * Electron to enable 2 way communication between it
 * and React.
 */
export function createNewDownload(downloadInfo: DownloadInfo): void {
	dbg("Trying to create a new download.", { downloadingListRef });

	const { imageURL, title, url } = downloadInfo;
	const downloadingList = getDownloadingList();

	// First, see if there is another one that has the same url
	// and quit if true:
	if (downloadingList.has(url)) {
		const info = `${t("toasts.downloadAlreadyExists")}"${title}"`;

		infoToast(info);

		error(info, downloadingListRef);

		return;
	}

	// Since this a brand new download, let's create a new one.
	// MessageChannels are lightweight, it's cheap to create
	// a new one for each DownloadingMedia to communicate the
	// download progress between React and Electron:
	const { port1: frontEndPort, port2: backEndPort } = new MessageChannel();

	// Sending port so we can communicate with Electron:
	sendMsgToBackend(
		{ type: ReactToElectronMessageEnum.CREATE_A_NEW_DOWNLOAD },
		backEndPort,
	);

	// Creating a new DownloadingMedia and adding it to the list:
	setDownloadingList(
		new Map(downloadingList).set(url, {
			status: ProgressStatusEnum.WAITING_FOR_CONFIRMATION_FROM_ELECTRON,
			port: frontEndPort,
			percentage: 0,
			imageURL,
			title,
		}),
	);

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
		downloadingListRef,
		data,
	});

	const downloadingList = getDownloadingList();

	// Assert that the download exists:
	const thisDownload = downloadingList.get(url);

	if (!thisDownload) {
		error("Received a message from Electron but the url is not in the list!");

		return;
	}

	// Update React's information about this DownloadingMedia:
	setDownloadingList(
		new Map(downloadingList).set(url, { ...thisDownload, ...data }),
	);

	// Handle status:
	switch (data.status) {
		case ProgressStatusEnum.FAILED: {
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

		case ProgressStatusEnum.SUCCESS: {
			successToast(`${t("toasts.downloadSuccess")}"${thisDownload.title}"!`);

			cancelDownloadAndOrRemoveItFromList(url);
			break;
		}

		case ProgressStatusEnum.CANCEL: {
			infoToast(`${t("toasts.downloadCanceled")}"${thisDownload.title}"!`);

			cancelDownloadAndOrRemoveItFromList(url);
			break;
		}

		case ProgressStatusEnum.WAITING_FOR_CONFIRMATION_FROM_ELECTRON:
		case ProgressStatusEnum.ACTIVE:
		case undefined:
			break;

		default:
			assertUnreachable(data.status);
	}
}

/////////////////////////////////////////////
/////////////////////////////////////////////

export function cancelDownloadAndOrRemoveItFromList(url: string): void {
	const downloadingList = getDownloadingList();

	// Assert that the download exists:
	const download = downloadingList.get(url);

	if (!download) {
		error(`"${url}" not found! downloadList =`, downloadingListRef);

		return;
	}

	// Cancel download:
	if (download.status === ProgressStatusEnum.ACTIVE)
		download.port.postMessage({ destroy: true, url });

	// Update downloading list:
	const newDownloadingList = new Map(downloadingList);
	newDownloadingList.delete(url);

	setDownloadingList(newDownloadingList);
}

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Types:

interface PartialExceptStatus extends Partial<MediaBeingDownloaded> {
	status: ValuesOf<typeof ProgressStatusEnum>;
}
