import type { Path } from "@common/@types/GeneralTypes";

import { AiOutlineClose as CancelIcon } from "react-icons/ai";
import { useCallback } from "react";

import { convertingListRef, getConvertingList } from "@contexts/convertList";
import { selectT, useTranslator } from "@i18n";
import { ProgressStatusEnum } from "@common/enums";
import { IS_DOWNLOAD_LIST } from "../Downloading/Popup";
import { formatDuration } from "@common/utils";
import { progressIcons } from "@components/Progress";
import { prettyBytes } from "@common/prettyBytes";
import { getBasename } from "@common/path";
import { Button } from "../Button";
import {
	cancelConversionAndOrRemoveItFromList,
	MediaBeingConverted,
} from "./helper";

import { handleSingleItemDeleteAnimation } from "@components/Downloading/styles";

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////

export function Popup(): JSX.Element {
	const convertingList = convertingListRef().current;
	const t = useTranslator(selectT);

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
}: ConvertBoxProps): JSX.Element {
	const t = useTranslator(selectT);

	const onPointerUp = useCallback(
		(e: React.PointerEvent<HTMLButtonElement>) =>
			handleSingleItemDeleteAnimation(
				e,
				convertionIndex,
				!IS_DOWNLOAD_LIST,
				path,
			),
		[convertionIndex, path],
	);

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
					title={t("tooltips.cancelConversion")}
					onPointerUp={onPointerUp}
					type="button"
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
				ProgressStatusEnum.WAITING_FOR_CONFIRMATION_FROM_ELECTRON &&
			download.status !== ProgressStatusEnum.ACTIVE
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
