import type { Path } from "types/generalTypes";

import { AiOutlineClose as CancelIcon } from "react-icons/ai";

import { getConvertingList, useConvertingList } from "@contexts/convertList";
import { isDownloadList } from "../Downloading/Popup";
import { ProgressStatus } from "@utils/enums";
import { formatDuration } from "@utils/utils";
import { useTranslation } from "@i18n";
import { progressIcons } from "@components/Progress";
import { prettyBytes } from "@utils/prettyBytes";
import { getBasename } from "@utils/path";
import { Button } from "../Button";
import {
	cancelConversionAndOrRemoveItFromList,
	MediaBeingConverted,
} from "./helper";

import { handleSingleItemDeleteAnimation } from "@components/Downloading/styles";

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////

export function Popup() {
	const { convertingList } = useConvertingList();
	const { t } = useTranslation();

	return convertingList.size > 0 ? (
		<>
			<Button variant="medium" onPointerUp={cleanAllDoneConvertions}>
				{t("buttons.cleanFinished")}
			</Button>

			{Array.from(convertingList, ([path, convertingMedia], index) => (
				<ConvertBox
					mediaBeingConverted={convertingMedia}
					convertionIndex={index}
					path={path}
					key={path}
				/>
			))}
		</>
	) : (
		<p>{t("infos.noConversionsInProgress")}</p>
	);
}

/////////////////////////////////////////////

function ConvertBox({
	mediaBeingConverted: { toExtension, timeConverted, sizeConverted, status },
	convertionIndex,
	path,
}: ConvertBoxProps) {
	const { t } = useTranslation();

	return (
		<div className="box">
			<div className="left">
				<p>{`${getBasename(path)}.${toExtension}`}</p>

				{`${t("infos.converted")} ${formatDuration(
					timeConverted,
				)} / ${prettyBytes(sizeConverted)}`}
			</div>

			<div className="right">
				<button
					onPointerUp={(e) =>
						handleSingleItemDeleteAnimation(
							e,
							convertionIndex,
							!isDownloadList,
							path,
						)
					}
					title={t("tooltips.cancelConversion")}
				>
					<CancelIcon size={13} />
				</button>

				{progressIcons.get(status)}
			</div>
		</div>
	);
}

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Helper functions for Popup:

function cleanAllDoneConvertions(): void {
	for (const [url, download] of getConvertingList())
		if (
			download.status !==
				ProgressStatus.WAITING_FOR_CONFIRMATION &&
			download.status !== ProgressStatus.ACTIVE
		)
			cancelConversionAndOrRemoveItFromList(url);
}

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Types:

type ConvertBoxProps = {
	mediaBeingConverted: MediaBeingConverted;
	convertionIndex: number;
	path: Path;
};
