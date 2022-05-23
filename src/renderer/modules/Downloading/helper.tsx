import type { MediaBeingDownloaded } from ".";
import type { DownloadInfo } from "@common/@types/generalTypes";

import { AiOutlineClose as Cancel } from "react-icons/ai";

import { errorToast, infoToast, successToast } from "@styles/global";
import { assertUnreachable } from "@utils/utils";
import { ProgressStatus } from "@common/enums";
import { handleOnClose } from "@modules/Converting/helper";
import { Progress } from "@components/Progress";
import { Tooltip } from "@components/Tooltip";
import { dbg } from "@common/utils";
import {
	useDownloadingList,
	setDownloadingList,
	downloadingList,
} from "@contexts/downloadList";

import { Content, TitleAndCancelWrapper } from "./styles";

export const Popup = () => {
	const downloadingList = useDownloadingList();

	return (
		<>
			{downloadingList.size > 0 ? (
				Array.from(downloadingList.entries()).map(([url, download]) => (
					<Content key={url}>
						<TitleAndCancelWrapper>
							<p>{download.title}</p>

							<Tooltip text="Cancel/Remove download" side="right">
								<button
									onClick={() => cancelDownloadAndOrRemoveItFromList(url)}
								>
									<Cancel size={12} />
								</button>
							</Tooltip>
						</TitleAndCancelWrapper>

						<Progress
							percent_0_to_100={download.percentage}
							status={download.status}
							showStatus
						/>
					</Content>
				))
			) : (
				<p>No downloads in progress!</p>
			)}
		</>
	);
};

/**
 * This function returns a MessagePort that will be send to
 * Electron to enable 2 way communication between it
 * and React.
 */
export function createNewDownload(downloadInfo: DownloadInfo): MessagePort {
	const downloadingList_ = downloadingList();

	dbg("Trying to create a new download...", { downloadingList_ });

	// First, see if there is another one that has the same url
	// and quit if true:
	if (downloadingList_.has(downloadInfo.url)) {
		const info = `There is already one download of "${downloadInfo.title}"`;

		infoToast(info);

		console.error(info, downloadingList_);
		throw new Error(info);
	}

	// Since this a brand new download, let's create a new one.
	// MessageChannels are lightweight, it's cheap to create
	// a new one for each DownloadingMedia to communicate the
	// download progress between React and Electron:
	const { port1: myPort, port2: electronPort } = new MessageChannel();

	// Creating a new DownloadingMedia and adding it to the list:
	setDownloadingList(
		downloadingList_.set(downloadInfo.url, {
			status: ProgressStatus.WAITING_FOR_CONFIRMATION_FROM_ELECTRON,
			imageURL: downloadInfo.imageURL,
			title: downloadInfo.title,
			isDownloading: true,
			percentage: 0,
			port: myPort,
		}),
	);

	dbg("Added download to the list", { downloadingList: downloadingList() });

	// Send msg to electronPort to download:
	myPort.postMessage(downloadInfo);

	// Adding event listeners to React's MessagePort to receive and
	// handle download progress info:
	myPort.onmessage = ({ data }: { data: Partial<MediaBeingDownloaded> }) => {
		const downloadingList_ = downloadingList();

		dbg(
			`Received a message from Electron on port for "${downloadInfo.title}":`,
			{ data, downloadingList_ },
		);

		// Assert that the download exists:
		if (!downloadingList_.has(downloadInfo.url))
			return console.error(
				"Received a message from Electron but the url is not in the list!",
			);

		dbg("downloadStatus:", downloadingList_.get(downloadInfo.url));

		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		const thisDownload = downloadingList_.get(downloadInfo.url)!;

		// Update React's information about this DownloadingMedia:
		setDownloadingList(
			downloadingList_.set(downloadInfo.url, { ...thisDownload, ...data }),
		);

		// Handle ProgressStatus's cases:
		switch (data.status) {
			case ProgressStatus.FAILED: {
				// @ts-ignore In this case, `data` include an `error: Error` key.
				console.assert(data.error, "data.error should exist!");
				console.error((data as typeof data & { error: Error }).error);

				errorToast(`Download of "${thisDownload.title}" failed!`);

				cancelDownloadAndOrRemoveItFromList(downloadInfo.url);
				break;
			}

			case ProgressStatus.SUCCESS: {
				successToast(`Download of "${thisDownload.title}" succeded!`);

				cancelDownloadAndOrRemoveItFromList(downloadInfo.url);
				break;
			}

			case ProgressStatus.CANCEL: {
				infoToast(`Download of "${thisDownload.title}" was cancelled!`);

				cancelDownloadAndOrRemoveItFromList(downloadInfo.url);
				break;
			}

			case ProgressStatus.ACTIVE:
				break;

			case undefined:
				break;

			case ProgressStatus.WAITING_FOR_CONFIRMATION_FROM_ELECTRON:
				break;

			default: {
				assertUnreachable(data.status);
				break;
			}
		}
	};

	myPort.addEventListener("close", handleOnClose);
	// myPort.onclose = handleOnClose;

	myPort.start();

	return electronPort;
}

const cancelDownloadAndOrRemoveItFromList = (url: string) => {
	const downloadingList_ = downloadingList();

	dbg("Trying to cancel download...", { downloadingList_ });

	// Assert that the download exists:
	const download = downloadingList_.get(url);

	if (download === undefined)
		return console.error(
			`There should be a download with url "${url}" to be canceled!\ndownloadList =`,
			downloadingList_,
		);

	// Cancel download:
	if (download.isDownloading) download.port.postMessage({ destroy: true, url });

	// Update downloading list:
	downloadingList_.delete(url);
	setDownloadingList(downloadingList_);
};
