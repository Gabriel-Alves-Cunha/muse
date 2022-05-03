import { MdDownloading as DownloadingIcon } from "react-icons/md";
import { useEffect, useRef, useState } from "react";
import create from "zustand";

import { ReactToElectronMessageEnum } from "@common/@types/electron-window";
import { createNewDownload, Popup } from "./helper";
import { useOnClickOutside } from "@hooks";
import { sendMsgToBackend } from "@common/crossCommunication";
import { Tooltip } from "@components";
import {
	type DownloadInfo,
	ProgressStatus,
} from "@common/@types/typesAndEnums";

import { Trigger, Wrapper } from "./styles";
import { errorToast } from "@styles/global";

// const { port1: testPort } = new MessageChannel();
// const testDownloadingMedias: MediaBeingDownloaded[] = new Array.fill(Object.freeze({
// 	status: ProgressStatus.ACTIVE,
// 	url: "http://test.com",
// 	isDownloading: true,
// 	percentage: 50,
// 	port: testPort,
// 	title: "test",
// 	imageURL: "",
// 	index: 0,
// }));

const defaultDownloadInfo: DownloadInfo = Object.freeze({
	canStartDownload: false,
	extension: "mp3",
	imageURL: "",
	title: "",
	url: "",
});

export const useDownloadInfo = create<DownloadInfo>(() => defaultDownloadInfo);
export const useDownloadingList = create<DownloadingList>(() => []);

export const { setState: setDownloadInfo } = useDownloadInfo;

export function Downloading() {
	const [showPopup, setShowPopup] = useState(false);
	const popupRef = useRef<HTMLDivElement>(null);
	const downloadingList = useDownloadingList();
	const downloadInfo = useDownloadInfo();

	useOnClickOutside(popupRef, () => setShowPopup(false));

	useEffect(() => {
		// For each new `DownloadingInfo`, start a new download:
		if (downloadInfo.canStartDownload)
			try {
				const electronPort = createNewDownload(downloadInfo);

				// We have to reset `downloadValues`
				// (more specificaly, `canStartDownload`) so
				// that it is ready for a new media download:
				setDownloadInfo(defaultDownloadInfo);

				// Sending port so we can communicate with Electron:
				sendMsgToBackend(
					{
						type: ReactToElectronMessageEnum.DOWNLOAD_MEDIA,
					},
					electronPort,
				);
			} catch (error) {
				errorToast(
					`There was an error trying to download "${downloadInfo.title}"! Please, try again later.`,
				);
			}
	}, [downloadInfo, downloadInfo.canStartDownload, downloadInfo.title]);

	useEffect(() => {
		const handleEscKey = ({ key }: KeyboardEvent) =>
			key === "Escape" && setShowPopup(false);

		window.addEventListener("keydown", handleEscKey);

		return () => window.removeEventListener("keydown", handleEscKey);
	}, []);

	return (
		<Wrapper ref={popupRef}>
			<Tooltip text="Show all downloading medias" arrow={false} side="right">
				<Trigger
					onClick={() => setShowPopup(prev => !prev)}
					className={
						(downloadingList.length ? "has-downloads " : "") +
						(showPopup ? "active" : "")
					}
				>
					<i data-length={downloadingList.length}></i>
					<DownloadingIcon size="20" />
				</Trigger>
			</Tooltip>

			{showPopup && <Popup downloadingList={downloadingList} />}
		</Wrapper>
	);
}

export type MediaBeingDownloaded = Readonly<{
	status: ProgressStatus;
	isDownloading: boolean;
	percentage: number;
	port: MessagePort;
	imageURL: string;
	title: string;
	url: string;
}>;

type DownloadingList = readonly MediaBeingDownloaded[];

Downloading.whyDidYouRender = {
	customName: "Downloading",
};
