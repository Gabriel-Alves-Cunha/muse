import type { MediaBeingDownloaded } from ".";

import { AiOutlineClose as CancelIcon } from "react-icons/ai";
import { useSnapshot } from "valtio";

import { cancelDownloadAndOrRemoveItFromList } from "./helper";
import { Progress, progressIcons } from "../Progress";
import { downloadingList } from "@contexts/downloadList";
import { ProgressStatus } from "@common/enums";
import { translation } from "@i18n";
import { Button } from "../Button";

import { handleSingleItemDeleteAnimation } from "./styles";

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////

export function Popup() {
	const downloadingListAccessor = useSnapshot(downloadingList);
	const translationAccessor = useSnapshot(translation);
	const t = translationAccessor.t;

	return downloadingListAccessor.size > 0 ? (
		<>
			<Button variant="medium" onPointerUp={cleanAllDoneDownloads}>
				{t("buttons.cleanFinished")}
			</Button>

			{Array.from(downloadingListAccessor, ([url, downloadingMedia], index) => (
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
	const translationAccessor = useSnapshot(translation);
	const t = translationAccessor.t;

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
	for (const [url, download] of downloadingList)
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
