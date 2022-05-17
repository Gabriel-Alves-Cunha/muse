import { type MediaBeingDownloaded } from ".";

import { AiOutlineClose as Cancel } from "react-icons/ai";

import { useDownloadingList, downloadingList } from "@contexts";
import { errorToast, infoToast, successToast } from "@styles/global";
import { assertUnreachable } from "@utils/utils";
import { Progress, Tooltip } from "@components";
import { handleOnClose } from "@modules/Converting/helper";
import { dbg } from "@common/utils";
import {
	type DownloadInfo,
	ProgressStatus,
} from "@common/@types/typesAndEnums";

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

	// Creating a new DownloadingMedia:
	const downloadStatus: MediaBeingDownloaded = {
		imageURL: downloadInfo.imageURL,
		status: ProgressStatus.WAITING,
		title: downloadInfo.title,
		isDownloading: true,
		percentage: 0,
		port: myPort,
	};

	// Add it to the list:
	downloadingList_.set(downloadInfo.url, downloadStatus);

	dbg("Added download to the list", { downloadingList: downloadingList() });

	// Send msg to electronPort to download:
	myPort.postMessage(downloadInfo);

	// Adding event listeners to React's MessagePort to receive and
	// handle download progress info:
	myPort.onmessage = ({ data }: { data: Partial<MediaBeingDownloaded> }) => {
		dbg(
			`Received a message from Electron on port for "${downloadInfo.title}":`,
			data
		);

		const downloadingList_ = downloadingList();

		dbg({ downloadingList });

		// Assert that the download exists:
		if (!downloadingList_.has(downloadInfo.url))
			return console.error(
				"Received a message from Electron but the url is not in the list!"
			);

		// Update React's information about this DownloadingMedia:
		downloadingList_.set(downloadInfo.url, { ...downloadStatus, ...data });

		// Handle ProgressStatus's cases:
		switch (data.status) {
			case ProgressStatus.FAIL: {
				// @ts-ignore In this case, `data` include an `error: Error` key.
				console.assert(data.error, "data.error should exist!");
				console.error((data as typeof data & { error: Error }).error);

				errorToast(`Download of "${downloadStatus.title}" failed!`);

				cancelDownloadAndOrRemoveItFromList(downloadInfo.url);
				break;
			}

			case ProgressStatus.SUCCESS: {
				successToast(`Download of "${downloadStatus.title}" succeded!`);

				cancelDownloadAndOrRemoveItFromList(downloadInfo.url);
				break;
			}

			case ProgressStatus.CANCEL: {
				infoToast(`Download of "${downloadStatus.title}" was cancelled!`);

				cancelDownloadAndOrRemoveItFromList(downloadInfo.url);
				break;
			}

			case ProgressStatus.ACTIVE:
				break;

			case undefined:
				break;

			case ProgressStatus.CONVERT:
				break;

			case ProgressStatus.WAITING:
				break;

			default: {
				assertUnreachable(data.status);
				break;
			}
		}
	};

	// @ts-ignore: this fn DOES exists
	myPort.onclose = handleOnClose;

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
			downloadingList_
		);

	// Cancel download:
	if (download.isDownloading) download.port.postMessage({ destroy: true, url });

	// Update downloading list:
	downloadingList_.delete(url);
};
