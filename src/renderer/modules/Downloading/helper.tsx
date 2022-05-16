import { type MediaBeingDownloaded } from ".";

import { AiOutlineClose as Cancel } from "react-icons/ai";

import { getDownloadingList, setDownloadingList } from "@contexts";
import { errorToast, infoToast, successToast } from "@styles/global";
import { assertUnreachable } from "@utils/utils";
import { Progress, Tooltip } from "@components";
import { remove, replace } from "@utils/array";
import { handleOnClose } from "@modules/Converting/helper";
import { dbg } from "@common/utils";
import {
	type DownloadInfo,
	ProgressStatus,
} from "@common/@types/typesAndEnums";

import { Content, TitleAndCancelWrapper } from "./styles";

export const Popup = ({ downloadingList }: PopupProps) => (
	<>
		{downloadingList.length > 0 ? (
			downloadingList.map(download => (
				<Content key={download.url}>
					<TitleAndCancelWrapper>
						<p>{download.title}</p>

						<Tooltip text="Cancel download" side="right">
							<button
								onClick={() =>
									cancelDownloadAndOrRemoveItFromList(download.url)
								}
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

/**
 * This function returns a MessagePort that will be send to
 * Electron to enable 2 way communication between it
 * and React.
 */
export function createNewDownload(downloadInfo: DownloadInfo): MessagePort {
	dbg("Trying to create a new download...");

	const downloadingList = getDownloadingList();

	dbg({ downloadingList });

	{
		// First, see if there is another one that has the same url
		// and quit if true:
		const indexIfThereIsOneAlready = downloadingList.findIndex(
			d => d.url === downloadInfo.url
		);
		const doesMediaAlreadyExist = indexIfThereIsOneAlready !== -1;

		if (doesMediaAlreadyExist) {
			const info = `There is already one download of "${downloadInfo.title}"`;

			infoToast(info);

			console.error(info, downloadingList);
			throw new Error(info);
		}
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
		url: downloadInfo.url,
		isDownloading: true,
		percentage: 0,
		port: myPort,
	};

	// Add it to the list:
	setDownloadingList([...downloadingList, downloadStatus]);

	// Send msg to electronPort to download:
	myPort.postMessage(downloadInfo);

	// Adding event listeners to React's MessagePort to receive and
	// handle download progress info:
	myPort.onmessage = ({ data }: { data: Partial<MediaBeingDownloaded> }) => {
		dbg(
			`Received a message from Electron on port for "${downloadInfo.title}":`,
			data
		);

		const downloadingList = getDownloadingList();

		dbg({ downloadingList });

		// Assert that the download exists:
		const index = downloadingList.findIndex(d => d.url === downloadInfo.url);

		if (index === -1)
			return console.error(
				"Received a message from Electron but the url is not in the list!"
			);

		// Update React's information about this DownloadingMedia:
		setDownloadingList(
			replace(downloadingList, index, {
				...downloadStatus,
				...data,
			})
		);

		// Handle ProgressStatus's cases:
		switch (data.status) {
			case ProgressStatus.FAIL: {
				// @ts-ignore In this case, `data` include an `error: Error` key.
				console.assert(data.error, "data.error should exist!");
				console.error((data as typeof data & { error: Error }).error);

				errorToast(`Download of "${downloadStatus.title}" failed!`);

				cancelDownloadAndOrRemoveItFromList(downloadStatus.title);
				break;
			}

			case ProgressStatus.SUCCESS: {
				successToast(`Download of "${downloadStatus.title}" succeded!`);

				cancelDownloadAndOrRemoveItFromList(downloadStatus.title);
				break;
			}

			case ProgressStatus.CANCEL: {
				infoToast(`Download of "${downloadStatus.title}" was cancelled!`);

				cancelDownloadAndOrRemoveItFromList(downloadStatus.title);
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
	const downloadingList = getDownloadingList();

	// Find the DownloadingMedia:
	const index = downloadingList.findIndex(d => d.url === url);

	if (index === -1)
		return console.error(
			`There should be a download with url "${url}"!\ndownloadList =`,
			downloadingList
		);

	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	const download = downloadingList[index]!;

	// Cancel download:
	if (download.isDownloading)
		download.port.postMessage({ destroy: true, url: download.url });

	// Update downloading list:
	setDownloadingList(remove(downloadingList, index));
};

type PopupProps = Readonly<{
	downloadingList: readonly MediaBeingDownloaded[];
}>;
