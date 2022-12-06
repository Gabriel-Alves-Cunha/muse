import type { MediaBeingDownloaded } from ".";
import type { DownloadInfo } from "@common/@types/generalTypes";
import type { ValuesOf } from "@common/@types/utils";

import { Component, Index, Show } from "solid-js";
import { useI18n } from "@solid-primitives/i18n";

import { getDownloadingList, setDownloadingList } from "@contexts/downloadList";
import { errorToast, infoToast, successToast } from "@components/toasts";
import { Progress, progressIcons } from "@components/Progress";
import { CloseIcon as CancelIcon } from "@icons/CloseIcon";
import { logThatPortIsClosing } from "@components/Converting/helper";
import { assertUnreachable } from "@utils/utils";
import { progressStatus } from "@common/enums";
import { error, assert } from "@utils/log";
import { Button } from "@components/Button";
import { dbg } from "@common/debug";

import { handleSingleItemDeleteAnimation } from "./styles";

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////

export const Popup: Component = () => {
	const downloadingList = getDownloadingList();
	const [t] = useI18n();

	return (
		<Show
			fallback={<p>{t("infos.noDownloadsInProgress")}</p>}
			when={downloadingList.size > 0}
		>
			<Button variant="medium" onPointerUp={cleanAllDoneDownloads}>
				{t("buttons.cleanFinished")}
			</Button>

			<Index each={[...downloadingList]}>
				{(downloading, index) => (
					<DownloadingBox
						download={downloading()[1]}
						downloadingIndex={index}
						url={downloading()[0]}
					/>
				)}
			</Index>
		</Show>
	);
};

/////////////////////////////////////////////
// Helper functions for Popup:

function cleanAllDoneDownloads(): void {
	for (const [url, download] of getDownloadingList())
		if (
			download.status !==
				progressStatus.WAITING_FOR_CONFIRMATION_FROM_ELECTRON &&
			download.status !== progressStatus.ACTIVE
		)
			cancelDownloadAndOrRemoveItFromList(url);
}

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////

export const isDownloadList = true;

const DownloadingBox: Component<DownloadingBoxProps> = (props) => {
	const [t] = useI18n();

	return (
		<div class="box">
			<div class="left">
				<p>{props.download.title}</p>

				<Progress
					percent_0_to_100={props.download.percentage}
					status={props.download.status}
				/>
			</div>

			<div class="right">
				<button
					onPointerUp={(e) =>
						handleSingleItemDeleteAnimation(
							e,
							props.downloadingIndex,
							isDownloadList,
							props.url,
						)
					}
					title={t("tooltips.cancelDownload")}
					type="button"
				>
					<CancelIcon class="w-3 h-3" />
				</button>

				{progressIcons.get(props.download.status)}
			</div>
		</div>
	);
};

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////

/**
 * This function returns a MessagePort that will be send to
 * Electron to enable 2 way communication between it
 * and React.
 */
export function createNewDownload(downloadInfo: DownloadInfo): MessagePort {
	const downloadingList = getDownloadingList();
	const [t] = useI18n();

	dbg("Trying to create a new download...", { downloadingList });

	const { imageURL, title, url } = downloadInfo;

	// First, see if there is another one that has the same url
	// and quit if true:
	if (downloadingList.has(url)) {
		const info = `${t("toasts.downloadAlreadyExists")}"${title}"`;

		infoToast(info);

		error(info, downloadingList);
		throw new Error(info);
	}

	// Since this a brand new download, let's create a new one.
	// MessageChannels are lightweight, it's cheap to create
	// a new one for each DownloadingMedia to communicate the
	// download progress between React and Electron:
	const { port1: frontEndPort, port2: backEndPort } = new MessageChannel();

	// Creating a new DownloadingMedia and adding it to the list:
	setDownloadingList(
		new Map(downloadingList).set(url, {
			status: progressStatus.WAITING_FOR_CONFIRMATION_FROM_ELECTRON,
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

	return backEndPort;
}

/////////////////////////////////////////////
/////////////////////////////////////////////
// Helper functions for `createNewDownload()`

function handleUpdateDownloadingList(
	{ data }: MessageEvent<PartialExceptStatus>,
	url: string,
): void {
	const downloadingList = getDownloadingList();
	const [t] = useI18n();

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
	setDownloadingList(downloadingList.set(url, { ...thisDownload, ...data }));

	// Handle status:
	switch (data.status) {
		case progressStatus.FAILED: {
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

		case progressStatus.SUCCESS: {
			successToast(`${t("toasts.downloadSuccess")}"${thisDownload.title}"!`);

			cancelDownloadAndOrRemoveItFromList(url);
			break;
		}

		case progressStatus.CANCEL: {
			infoToast(`${t("toasts.downloadCanceled")}"${thisDownload.title}"!`);

			cancelDownloadAndOrRemoveItFromList(url);
			break;
		}

		case progressStatus.WAITING_FOR_CONFIRMATION_FROM_ELECTRON:
		case progressStatus.ACTIVE:
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

	if (!download)
		return error(
			`There should be a download with url "${url}" to be canceled!\ndownloadList =`,
			downloadingList,
		);

	// Cancel download:
	if (download.status === progressStatus.ACTIVE)
		download.port.postMessage({ destroy: true, url });

	// Update downloading list:
	const newDownloadingList = new Map(downloadingList);
	newDownloadingList.delete(url);

	// Update:
	setDownloadingList(newDownloadingList);
}

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Types:

type DownloadingBoxProps = {
	download: MediaBeingDownloaded;
	downloadingIndex: number;
	url: string;
};

/////////////////////////////////////////////

interface PartialExceptStatus extends Partial<MediaBeingDownloaded> {
	status: ValuesOf<typeof progressStatus>;
}
