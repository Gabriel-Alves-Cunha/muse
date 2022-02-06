import type { ProgressProps } from "../Progress";

import { useEffect, useReducer, useRef, useState } from "react";
import { AiOutlineClose as Cancel } from "react-icons/ai";
import { toast } from "react-toastify";

import { reaplyOrderedIndex } from "@renderer/contexts/mediaHandler/usePlaylistsHelper";
import { useOnClickOutside } from "@hooks";
import { assertUnreachable } from "@utils/utils";
import { remove, replace } from "@utils/array";
import { Type as MsgType } from "@contexts/communicationBetweenChildren";
import { Progress, icon } from "../Progress";
import { useInterComm } from "@contexts/communicationBetweenChildren";

import { Circle, Popup, Title } from "./styles";

export function Downloading() {
	const {
		values: { downloadValues },
		sendMsg,
	} = useInterComm();

	const [showPopup, toggleShowPopup] = useReducer(prev => !prev, false);
	const [downloadList, setDownloadList] = useState(
		[] as readonly DownloadingMedia[],
	);
	const popupRef = useRef<HTMLDivElement>(null);

	function createNewDownload(): MessagePort {
		const indexIfThereIsOneAlready = downloadList.findIndex(
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

			console.error(info, downloadList);
			throw new Error(info);
		}

		// MessageChannels are lightweight, it's cheap to create
		// a new one for each request.
		const { port1: myPort, port2: electronPort } = new MessageChannel();

		const downloadStatus: DownloadingMedia = {
			index: downloadList.length,
			imageURL: downloadValues.imageURL,
			title: downloadValues.title,
			url: downloadValues.url,
			isDownloading: true,
			status: "active",
			percentage: 0,
			port: myPort,
		};

		setDownloadList(prev => [...prev, downloadStatus]);

		myPort.postMessage({
			imageURL: downloadValues.imageURL,
			title: downloadStatus.title,
			url: downloadValues.url,
			// ^ On every `postMessage` you have to send the url (as an ID)!
		});

		myPort.onmessage = ({ data }: { data: Partial<DownloadingMedia> }) => {
			setDownloadList(prev =>
				replace(prev, downloadStatus.index, {
					...downloadStatus,
					...data,
				}),
			);

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
		const index = downloadList.findIndex(({ url }) => url === url_);
		if (index === -1) {
			console.error(
				`There should be a download with url "${url_}"!\ndownloadList =`,
				downloadList,
			);
			return;
		}

		const download = downloadList[index];

		if (download.isDownloading)
			download.port.postMessage({ destroy: true, url: download.url });

		setDownloadList(prev => reaplyOrderedIndex(remove(prev, index)));
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

	useOnClickOutside(popupRef, () => toggleShowPopup());

	return downloadList.length > 0 ? (
		<>
			<Circle onClick={toggleShowPopup}>{icon("active")}</Circle>

			{showPopup && (
				<Popup ref={popupRef}>
					{downloadList.map(download => (
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
