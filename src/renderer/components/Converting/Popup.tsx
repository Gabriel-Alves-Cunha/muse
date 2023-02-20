import type { Path } from "@common/@types/generalTypes";

import { AiOutlineClose as CancelIcon } from "react-icons/ai";
import { useSnapshot } from "valtio";

import { convertingList } from "@contexts/convertList";
import { isDownloadList } from "../Downloading/Popup";
import { ProgressStatus } from "@common/enums";
import { formatDuration } from "@common/utils";
import { progressIcons } from "@components/Progress";
import { prettyBytes } from "@common/prettyBytes";
import { getBasename } from "@common/path";
import { translation } from "@i18n";
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
	const convertingListAccessor = useSnapshot(convertingList);
	const translationAccessor = useSnapshot(translation);
	const t = translationAccessor.t;

	return convertingListAccessor.size > 0 ? (
		<>
			<Button variant="medium" onPointerUp={cleanAllDoneConvertions}>
				{t("buttons.cleanFinished")}
			</Button>

			{Array.from(convertingListAccessor, ([path, convertingMedia], index) => (
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
	const translationAccessor = useSnapshot(translation);
	const t = translationAccessor.t;

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
	for (const [url, download] of convertingList)
		if (
			download.status !==
				ProgressStatus.WAITING_FOR_CONFIRMATION_FROM_ELECTRON &&
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
