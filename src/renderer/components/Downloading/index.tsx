import type { DownloadInfo } from "@common/@types/generalTypes";
import type { ValuesOf } from "@common/@types/utils";

import { MdDownloading as DownloadingIcon } from "react-icons/md";
import { useEffect } from "react";
import create from "zustand";

import { ReactToElectronMessage } from "@common/enums";
import { useDownloadingList } from "@contexts/downloadList";
import { createNewDownload } from "./helper";
import { sendMsgToBackend } from "@common/crossCommunication";
import { PopoverButtons } from "../Navbar/PopoverButtons";
import { ProgressStatus } from "@common/enums";
import { useTranslation } from "@i18n";
import { emptyString } from "@common/empty";
import { errorToast } from "../toasts";
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

const downloadingListPopoverId = "downloading-list-popover-id";

const sizeSelector = (state: ReturnType<typeof useDownloadingList.getState>) =>
	state.downloadingList.size;

export function Downloading() {
	const downloadingListSize = useDownloadingList(sizeSelector);
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
		<PopoverButtons
			tooltip={t("tooltips.showAllDownloadingMedias")}
			popoverId={downloadingListPopoverId}
			size={downloadingListSize}
			Icon={DownloadingIcon}
		>
			<Popup />
		</PopoverButtons>
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
