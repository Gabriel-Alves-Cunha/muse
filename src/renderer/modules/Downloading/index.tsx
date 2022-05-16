import { MdDownloading as DownloadingIcon } from "react-icons/md";
import { useEffect, useState } from "react";
import create from "zustand";

import { PopoverRoot, PopoverContent, Tooltip } from "@components";
import { ReactToElectronMessageEnum } from "@common/@types/electron-window";
import { createNewDownload, Popup } from "./helper";
import { useDownloadingList } from "@contexts";
import { sendMsgToBackend } from "@common/crossCommunication";
import { errorToast } from "@styles/global";
import {
	type DownloadInfo,
	ProgressStatus,
} from "@common/@types/typesAndEnums";

import { StyledPopoverTrigger, Wrapper } from "./styles";
import { PopoverAnchor } from "@modules/Converting/styles";

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
export const { setState: setDownloadInfo } = useDownloadInfo;

export function Downloading() {
	const [isOpen, setIsOpen] = useState(false);
	const downloadingList = useDownloadingList();
	const downloadInfo = useDownloadInfo();

	const toggleIsOpen = (newIsOpen: boolean) => setIsOpen(newIsOpen);

	useEffect(() => {
		// For each new `DownloadingInfo`, start a new download:
		if (downloadInfo.canStartDownload)
			try {
				const electronPort = createNewDownload(downloadInfo);

				// We have to reset `downloadValues`
				// (more specificaly, `canStartDownload`) so
				// that it is ready for a new media download,
				// but let's clear everything to not leak:
				setDownloadInfo(defaultDownloadInfo);

				// Sending port so we can communicate with Electron:
				sendMsgToBackend(
					{
						type: ReactToElectronMessageEnum.CREATE_A_NEW_DOWNLOAD,
					},
					electronPort
				);
			} catch (error) {
				console.error(error);

				errorToast(
					`There was an error trying to download "${downloadInfo.title}"! Please, try again later.`
				);
			}
	}, [downloadInfo, downloadInfo.canStartDownload, downloadInfo.title]);

	return (
		<Wrapper>
			<PopoverRoot open={isOpen} onOpenChange={toggleIsOpen}>
				<Tooltip text="Show all downloading medias" side="right">
					<StyledPopoverTrigger
						className={
							(downloadingList.length ? "has-items " : "") +
							(isOpen ? "active " : "")
						}
					>
						<i data-length={downloadingList.length}></i>

						<DownloadingIcon size="20" />
					</StyledPopoverTrigger>
				</Tooltip>

				<PopoverAnchor />

				<PopoverContent
					size={
						downloadingList.length === 0
							? "nothingFoundForConvertionsOrDownloads"
							: "convertionsOrDownloads"
					}
				>
					<Popup downloadingList={downloadingList} />
				</PopoverContent>
			</PopoverRoot>
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

Downloading.whyDidYouRender = {
	customName: "Downloading",
};
