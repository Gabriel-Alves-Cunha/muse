import type { Mutable } from "@common/@types/typesAndEnums";

import { useCallback, useEffect, useReducer, useRef } from "react";
import { AiOutlineClose as Cancel } from "react-icons/ai";
import { toast } from "react-toastify";
import create from "zustand";

import { useDownloadValues, MsgEnum, sendMsg } from "@contexts";
import { reaplyOrderedIndex } from "@contexts/mediaHandler/usePlaylistsHelper";
import { useOnClickOutside } from "@hooks";
import { assertUnreachable } from "@utils/utils";
import { remove, replace } from "@utils/array";
import { Progress, icon } from "@components/Progress";
import { ProgressStatus } from "@common/@types/typesAndEnums";

import { Circle, Popup, Title } from "./styles";

const useDownloadingList = create<{
	downloadingList: DownloadingMedia[];
}>(() => ({
	downloadingList: [],
}));

const { setState: setDownloadingList } = useDownloadingList;

function useDownloading() {
	const { downloadingList } = useDownloadingList();
	const { downloadValues } = useDownloadValues();

	const cancelDownloadAndOrRemoveItFromList = useCallback(
		(url_: string) => {
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
		},
		[downloadingList],
	);

	useEffect(() => {
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
				imageURL: downloadValues.imageURL,
				status: ProgressStatus.ACTIVE,
				index: downloadingList.length,
				title: downloadValues.title,
				url: downloadValues.url,
				isDownloading: true,
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

		if (downloadValues.canStartDownload) {
			try {
				const electronPort = createNewDownload();

				// We have to `sendMsg` to reset downloadValues
				// so that it is ready for a new media download:
				sendMsg({ type: MsgEnum.RESET_DOWNLOAD_VALUES });

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
	}, [
		cancelDownloadAndOrRemoveItFromList,
		downloadValues.canStartDownload,
		downloadValues.imageURL,
		downloadValues.title,
		downloadValues.url,
		downloadingList,
	]);

	return cancelDownloadAndOrRemoveItFromList;
}

export function Downloading() {
	const [showPopup, toggleShowPopup] = useReducer(prev => !prev, false);
	const cancelDownloadAndOrRemoveItFromList = useDownloading();
	const { downloadingList } = useDownloadingList();
	const popupRef = useRef<HTMLDivElement>(null);

	useOnClickOutside(popupRef, () => toggleShowPopup());

	return downloadingList.length > 0 ? (
		<>
			<Circle onClick={toggleShowPopup}>{icon(ProgressStatus.ACTIVE)}</Circle>

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
	status: ProgressStatus;
	isDownloading: boolean;
	percentage: number;
	port: MessagePort;
	imageURL: string;
	index: number;
	title: string;
	url: string;
}>;
