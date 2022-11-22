import type { DownloadInfo } from "@common/@types/generalTypes";
import type { ValuesOf } from "@common/@types/utils";

import { MdDownloading as DownloadingIcon } from "react-icons/md";
import { useEffect, useState } from "react";
import {
	useObservable,
	useObserveEffect,
	useSelector,
} from "@legendapp/state/react";
import { observable } from "@legendapp/state";
import { Trigger } from "@radix-ui/react-popover";

import { PopoverRoot, PopoverContent } from "@components/Popover";
import { createNewDownload, Popup } from "./helper";
import { reactToElectronMessage } from "@common/enums";
import { sendMsgToBackend } from "@common/crossCommunication";
import { downloadingList } from "@contexts/downloadList";
import { progressStatus } from "@common/enums";
import { emptyString } from "@common/empty";
import { errorToast } from "@components/toasts";
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
} as const);

export const downloadInfo = observable<DownloadInfo>({
	...defaultDownloadInfo,
});

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////

export function Downloading() {
	const { isPopoverOpen, downloadInfo_, downloadingListSize } = useObservable(
		() => ({
			downloadingListSize: downloadingList.size,
			downloadInfo_: downloadInfo.get(),
			isPopoverOpen: false,
		}),
	);

	useObserveEffect(() => {
		if (downloadInfo_.url.get().length === 0) return;

		// For each new `downloadInfo`, start a new download:
		try {
			const electronPort = createNewDownload(downloadInfo_.get());

			// Sending port so we can communicate with Electron:
			sendMsgToBackend(
				{ type: reactToElectronMessage.CREATE_A_NEW_DOWNLOAD },
				electronPort,
			);
		} catch (error) {
			console.error(error);

			errorToast(
				`${t("toasts.downloadError.beforePath")}"${
					downloadInfo_.title.peek()
				}"${t("toasts.downloadError.afterPath")}`,
			);
		}

		downloadInfo.set({ ...defaultDownloadInfo });
	});

	return (
		<PopoverRoot modal open={isPopoverOpen.get()} onOpenChange={isPopoverOpen.set}>
			<Trigger
				className={`${
					downloadingListSize.get() > 0 ? "has-items" : ""
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

export type MediaBeingDownloaded = Readonly<{
	status: ValuesOf<typeof progressStatus>;
	percentage: number;
	port: MessagePort;
	imageURL: string;
	title: string;
}>;
