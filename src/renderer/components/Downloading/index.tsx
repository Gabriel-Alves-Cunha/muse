import type { DownloadInfo } from "@common/@types/generalTypes";

import { MdDownloading as DownloadingIcon } from "react-icons/md";
import { useEffect, useState } from "react";
import create from "zustand";

import { PopoverRoot, PopoverContent } from "@components/Popover";
import { ReactToElectronMessageEnum } from "@common/enums";
import { createNewDownload, Popup } from "./helper";
import { useDownloadingList } from "@contexts/downloadList";
import { sendMsgToBackend } from "@common/crossCommunication";
import { ProgressStatus } from "@common/enums";
import { errorToast } from "@styles/global";

import { StyledPopoverTrigger } from "./styles";
import { t } from "@components/I18n";

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Constants:

const defaultDownloadInfo: DownloadInfo = Object.freeze({
	extension: "mp3",
	imageURL: "",
	artist: "",
	title: "",
	url: "",
});

export const useDownloadInfo = create(() => defaultDownloadInfo);

export const { setState: setDownloadInfo } = useDownloadInfo;

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////

const sizeSelector = (state: ReturnType<typeof useDownloadingList.getState>) =>
	state.downloadingList.size;

export function Downloading() {
	const downloadingListSize = useDownloadingList(sizeSelector);
	const [isOpen, setIsOpen] = useState(false);
	const downloadInfo = useDownloadInfo();

	useEffect(() => {
		if (downloadInfo.url.length === 0) return;

		// For each new `downloadInfo`, start a new download:
		try {
			const electronPort = createNewDownload(downloadInfo);

			// Sending port so we can communicate with Electron:
			sendMsgToBackend({
				type: ReactToElectronMessageEnum.CREATE_A_NEW_DOWNLOAD,
			}, electronPort);
		} catch (error) {
			console.error(error);

			errorToast(
				`${t("toasts.downloadError.beforePath")}"${downloadInfo.title}"${
					t("toasts.downloadError.afterPath")
				}`,
			);
		}

		setDownloadInfo(defaultDownloadInfo);
	}, [downloadInfo.title, downloadInfo]);

	return (
		<PopoverRoot modal open={isOpen} onOpenChange={setIsOpen}>
			<StyledPopoverTrigger
				className={(downloadingListSize > 0 ? "has-items " : "") +
					(isOpen === true ? "active " : "")}
				data-tip={t("tooltips.showAllDownloadingMedias")}
			>
				<span data-length={downloadingListSize}></span>

				<DownloadingIcon size={20} />
			</StyledPopoverTrigger>

			<PopoverContent
				size={downloadingListSize === 0 ?
					"nothing-found-for-convertions-or-downloads" :
					"convertions-or-downloads"}
				side="right"
				align="end"
			>
				<Popup />
			</PopoverContent>
		</PopoverRoot>
	);
}

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Types:

export type MediaBeingDownloaded = Readonly<
	{
		status: ProgressStatus;
		percentage: number;
		port: MessagePort;
		imageURL: string;
		title: string;
	}
>;
