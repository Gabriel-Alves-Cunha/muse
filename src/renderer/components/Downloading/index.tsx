import type { DownloadInfo } from "@common/@types/generalTypes";
import type { ValuesOf } from "@common/@types/utils";

import { MdDownloading as DownloadingIcon } from "react-icons/md";
import { useEffect, useState } from "react";
import { Trigger } from "@radix-ui/react-popover";
import create from "zustand";

import { PopoverRoot, PopoverContent } from "@components/Popover";
import { createNewDownload, Popup } from "./helper";
import { reactToElectronMessage } from "@common/enums";
import { useDownloadingList } from "@contexts/downloadList";
import { sendMsgToBackend } from "@common/crossCommunication";
import { progressStatus } from "@common/enums";
import { emptyString } from "@common/empty";
import { errorToast } from "@components/toasts";
import { t } from "@components/I18n";

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
	const [isOpen, setIsOpen] = useState(false);
	const downloadInfo = useDownloadInfo();

	useEffect(() => {
		if (downloadInfo.url.length === 0) return;

		// For each new `downloadInfo`, start a new download:
		try {
			const electronPort = createNewDownload(downloadInfo);

			// Sending port so we can communicate with Electron:
			sendMsgToBackend(
				{ type: reactToElectronMessage.CREATE_A_NEW_DOWNLOAD },
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
			<Trigger
				className={(downloadingListSize > 0 ? "has-items " : "") +
					(isOpen === true ? "active " : "") +
					"relative flex justify-center items-center bg-none border-none text-icon-deactivated text-base hover:text-icon-active focus:text-icon-active "}
				title={t("tooltips.showAllDownloadingMedias")}
			>
				<span data-length={downloadingListSize}></span>

				<DownloadingIcon size={20} />
			</Trigger>

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
		status: ValuesOf<typeof progressStatus>;
		percentage: number;
		port: MessagePort;
		imageURL: string;
		title: string;
	}
>;
