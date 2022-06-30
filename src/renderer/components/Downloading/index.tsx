import type { DownloadInfo } from "@common/@types/generalTypes";

import { MdDownloading as DownloadingIcon } from "react-icons/md";
import { useEffect, useState } from "react";
import create from "zustand";

import { PopoverRoot, PopoverContent } from "@components/Popover";
import { ReactToElectronMessageEnum } from "@common/@types/electron-window";
import { createNewDownload, Popup } from "./helper";
import { useDownloadingList } from "@contexts/downloadList";
import { sendMsgToBackend } from "@common/crossCommunication";
import { ProgressStatus } from "@common/enums";
import { errorToast } from "@styles/global";

import { StyledPopoverTrigger } from "./styles";
import { PopoverAnchor } from "../Converting/styles";

const defaultDownloadInfo: DownloadInfo = Object.freeze({
	canStartDownload: false,
	extension: "mp3",
	imageURL: "",
	title: "",
	url: "",
});

export const useDownloadInfo = create(() => defaultDownloadInfo);
export const { setState: setDownloadInfo } = useDownloadInfo;

export function Downloading() {
	const downloadingListSize = useDownloadingList().downloadingList.size;
	const [isOpen, setIsOpen] = useState(false);
	const downloadInfo = useDownloadInfo();

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
				sendMsgToBackend({
					type: ReactToElectronMessageEnum.CREATE_A_NEW_DOWNLOAD,
				}, electronPort);
			} catch (error) {
				console.error(error);

				errorToast(
					`There was an error trying to download "${downloadInfo.title}"! Please, try again later.`,
				);
			}
	}, [downloadInfo.canStartDownload, downloadInfo.title, downloadInfo]);

	return (
		<PopoverRoot open={isOpen} onOpenChange={setIsOpen}>
			<StyledPopoverTrigger
				className={(downloadingListSize ? "has-items " : "") +
					(isOpen ? "active " : "")}
				data-tip="Show all downloading medias"
			>
				<span data-length={downloadingListSize}></span>

				<DownloadingIcon size={20} />
			</StyledPopoverTrigger>

			<PopoverAnchor />

			<PopoverContent
				size={downloadingListSize === 0 ?
					"nothing-found-for-convertions-or-downloads" :
					"convertions-or-downloads"}
				alignOffset={14}
			>
				<Popup />
			</PopoverContent>
		</PopoverRoot>
	);
}

export type MediaBeingDownloaded = Readonly<
	{
		status: ProgressStatus;
		isDownloading: boolean;
		percentage: number;
		port: MessagePort;
		imageURL: string;
		title: string;
	}
>;
