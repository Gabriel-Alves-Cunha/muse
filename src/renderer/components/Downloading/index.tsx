import type { DownloadInfo } from "@common/@types/generalTypes";
import type { ValuesOf } from "@common/@types/utils";

import { createEffect, createSignal, on } from "solid-js";
import { createStore } from "solid-js/store";
import { useI18n } from "@solid-primitives/i18n";

import { createNewDownload, Popup } from "./helper";
import { reactToElectronMessage } from "@common/enums";
import { sendMsgToBackend } from "@common/crossCommunication";
import { downloadingList } from "@contexts/downloadList";
import { progressStatus } from "@common/enums";
import { DownloadIcon } from "@icons/DownloadIcon";
import { emptyString } from "@common/empty";
import { errorToast } from "../toasts";
import { Dialog } from "../Dialog";
import { error } from "@utils/log";

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

export const [downloadInfo, setDownloadInfo] = createStore(defaultDownloadInfo);

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////

export function Downloading() {
	const [isPopoverOpen, setIsPopoverOpen] = createSignal(false);
	const downloadingListSize = () => downloadingList.size;
	const [t] = useI18n();

	createEffect(
		() => {
			if (!downloadInfo.url) return;

			// For each new `downloadInfo`, start a new download:
			try {
				const electronPort = createNewDownload(downloadInfo);

				// Sending port so we can communicate with Electron:
				sendMsgToBackend(
					{ type: reactToElectronMessage.CREATE_A_NEW_DOWNLOAD },
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
		},
		{ defer: true },
	);

	return (
		<>
			<button
				class="relative flex justify-center items-center w-11 h-11 bg-none border-none text-base group"
				classList={{ "has-items": downloadingListSize() > 0 }}
				title={t("tooltips.showAllDownloadingMedias")}
				type="button"
			>
				<span data-length={downloadingListSize()} />

				<DownloadIcon class="w-5 h-5 text-icon-deactivated group-hover:text-icon-active group-focus:text-icon-active" />
			</button>

			<Dialog
				class={`${
					downloadingListSize() === 0
						? "nothing-found-for-convertions-or-downloads"
						: "convertions-or-downloads"
				}`}
				setIsOpen={setIsPopoverOpen}
				isOpen={isPopoverOpen()}
				modal
			>
				<Popup />
			</Dialog>
		</>
	);
}

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Types:

export type MediaBeingDownloaded = {
	status: ValuesOf<typeof progressStatus>;
	percentage: number;
	port: MessagePort;
	imageURL: string;
	title: string;
};
