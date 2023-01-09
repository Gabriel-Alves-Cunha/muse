import type { MediaBeingDownloaded } from ".";

import { AiOutlineClose as CancelIcon } from "react-icons/ai";

import { getDownloadingList, useDownloadingList } from "@contexts/downloadList";
import { cancelDownloadAndOrRemoveItFromList } from "./helper";
import { Progress, progressIcons } from "../Progress";
import { ProgressStatus } from "@common/enums";
import { useTranslation } from "@i18n";
import { Button } from "../Button";

import { handleSingleItemDeleteAnimation } from "./styles";

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////

export function Popup() {
	const { downloadingList } = useDownloadingList();
	const { t } = useTranslation();

	return downloadingList.size > 0 ? (
		<>
			<Button variant="medium" onPointerUp={cleanAllDoneDownloads}>
				{t("buttons.cleanFinished")}
			</Button>

			{Array.from(downloadingList, ([url, downloadingMedia], index) => (
				<DownloadingBox
					download={downloadingMedia}
					downloadingIndex={index}
					url={url}
					key={url}
				/>
			))}
		</>
	) : (
		<p>{t("infos.noDownloadsInProgress")}</p>
	);
}

/////////////////////////////////////////////

export const isDownloadList = true;

function DownloadingBox({
	downloadingIndex,
	download,
	url,
}: DownloadingBoxProps) {
	const { t } = useTranslation();

	return (
		<div className="box">
			<div className="left">
				<p>{download.title}</p>

				<Progress
					percent_0_to_100={download.percentage}
					status={download.status}
				/>
			</div>

			<div className="right">
				<button
					onPointerUp={(e) =>
						handleSingleItemDeleteAnimation(
							e,
							downloadingIndex,
							isDownloadList,
							url,
						)
					}
					title={t("tooltips.cancelDownload")}
				>
					<CancelIcon size={13} />
				</button>

				{progressIcons.get(download.status)}
			</div>
		</div>
	);
}

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Helper functions for Popup:

function cleanAllDoneDownloads(): void {
	for (const [url, download] of getDownloadingList())
		if (
			download.status !==
				ProgressStatus.WAITING_FOR_CONFIRMATION_FROM_ELECTRON &&
			download.status !== ProgressStatus.ACTIVE
		)
			cancelDownloadAndOrRemoveItFromList(url);
}

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Types:

type DownloadingBoxProps = {
	download: MediaBeingDownloaded;
	downloadingIndex: number;
	url: string;
};
