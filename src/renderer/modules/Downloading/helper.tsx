import type { MediaBeingDownloaded } from ".";
import type { DownloadInfo } from "@common/@types/generalTypes";

import { AiOutlineClose as Cancel } from "react-icons/ai";

import { getConvertingList, setConvertingList } from "@contexts/convertList";
import { errorToast, infoToast, successToast } from "@styles/global";
import { assertUnreachable } from "@utils/utils";
import { ProgressStatus } from "@common/enums";
import { handleOnClose } from "@modules/Converting/helper";
import { TooltipButton } from "@components/TooltipButton";
import { Progress } from "@components/Progress";
import { dbg } from "@common/utils";
import {
	useDownloadingList,
	setDownloadingList,
	getDownloadingList,
} from "@contexts/downloadList";

import { ItemWrapper, TitleAndCancelWrapper } from "./styles";

export function Popup() {
	const { downloadingList } = useDownloadingList();

	return (
		<>
			{downloadingList.size > 0 ? (
				[...downloadingList].map(([url, download], downloadingIndex) => (
					<ItemWrapper key={url}>
						<TitleAndCancelWrapper>
							<p>{download.title}</p>

							<TooltipButton
								onClick={e =>
									handleDeleteAnimation(e, downloadingIndex, true, url)
								}
								tooltip="Cancel/Remove download"
								className="cancel-button"
								tooltip-side="left"
							>
								<Cancel size={12} className="notransition" />
							</TooltipButton>
						</TitleAndCancelWrapper>

						<Progress
							percent_0_to_100={download.percentage}
							status={download.status}
							showStatus
						/>
					</ItemWrapper>
				))
			) : (
				<p>No downloads in progress!</p>
			)}
		</>
	);
}

/**
 * This function returns a MessagePort that will be send to
 * Electron to enable 2 way communication between it
 * and React.
 */
export function createNewDownload(downloadInfo: DownloadInfo): MessagePort {
	const { downloadingList } = getDownloadingList();

	dbg("Trying to create a new download...", {
		downloadingList,
	});

	// First, see if there is another one that has the same url
	// and quit if true:
	if (downloadingList.has(downloadInfo.url)) {
		const info = `There is already one download of "${downloadInfo.title}"`;

		infoToast(info);

		console.error(info, downloadingList);
		throw new Error(info);
	}

	// Since this a brand new download, let's create a new one.
	// MessageChannels are lightweight, it's cheap to create
	// a new one for each DownloadingMedia to communicate the
	// download progress between React and Electron:
	const { port1: myPort, port2: electronPort } = new MessageChannel();

	// Creating a new DownloadingMedia and adding it to the list:
	setDownloadingList({
		downloadingList: downloadingList.set(downloadInfo.url, {
			status: ProgressStatus.WAITING_FOR_CONFIRMATION_FROM_ELECTRON,
			imageURL: downloadInfo.imageURL,
			title: downloadInfo.title,
			isDownloading: true,
			percentage: 0,
			port: myPort,
		}),
	});

	dbg(
		"Added download to the list:",
		getDownloadingList().downloadingList.get(downloadInfo.url),
	);

	// Send msg to electronPort to download:
	myPort.postMessage(downloadInfo);

	// Adding event listeners to React's MessagePort to receive and
	// handle download progress info:
	myPort.onmessage = ({ data }: { data: Partial<MediaBeingDownloaded> }) => {
		const { downloadingList } = getDownloadingList();

		dbg(
			`Received a message from Electron on port for "${downloadInfo.title}":`,
			{ data, downloadingList },
		);

		// Assert that the download exists:
		const thisDownload = downloadingList.get(downloadInfo.url);
		if (!thisDownload)
			return console.error(
				"Received a message from Electron but the url is not in the list!",
			);

		dbg("downloadStatus:", downloadingList.get(downloadInfo.url));

		// Update React's information about this DownloadingMedia:
		setDownloadingList({
			downloadingList: downloadingList.set(downloadInfo.url, {
				...thisDownload,
				...data,
			}),
		});

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

			default:
				assertUnreachable(data.status);
				break;
		}
	};

	myPort.addEventListener("close", handleOnClose);

	myPort.start();

	return electronPort;
}

const cancelDownloadAndOrRemoveItFromList = (url: string) => {
	const { downloadingList } = getDownloadingList();

	{
		// Assert that the download exists:
		const download = downloadingList.get(url);

		if (!download)
			return console.error(
				`There should be a download with url "${url}" to be canceled!\ndownloadList =`,
				downloadingList,
			);

		// Cancel download:
		if (download.isDownloading)
			download.port.postMessage({ destroy: true, url });

		// Update downloading list:
		downloadingList.delete(url);
	}

	// Make React update:
	setDownloadingList({ downloadingList });
};

export const cancelConvertionAndOrRemoveItFromList = (path: string) => {
	const { convertingList } = getConvertingList();

	{
		const mediaBeingConverted = convertingList.get(path);

		if (!mediaBeingConverted)
			return console.error(
				`There should be a convertion with path "${path}"!\nconvertList =`,
				convertingList,
			);

		// Cancel conversion
		if (mediaBeingConverted.isConverting)
			mediaBeingConverted.port.postMessage({
				destroy: true,
				path,
			});

		// Remove from converting list
		convertingList.delete(path);
	}

	// Make React update:
	setConvertingList({ convertingList });
};

export function handleDeleteAnimation(
	e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
	downloadingOrConvertionIndex: number,
	isDownloadList: boolean,
	key: string,
) {
	const className = `.${ItemWrapper.className}`;
	const items = document.querySelectorAll(
		className,
	) as NodeListOf<HTMLDivElement>;

	for (const [itemIndex, item] of items.entries()) {
		if (itemIndex <= downloadingOrConvertionIndex) continue;

		item.classList.add("move-up");
	}

	const thisItem = (e.target as HTMLElement).closest(
		className,
	) as HTMLDivElement;
	thisItem.classList.add("delete");
	thisItem.addEventListener("animationend", () => {
		if (isDownloadList) cancelDownloadAndOrRemoveItFromList(key);
		else cancelConvertionAndOrRemoveItFromList(key);

		items.forEach(item => item.classList.remove("move-up"));
	});
}
