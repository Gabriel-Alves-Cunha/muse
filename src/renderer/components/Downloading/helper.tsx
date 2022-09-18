import type { MediaBeingDownloaded } from ".";
import type { DownloadInfo } from "@common/@types/generalTypes";
import type { Values } from "@common/@types/utils";

import { AiOutlineClose as Cancel } from "react-icons/ai";

import { errorToast, infoToast, successToast } from "@styles/global";
import { logThatPortIsClosing } from "@components/Converting/helper";
import { assertUnreachable } from "@utils/utils";
import { ProgressStatus } from "@common/enums";
import { t, Translator } from "@components/I18n";
import { Progress } from "@components/Progress";
import { Button } from "@components/Button";
import { dbg } from "@common/debug";
import {
	useDownloadingList,
	setDownloadingList,
	getDownloadingList,
} from "@contexts/downloadList";

import { CancelButton } from "@components/Converting/styles";
import {
	handleSingleItemDeleteAnimation,
	TitleAndCancelWrapper,
	ItemWrapper,
} from "./styles";

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////

export function Popup() {
	const { downloadingList } = useDownloadingList();

	return (downloadingList.size > 0 ?
		(
			<>
				<Button variant="medium" onPointerUp={cleanAllDoneDownloads}>
					<Translator path="buttons.cleanFinished" />
				</Button>

				{Array.from(
					downloadingList,
					([url, downloadingMedia], index) => (
						<DownloadingBox
							download={downloadingMedia}
							downloadingIndex={index}
							url={url}
							key={url}
						/>
					),
				)}
			</>
		) :
		(
			<p>
				<Translator path="infos.noDownloadsInProgress" />
			</p>
		));
}

/////////////////////////////////////////////
// Helper functions for Popup:

function cleanAllDoneDownloads(): void {
	getDownloadingList().forEach((download, url) => {
		if (
			download.status !==
				ProgressStatus.WAITING_FOR_CONFIRMATION_FROM_ELECTRON &&
			download.status !== ProgressStatus.ACTIVE
		)
			cancelDownloadAndOrRemoveItFromList(url);
	});
}

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////

export const isDownloadList = true;

const DownloadingBox = (
	{ downloadingIndex, download, url }: DownloadingBoxProps,
) => (
	<ItemWrapper key={url}>
		<TitleAndCancelWrapper>
			<p>{download.title}</p>

			<CancelButton
				onPointerUp={e =>
					handleSingleItemDeleteAnimation(
						e,
						downloadingIndex,
						isDownloadList,
						url,
					)}
				aria-label={t("tooltips.cancelDownload")}
				className="cancel-button notransition"
				title={t("tooltips.cancelDownload")}
			>
				<Cancel size={12} />
			</CancelButton>
		</TitleAndCancelWrapper>

		<Progress
			percent_0_to_100={download.percentage}
			status={download.status}
			showStatus
		/>
	</ItemWrapper>
);

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////

/**
 * This function returns a MessagePort that will be send to
 * Electron to enable 2 way communication between it
 * and React.
 */
export function createNewDownload(
	downloadInfo: DownloadInfo,
): Readonly<MessagePort> {
	const downloadingList = getDownloadingList();

	dbg("Trying to create a new download...", { downloadingList });

	const { imageURL, title, url } = downloadInfo;

	// First, see if there is another one that has the same url
	// and quit if true:
	if (downloadingList.has(url)) {
		const info = `${t("toasts.downloadAlreadyExists")}"${title}"`;

		infoToast(info);

		console.error(info, downloadingList);
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
			status: ProgressStatus.WAITING_FOR_CONFIRMATION_FROM_ELECTRON,
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
	url: Readonly<string>,
): void {
	const downloadingList = getDownloadingList();

	dbg(`Received a message from Electron on port for "${url}":`, {
		downloadingList,
		data,
	});

	// Assert that the download exists:
	const thisDownload = downloadingList.get(url);
	if (thisDownload === undefined)
		return console.error(
			"Received a message from Electron but the url is not in the list!",
		);

	// Update React's information about this DownloadingMedia:
	setDownloadingList(
		new Map(downloadingList).set(url, { ...thisDownload, ...data }),
	);

	// Handle status:
	switch (data.status) {
		case ProgressStatus.FAILED: {
			// @ts-ignore => ^ In this case, `data` include an `error: Error` key:
			console.assert(data.error, "data.error should exist!");

			errorToast(
				`${t("toasts.downloadError.beforePath")}"${thisDownload.title}"${
					t("toasts.downloadError.afterPath")
				} ${(data as typeof data & { error: Error; }).error.message}`,
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

		case ProgressStatus.ACTIVE:
			break;

		case undefined:
			break;

		case ProgressStatus.WAITING_FOR_CONFIRMATION_FROM_ELECTRON:
			break;

		default:
			assertUnreachable(data.status);
	}
}

/////////////////////////////////////////////
/////////////////////////////////////////////

export function cancelDownloadAndOrRemoveItFromList(
	url: Readonly<string>,
): void {
	const downloadingList = getDownloadingList();

	// Assert that the download exists:
	const download = downloadingList.get(url);

	if (download === undefined)
		return console.error(
			`There should be a download with url "${url}" to be canceled!\ndownloadList =`,
			downloadingList,
		);

	// Cancel download:
	if (download.status === ProgressStatus.ACTIVE)
		download.port.postMessage({ destroy: true, url });

	// Update downloading list:
	const newDownloadingList = new Map(downloadingList);
	newDownloadingList.delete(url);

	// Make React update:
	setDownloadingList(newDownloadingList);
}

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Types:

type DownloadingBoxProps = Readonly<
	{ download: MediaBeingDownloaded; downloadingIndex: number; url: string; }
>;

/////////////////////////////////////////////

interface PartialExceptStatus extends Partial<MediaBeingDownloaded> {
	status: Values<typeof ProgressStatus>;
}
