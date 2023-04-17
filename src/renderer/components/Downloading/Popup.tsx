import type { MediaBeingDownloaded } from ".";

import { AiOutlineClose as CancelIcon } from "react-icons/ai";

import { downloadingListRef, getDownloadingList } from "@contexts/downloadList";
import { cancelDownloadAndOrRemoveItFromList } from "./helper";
import { Progress, progressIcons } from "../Progress";
import { selectT, useTranslator } from "@i18n";
import { ProgressStatusEnum } from "@common/enums";
import { Button } from "../Button";

import { handleSingleItemDeleteAnimation } from "./styles";

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////

export function Popup(): JSX.Element {
	const downloadingList = downloadingListRef().current;
	const t = useTranslator(selectT);

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

export const IS_DOWNLOAD_LIST = true;

function DownloadingBox({
	downloadingIndex,
	download,
	url,
}: DownloadingBoxProps): JSX.Element {
	const t = useTranslator(selectT);

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
							IS_DOWNLOAD_LIST,
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
				ProgressStatusEnum.WAITING_FOR_CONFIRMATION_FROM_ELECTRON &&
			download.status !== ProgressStatusEnum.ACTIVE
		)
			cancelDownloadAndOrRemoveItFromList(url);
}

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Types:

type DownloadingBoxProps = Readonly<{
	download: MediaBeingDownloaded;
	downloadingIndex: number;
	url: string;
}>;
