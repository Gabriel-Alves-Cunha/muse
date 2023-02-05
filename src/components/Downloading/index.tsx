import type { DownloadInfo } from "types/generalTypes";
import type { ValuesOf } from "types/utils";

import { MdDownloading as DownloadingIcon } from "react-icons/md";
import { useEffect } from "react";
import { create } from "zustand";

import { createOrCancelDownload } from "@modules/media/createDownload";
import { NavbarPopoverButtons } from "../Navbar/NavbarPopoverButtons";
import { useDownloadingList } from "@contexts/downloadList";
import { createNewDownload } from "./helper";
import { ProgressStatus } from "@utils/enums";
import { useTranslation } from "@i18n";
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
		const downloaderMsgPort = createNewDownload(downloadInfo);

		createOrCancelDownload({ downloaderMsgPort, ...downloadInfo });

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
