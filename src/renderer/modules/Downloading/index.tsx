import { MdDownloading as DownloadingIcon } from "react-icons/md";
import { useEffect, useRef, useState } from "react";
import { FcCancel as Cancel } from "react-icons/fc";
import { toast } from "react-toastify";
import create from "zustand";

import { DownloadValues, ProgressStatus } from "@common/@types/typesAndEnums";
import { assertUnreachable } from "@utils/utils";
import { useOnClickOutside } from "@hooks";
import { remove, replace } from "@utils/array";
import { Progress } from "@components/Progress";

import { Title, Trigger, Popup, Wrapper } from "./styles";

// const { port1: testPort } = new MessageChannel();
// const testDownloadingMedia: DownloadingMedia = Object.freeze({
// 	status: ProgressStatus.ACTIVE,
// 	url: "http://test.com",
// 	isDownloading: true,
// 	percentage: 50,
// 	port: testPort,
// 	title: "test",
// 	imageURL: "",
// 	index: 0,
// } as const);

const defaultDownloadValues: DownloadValues = Object.freeze({
	canStartDownload: false,
	imageURL: "",
	title: "",
	url: "",
} as const);

const useDownloadingList = create<{
	downloadingList: readonly DownloadingMedia[];
}>(() => ({
	downloadingList: [], // [testDownloadingMedia],
}));

export const useDownloadValues = create<{
	downloadValues: DownloadValues;
}>(() => ({
	downloadValues: defaultDownloadValues,
}));

const { setState: setDownloadingList, getState: getDownloadingList } =
	useDownloadingList;
const { setState: setDownloadValues } = useDownloadValues;

export function Downloading() {
	const [showPopup, setShowPopup] = useState(false);
	const { downloadingList } = useDownloadingList();
	const { downloadValues } = useDownloadValues();
	const popupRef = useRef<HTMLDivElement>(null);

	useOnClickOutside(popupRef, () => setShowPopup(false));

	useEffect(() => {
		// For each new DownloadingValues, start a new download:
		if (downloadValues.canStartDownload) {
			try {
				const electronPort = createNewDownload(downloadValues);

				// We have to reset downloadValues so that
				// it is ready for a new media download:
				setDownloadValues({ downloadValues: defaultDownloadValues });

				// Sending port so we can communicate with Electron:
				window.postMessage("download media", "*", [electronPort]);
			} catch (error) {
				toast.error(
					`There was an error trying to download "${downloadValues.title}"! Please, try again later.`,
					{
						hideProgressBar: false,
						position: "top-right",
						progress: undefined,
						closeOnClick: true,
						pauseOnHover: true,
						autoClose: 5000,
						draggable: true,
					},
				);
			}
		}
	}, [downloadValues, downloadValues.canStartDownload, downloadValues.title]);

	useEffect(() => {
		const handleEscKey = ({ key }: KeyboardEvent) =>
			key === "Escape" && setShowPopup(false);

		window.addEventListener("keydown", handleEscKey);

		return () => window.removeEventListener("keydown", handleEscKey);
	}, []);

	return (
		<Wrapper ref={popupRef}>
			<Trigger
				onClick={() => setShowPopup(prev => !prev)}
				className={showPopup ? "active" : ""}
			>
				<DownloadingIcon size="20" />
			</Trigger>

			{showPopup && (
				<Popup>
					{downloadingList.map(download => (
						<div key={download.url}>
							<Title>
								<p>{download.title}</p>

								<span>
									<Cancel
										onClick={() =>
											cancelDownloadAndOrRemoveItFromList(download.url)
										}
										color="#777"
										size={13}
									/>
								</span>
							</Title>

							<Progress
								percent_0_to_100={download.percentage}
								status={download.status}
								showStatus={true}
							/>
						</div>
					))}
				</Popup>
			)}
		</Wrapper>
	);
}
// export function Downloading() {
// 	const cancelDownloadAndOrRemoveItFromList = useDownloading();
// 	const { downloadingList } = useDownloadingList();

// 	return (
// 		<StyledRoot modal>
// 			<StyledAnchor>
// 				<StyledPopoverTrigger asChild>
// 					<DownloadingIcon size="20" aria-label="See downloads" />
// 				</StyledPopoverTrigger>
// 			</StyledAnchor>

// 			<StyledContent
// 				collisionTolerance={30}
// 				sideOffset={5*2}
// 				side="right"
// 			>
// 				<Text>Downloading</Text>

// 				{downloadingList.map(download => (
// 					<div key={download.url}>
// 						<Title>
// 							<p>{download.title}</p>

// 							<span>
// 								<Cancel
// 									size={13}
// 									color="#777"
// 									onClick={() =>
// 										cancelDownloadAndOrRemoveItFromList(download.url)
// 									}
// 								/>
// 							</span>
// 						</Title>

// 						<Progress
// 							percent_0_to_100={download.percentage}
// 							status={download.status}
// 							showStatus
// 						/>
// 					</div>
// 				))}

// 				{/* <StyledArrow /> */}

// 				<StyledClose aria-label="Close">
// 					<Close size="15" />
// 				</StyledClose>
// 			</StyledContent>
// 		</StyledRoot>
// 	);
// }

/**
 * This function returns a MessagePort that will be send to
 * Electron to enable 2 way communication between it
 * and React.
 */
function createNewDownload(downloadValues: DownloadValues): MessagePort {
	{
		const { downloadingList } = getDownloadingList();

		// First, see if there is another one that has the same url
		// and stop if true:
		const indexIfThereIsOneAlready = downloadingList.findIndex(
			d => d.url === downloadValues.url,
		);
		if (indexIfThereIsOneAlready !== -1) {
			const info = `There is already one download of "${downloadValues.title}"`;

			toast.info(info, {
				hideProgressBar: false,
				position: "top-right",
				progress: undefined,
				closeOnClick: true,
				pauseOnHover: true,
				autoClose: 5000,
				draggable: true,
			});

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
	const downloadStatus: DownloadingMedia = {
		imageURL: downloadValues.imageURL,
		status: ProgressStatus.ACTIVE,
		title: downloadValues.title,
		url: downloadValues.url,
		isDownloading: true,
		percentage: 0,
		port: myPort,
	};

	// Adding newly created DownloadingMedia:
	setDownloadingList({
		downloadingList: [...getDownloadingList().downloadingList, downloadStatus],
	});

	// Send a msg with the necessary info to Electron
	// to start a new download:
	myPort.postMessage({
		imageURL: downloadValues.imageURL,
		title: downloadStatus.title,
		url: downloadValues.url,
		// ^ On every `postMessage` you have to send the url as an ID!
	});

	// Adding event listeners to React's MessagePort to receive and
	// handle download progress info:
	myPort.onmessage = ({ data }: { data: Partial<DownloadingMedia> }) => {
		const { downloadingList } = getDownloadingList();

		const index = downloadingList.findIndex(d => d.url === data.url);

		if (index === -1)
			return console.error(
				"Received a message from Electron but the url is not in the list",
				data,
				downloadingList,
			);

		// Update React's information about this DownloadingMedia:
		setDownloadingList({
			downloadingList: replace(downloadingList, index, {
				...downloadStatus,
				...data,
			}),
		});

		// Handle ProgressStatus's cases:
		switch (data.status) {
			case ProgressStatus.FAIL: {
				// ^ In this case, `data` include an `error: Error` key.
				console.error((data as typeof data & { error: Error }).error);

				toast.error(`Download of "${downloadStatus.title}" failed!`, {
					hideProgressBar: false,
					position: "top-right",
					progress: undefined,
					closeOnClick: true,
					pauseOnHover: true,
					autoClose: 5000,
					draggable: true,
				});
				break;
			}

			case ProgressStatus.SUCCESS: {
				toast.success(`Download of "${downloadStatus.title}" succeded!`, {
					hideProgressBar: false,
					position: "top-right",
					progress: undefined,
					closeOnClick: true,
					pauseOnHover: true,
					autoClose: 5000,
					draggable: true,
				});
				break;
			}

			case ProgressStatus.CANCEL: {
				toast.info(`Download of "${downloadStatus.title}" was cancelled!`, {
					hideProgressBar: false,
					position: "top-right",
					progress: undefined,
					closeOnClick: true,
					pauseOnHover: true,
					autoClose: 5000,
					draggable: true,
				});

				cancelDownloadAndOrRemoveItFromList(downloadStatus.title);
				break;
			}

			case ProgressStatus.ACTIVE:
				break;

			case undefined:
				break;

			case ProgressStatus.CONVERT:
				break;

			default:
				assertUnreachable(data.status);
		}
	};

	// @ts-ignore: this fn DOES exists
	myPort.onclose = () => console.log("Closing ports (myPort).");

	return electronPort;
}

function cancelDownloadAndOrRemoveItFromList(url: string) {
	const { downloadingList } = getDownloadingList();

	// Find the DownloadingMedia:
	const index = downloadingList.findIndex(d => d.url === url);
	if (index === -1)
		return console.error(
			`There should be a download with url "${url}"!\ndownloadList =`,
			downloadingList,
		);

	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	const download = downloadingList[index]!;

	// Cancel download:
	if (download.isDownloading)
		download.port.postMessage({ destroy: true, url: download.url });

	// Update downloading list:
	setDownloadingList({
		downloadingList: remove(downloadingList, index),
	});
}

type DownloadingMedia = {
	readonly imageURL: string;
	readonly title: string;
	readonly url: string;

	status: ProgressStatus;
	isDownloading: boolean;
	percentage: number;
	port: MessagePort;
};
