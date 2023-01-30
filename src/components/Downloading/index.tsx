import type { DownloadInfo } from "@renderer/common/@types/generalTypes";
import type { ValuesOf } from "@renderer/common/@types/utils";

import { MdDownloading as DownloadingIcon } from "react-icons/md";
import { useEffect } from "react";
import { create } from "zustand";

import { ReactToElectronMessage } from "@renderer/common/enums";
import { NavbarPopoverButtons } from "../Navbar/NavbarPopoverButtons";
import { useDownloadingList } from "@contexts/downloadList";
import { createNewDownload } from "./helper";
import { sendMsgToBackend } from "@renderer/common/crossCommunication";
import { ProgressStatus } from "@renderer/common/enums";
import { useTranslation } from "@i18n";
import { errorToast } from "../toasts";
import { error } from "@renderer/common/log";
import { Popup } from "./Popup";

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Constants:

const defaultDownloadInfo: DownloadInfo = {
	extension: "mp3",
	imageURL: "",
	artist: "",
	title: "",
	url: "",
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
		<NavbarPopoverButtons
			tooltip={t("tooltips.showAllDownloadingMedias")}
			size={downloadingListSize}
			Icon={DownloadingIcon}
		>
			<Popup />
		</NavbarPopoverButtons>
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
