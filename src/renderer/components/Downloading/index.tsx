import type { ProgressProps } from "../Progress";
import type { Mutable } from "@common/@types/typesAndEnums";

import { useEffect, useReducer, useRef } from "react";
import { AiOutlineClose as Cancel } from "react-icons/ai";
import { toast } from "react-toastify";
import create from "zustand";

import { reaplyOrderedIndex } from "@renderer/contexts/mediaHandler/usePlaylistsHelper";
import { useOnClickOutside } from "@hooks";
import { assertUnreachable } from "@utils/utils";
import { remove, replace } from "@utils/array";
import { Progress, icon } from "../Progress";
import { dbg } from "@common/utils";
import {
	useDownloadValues,
	Type as MsgType,
	sendMsg,
} from "@contexts/communicationBetweenChildren/helpers";

import { Circle, Popup, Title } from "./styles";

const { getState: getDownloadValues } = useDownloadValues;

const downloadingStore = create<UseDownloading>(() => ({
	downloadingList: [],
}));

const { getState: getDownloadingList, setState: setDownloadingList } =
	downloadingStore;

function useDownloading() {
	const downloadingList = getDownloadingList().downloadingList;
	dbg("downloadingList at Downloading:", downloadingList);
	const downloadValues = getDownloadValues().downloadValues;
	dbg("downloadValues at Downloading:", downloadValues);

	function createNewDownload(): MessagePort {
		const indexIfThereIsOneAlready = downloadingList.findIndex(
			({ url }) => url === downloadValues.url,
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

		// MessageChannels are lightweight, it's cheap to create
		// a new one for each request.
		const { port1: myPort, port2: electronPort } = new MessageChannel();

		const downloadStatus: DownloadingMedia = {
			index: downloadingList.length,
			imageURL: downloadValues.imageURL,
			title: downloadValues.title,
			url: downloadValues.url,
			isDownloading: true,
			status: "active",
			percentage: 0,
			port: myPort,
		};

		setDownloadingList({
			downloadingList: [...downloadingList, downloadStatus],
		});

		myPort.postMessage({
			imageURL: downloadValues.imageURL,
			title: downloadStatus.title,
			url: downloadValues.url,
			// ^ On every `postMessage` you have to send the url (as an ID)!
		});

		myPort.onmessage = ({ data }: { data: Partial<DownloadingMedia> }) => {
			setDownloadingList({
				downloadingList: replace(downloadingList, downloadStatus.index, {
					...downloadStatus,
					...data,
				}) as Mutable<DownloadingMedia[]>,
			});

			switch (data.status) {
				case "fail": {
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

				case "success": {
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

				case "cancel": {
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

				case "active":
					break;

				case undefined:
					break;

				default:
					assertUnreachable(data.status);
			}
		};

		// @ts-ignore: this fn DOES exists
		myPort.onclose = () => console.log("Closing ports (myPort).");

		return electronPort;
	}

	function cancelDownloadAndOrRemoveItFromList(url_: string) {
		const index = downloadingList.findIndex(({ url }) => url === url_);
		if (index === -1) {
			console.error(
				`There should be a download with url "${url_}"!\ndownloadList =`,
				downloadingList,
			);
			return;
		}

		const download = downloadingList[index];

		if (download.isDownloading)
			download.port.postMessage({ destroy: true, url: download.url });

		setDownloadingList({
			downloadingList: reaplyOrderedIndex(
				remove(downloadingList, index),
			) as Mutable<DownloadingMedia[]>,
		});
	}

	useEffect(() => {
		if (downloadValues.canStartDownload) {
			try {
				const electronPort = createNewDownload();

				// We have to `sendMsg` to reset downloadValues
				// so that it is ready for a new media download:
				sendMsg({ type: MsgType.RESET_DOWNLOAD_VALUES });

				// Sending port so we can communicate with electron:
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
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [downloadValues.canStartDownload]);

	return [cancelDownloadAndOrRemoveItFromList] as const;
}

export function Downloading() {
	const [showPopup, toggleShowPopup] = useReducer(prev => !prev, false);
	const [cancelDownloadAndOrRemoveItFromList] = useDownloading();
	const downloadingList = getDownloadingList().downloadingList;
	const popupRef = useRef<HTMLDivElement>(null);

	useOnClickOutside(popupRef, () => toggleShowPopup());

	return downloadingList.length > 0 ? (
		<>
			<Circle onClick={toggleShowPopup}>{icon("active")}</Circle>

			{showPopup && (
				<Popup ref={popupRef}>
					{downloadingList.map(download => (
						<div key={download.url}>
							<Title>
								<p>{download.title}</p>
								<span>
									<Cancel
										size={13}
										color="#777"
										onClick={() =>
											cancelDownloadAndOrRemoveItFromList(download.url)
										}
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
		</>
	) : null;
}

type DownloadingMedia = Readonly<{
	status: ProgressProps["status"];
	isDownloading: boolean;
	percentage: number;
	port: MessagePort;
	imageURL: string;
	index: number;
	title: string;
	url: string;
}>;

type UseDownloading = {
	downloadingList: DownloadingMedia[];
};
