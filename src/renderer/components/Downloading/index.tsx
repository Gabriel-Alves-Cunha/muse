import type { DownloadInfo } from "@common/@types/generalTypes";
import type { ValuesOf } from "@common/@types/utils";

import { MdDownloading as DownloadingIcon } from "react-icons/md";
import { useEffect, useState } from "react";
import { Trigger } from "@radix-ui/react-popover";
import create from "zustand";

import { PopoverRoot, PopoverContent } from "@components/Popover";
import { ReactToElectronMessage } from "@common/enums";
import { useDownloadingList } from "@contexts/downloadList";
import { createNewDownload } from "./helper";
import { sendMsgToBackend } from "@common/crossCommunication";
import { ProgressStatus } from "@common/enums";
import { useTranslation } from "@i18n";
import { emptyString } from "@common/empty";
import { errorToast } from "@components/toasts";
import { error } from "@common/log";
import { Popup } from "./Popup";

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Constants:

const defaultDownloadInfo: DownloadInfo = {
	imageURL: emptyString,
	artist: emptyString,
	title: emptyString,
	url: emptyString,
	extension: "mp3",
} as const;

export const useDownloadInfo = create(() => defaultDownloadInfo);

export const { setState: setDownloadInfo } = useDownloadInfo;

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////

const sizeSelector = (state: ReturnType<typeof useDownloadingList.getState>) =>
	state.downloadingList.size;

export function Downloading() {
	const downloadingListSize = useDownloadingList(sizeSelector);
	const [isPopoverOpen, setIsPopoverOpen] = useState(false);
	const downloadInfo = useDownloadInfo();
	const { t } = useTranslation();

	useEffect(() => {
		if (!downloadInfo.url) return;

		// For each new `downloadInfo`, start a new download:
		try {
			const electronPort = createNewDownload(downloadInfo);

			// Sending port so we can communicate with Electron:
			sendMsgToBackend(
				{ type: ReactToElectronMessage.CREATE_A_NEW_DOWNLOAD },
				electronPort,
			);
		} catch (err) {
			error(err);

			errorToast(
				`${t("toasts.downloadError.beforePath")}"${downloadInfo.title}"${t(
					"toasts.downloadError.afterPath",
				)}`,
			);
		}

		setDownloadInfo(defaultDownloadInfo);
	}, [downloadInfo.title, downloadInfo]);

	return (
		<PopoverRoot modal open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
			<Trigger
				className={`${
					downloadingListSize > 0 ? "has-items" : ""
				} relative flex justify-center items-center w-11 h-11 bg-none border-none text-base group`}
				title={t("tooltips.showAllDownloadingMedias")}
			>
				<span data-length={downloadingListSize} />

				<DownloadingIcon className="w-5 h-5 text-icon-deactivated group-hover:text-icon-active group-focus:text-icon-active" />
			</Trigger>

			<PopoverContent
				size={
					downloadingListSize === 0
						? "nothing-found-for-convertions-or-downloads"
						: "convertions-or-downloads"
				}
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

export type MediaBeingDownloaded = {
	status: ValuesOf<typeof ProgressStatus>;
	percentage: number;
	port: MessagePort;
	imageURL: string;
	title: string;
};
