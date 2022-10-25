import type { DownloadInfo } from "@common/@types/generalTypes";
import type { ValuesOf } from "@common/@types/utils";

import { MdDownloading as DownloadingIcon } from "react-icons/md";
import { useEffect, useState } from "react";
import create from "zustand";

import { PopoverRoot, PopoverContent } from "@components/Popover/Popover";
import { ReactToElectronMessage } from "@common/enums";
import { createNewDownload, Popup } from "./helper";
import { useDownloadingList } from "@contexts/downloadList";
import { sendMsgToBackend } from "@common/crossCommunication";
import { ProgressStatus } from "@common/enums";
import { emptyString } from "@common/empty";
import { errorToast } from "@styles/global";

import { StyledPopoverTrigger } from "./styles";
import { t } from "@components/I18n";

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Constants:

const defaultDownloadInfo: DownloadInfo = Object.freeze({
	imageURL: emptyString,
	artist: emptyString,
	title: emptyString,
	url: emptyString,
	extension: "mp3",
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
			sendMsgToBackend(
				{ type: ReactToElectronMessage.CREATE_A_NEW_DOWNLOAD },
				electronPort,
			);
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
				aria-label={t("tooltips.showAllDownloadingMedias")}
				title={t("tooltips.showAllDownloadingMedias")}
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
		status: ValuesOf<typeof ProgressStatus>;
		percentage: number;
		port: MessagePort;
		imageURL: string;
		title: string;
	}
>;
