import type { MediaBeingDownloaded } from ".";
import type { DownloadInfo } from "@common/@types/generalTypes";

import { AiOutlineClose as Cancel } from "react-icons/ai";

import { getConvertingList, setConvertingList } from "@contexts/convertList";
import { errorToast, infoToast, successToast } from "@styles/global";
import { assertUnreachable } from "@utils/utils";
import { ProgressStatus } from "@common/enums";
import { handleOnClose } from "@components/Converting/helper";
import { Progress } from "@components/Progress";
import { Button } from "@components/Button";
import { dbg } from "@common/utils";
import {
	useDownloadingList,
	setDownloadingList,
	getDownloadingList,
} from "@contexts/downloadList";

import { TitleAndCancelWrapper, ItemWrapper } from "./styles";
import { CancelButton } from "@components/Converting/styles";

export function Popup() {
	const { downloadingList } = useDownloadingList();

	function downloadingBoxes() {
		const list = [];

		let downloadingIndex = 0;
		for (const [url, download] of downloadingList) {
			list.push(
				<DownloadingBox
					downloadingIndex={downloadingIndex}
					download={download}
					url={url}
					key={url}
				/>,
			);
			++downloadingIndex;
		}

		return list;
	}

	return (
		<>
			{downloadingList.size > 0 ?
				(
					<>
						<Button variant="medium" onClick={cleanAllDoneDownloads}>
							Clean finished
						</Button>

						{downloadingBoxes()}
					</>
				) :
				<p>No downloads in progress!</p>}
		</>
	);
}

function DownloadingBox(
	{ downloadingIndex, download, url }: DownloadingBoxProps,
) {
	return (
		<ItemWrapper key={url}>
			<TitleAndCancelWrapper>
				<p>{download.title}</p>

				<CancelButton
					onClick={e =>
						handleSingleItemDeleteAnimation(e, downloadingIndex, true, url)}
					className="cancel-button notransition"
					data-tip="Cancel/Remove download"
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
}

function cleanAllDoneDownloads(): void {
	getDownloadingList().downloadingList.forEach((download, url) => {
		if (
			download.status !==
				ProgressStatus.WAITING_FOR_CONFIRMATION_FROM_ELECTRON &&
			download.status !== ProgressStatus.ACTIVE
		)
			cancelDownloadAndOrRemoveItFromList(url);
	});
}

/**
 * This function returns a MessagePort that will be send to
 * Electron to enable 2 way communication between it
 * and React.
 */
export function createNewDownload(
	downloadInfo: Readonly<DownloadInfo>,
): Readonly<MessagePort> {
	const { downloadingList } = getDownloadingList();

	dbg("Trying to create a new download...", { downloadingList });

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
		downloadingList: new Map(downloadingList).set(downloadInfo.url, {
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
	myPort.onmessage = (
		{ data }: { data: Readonly<Partial<MediaBeingDownloaded>>; },
	): void => {
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
			downloadingList: new Map(downloadingList).set(downloadInfo.url, {
				...thisDownload,
				...data,
			}),
		});

		// Handle ProgressStatus's cases:
		switch (data.status) {
			case ProgressStatus.FAILED: {
				// @ts-ignore In this case, `data` include an `error: Error` key.
				console.assert(data.error, "data.error should exist!");
				console.error((data as typeof data & { error: Error; }).error);

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

function cancelDownloadAndOrRemoveItFromList(url: Readonly<string>): void {
	const { downloadingList } = getDownloadingList();

	// Assert that the download exists:
	const download = downloadingList.get(url);

	if (!download)
		return console.error(
			`There should be a download with url "${url}" to be canceled!\ndownloadList =`,
			downloadingList,
		);

	// Cancel download:
	if (download.isDownloading) download.port.postMessage({ destroy: true, url });

	// Update downloading list:
	const newDownloadingList = new Map(downloadingList);
	newDownloadingList.delete(url);

	// Make React update:
	setDownloadingList({ downloadingList: newDownloadingList });
}

export function cancelConvertionAndOrRemoveItFromList(
	path: Readonly<string>,
): void {
	const { convertingList } = getConvertingList();

	const mediaBeingConverted = convertingList.get(path);

	if (!mediaBeingConverted)
		return console.error(
			`There should be a convertion with path "${path}"!\nconvertList =`,
			convertingList,
		);

	// Cancel conversion
	if (mediaBeingConverted.isConverting)
		mediaBeingConverted.port.postMessage({ destroy: true, path });

	// Remove from converting list
	const newConvertingList = new Map(convertingList);
	newConvertingList.delete(path);

	// Make React update:
	setConvertingList({ convertingList: newConvertingList });
}

const className = `.${ItemWrapper.className}`;
export function handleSingleItemDeleteAnimation(
	e: Readonly<React.MouseEvent<HTMLButtonElement, MouseEvent>>,
	downloadingOrConvertionIndex: Readonly<number>,
	isDownloadList: Readonly<boolean>,
	url: Readonly<string>,
): void {
	const items = document.querySelectorAll(className) as NodeListOf<
		HTMLDivElement
	>;

	//////////////////////////////////////////

	// Only add the animation to the ones below the one that was clicked:
	for (const [index, item] of items.entries()) {
		if (index <= downloadingOrConvertionIndex) continue;

		item.classList.add("move-up");
		item.addEventListener(
			"animationend",
			() => item.classList.remove("move-up"),
			{ once: true },
		);
	}

	//////////////////////////////////////////

	const itemClicked = (e.target as HTMLElement).closest(
		className,
	) as HTMLDivElement;

	itemClicked.classList.add("delete");

	// Add event listener to the itemClicked to remove the animation:
	itemClicked.addEventListener("animationend", () => {
		isDownloadList ?
			cancelDownloadAndOrRemoveItFromList(url) :
			cancelConvertionAndOrRemoveItFromList(url);
	});
	itemClicked.addEventListener("animationcancel", () => {
		// This is so users can just click the cancel
		// button and imediately leave the popup, wich
		// cancels the animation!

		isDownloadList ?
			cancelDownloadAndOrRemoveItFromList(url) :
			cancelConvertionAndOrRemoveItFromList(url);
	});
}

type DownloadingBoxProps = {
	download: MediaBeingDownloaded;
	downloadingIndex: number;
	url: string;
};
