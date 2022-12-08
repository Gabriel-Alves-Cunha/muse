import type { ValuesOf } from "@common/@types/utils";
import type { Path } from "@common/@types/generalTypes";

import { AiOutlineClose as CancelIcon } from "react-icons/ai";
import create from "zustand";

import { errorToast, infoToast, successToast } from "@components/toasts";
import { type AllowedMedias, formatDuration } from "@common/utils";
import { type ProgressProps, progressIcons } from "@components/Progress";
import { assertUnreachable } from "@utils/utils";
import { isDownloadList } from "@components/Downloading/helper";
import { progressStatus } from "@common/enums";
import { useTranslation } from "@i18n";
import { error, assert } from "@utils/log";
import { prettyBytes } from "@common/prettyBytes";
import { getBasename } from "@common/path";
import { emptyMap } from "@common/empty";
import { Button } from "@components/Button";
import { dbg } from "@common/debug";
import {
	getConvertingList,
	setConvertingList,
	useConvertingList,
} from "@contexts/convertList";

import { handleSingleItemDeleteAnimation } from "../Downloading/styles";

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Constants:

export const useNewConvertions = create<NewConvertions>(() => ({
	newConvertions: emptyMap,
}));

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
// Helper functions for Popup:

function cleanAllDoneConvertions(): void {
	for (const [url, download] of getConvertingList())
		if (
			download.status !==
				progressStatus.WAITING_FOR_CONFIRMATION_FROM_ELECTRON &&
			download.status !== progressStatus.ACTIVE
		)
			cancelConversionAndOrRemoveItFromList(url);
}

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////

const ConvertBox = ({
	mediaBeingConverted: { toExtension, timeConverted, sizeConverted, status },
	convertionIndex,
	path,
}: ConvertBoxProps) => {
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
};

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////

export function createNewConvertion(
	convertInfo: ConvertInfo,
	path: Readonly<Path>,
): MessagePort {
	const convertingList = getConvertingList();

	dbg("Trying to create a new conversion...", { convertingList });

	if (convertingList.has(path)) {
		const { t } = useTranslation();

		const info = `${t("toasts.convertAlreadyExists")}"${path}"!`;

		infoToast(info);
		error(info, convertingList);
		throw new Error(info);
	}

	// MessageChannels are lightweight, it's cheap to create
	// a new one for each request. They will be used to
	// communicate the progress and status of each download.
	const { port1: frontEndPort, port2: backEndPort } = new MessageChannel();

	// Add new conversion to the list:
	setConvertingList(
		new Map(convertingList).set(path, {
			status: progressStatus.WAITING_FOR_CONFIRMATION_FROM_ELECTRON,
			toExtension: convertInfo.toExtension,
			port: frontEndPort,
			timeConverted: 0,
			sizeConverted: 0,
		}),
	);

	// On every `postMessage` you have to send the path (as an ID)!
	frontEndPort.postMessage({ toExtension: convertInfo.toExtension, path });

	frontEndPort.addEventListener("close", logThatPortIsClosing);
	frontEndPort.addEventListener(
		"message",
		(e: MessageEvent<PartialExceptStatus>) =>
			handleUpdateConvertingList(e, path),
	);

	frontEndPort.start();

	return backEndPort;
}

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Helper functions for `createNewConvertion()`

export const logThatPortIsClosing = () => dbg("Closing ports (react port).");

/////////////////////////////////////////////
/////////////////////////////////////////////

export function cancelConversionAndOrRemoveItFromList(
	path: Readonly<string>,
): void {
	const convertingList = getConvertingList();

	const mediaBeingConverted = convertingList.get(path);

	if (!mediaBeingConverted)
		return error(
			`There should be a convertion with path "${path}"!\nconvertList =`,
			convertingList,
		);

	// Cancel conversion
	if (mediaBeingConverted.status === progressStatus.ACTIVE)
		mediaBeingConverted.port.postMessage({ destroy: true, path });

	// Remove from converting list
	const newConvertingList = new Map(convertingList);
	newConvertingList.delete(path);

	// Make React update:
	setConvertingList(newConvertingList);
}

/////////////////////////////////////////////
/////////////////////////////////////////////

function handleUpdateConvertingList(
	{ data }: MessageEvent<PartialExceptStatus>,
	path: Path,
): void {
	const convertingList = getConvertingList();

	dbg(`Received a message from Electron on port for "${path}":`, {
		convertingList,
		data,
	});

	// Assert that the download exists:
	const thisConversion = convertingList.get(path);
	if (thisConversion === undefined)
		return error(
			"Received a message from Electron but the path is not in the list!",
		);

	// Update `convertingList`:
	setConvertingList(
		new Map(convertingList).set(path, { ...thisConversion, ...data }),
	);

	const { t } = useTranslation();

	// Handle status:
	switch (data.status) {
		case progressStatus.FAILED: {
			// @ts-ignore => ^ In this case, `data` include an `error: Error` key:
			assert(data.error, "data.error should exist!");

			errorToast(
				`${t("toasts.conversionFailed")}${path}"! ${
					(data as typeof data & { error: Error }).error.message
				}`,
			);

			cancelConversionAndOrRemoveItFromList(path);
			break;
		}

		case progressStatus.SUCCESS: {
			successToast(`${t("toasts.conversionSuccess")}"${path}"!`);

			cancelConversionAndOrRemoveItFromList(path);
			break;
		}

		case progressStatus.CANCEL: {
			infoToast(`${t("toasts.conversionCanceled")}"${path}"!`);

			cancelConversionAndOrRemoveItFromList(path);
			break;
		}

		case progressStatus.WAITING_FOR_CONFIRMATION_FROM_ELECTRON:
		case progressStatus.ACTIVE:
		case undefined:
			break;

		default:
			assertUnreachable(data.status);
			break;
	}
}

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Types:

export type MediaBeingConverted = {
	status: ProgressProps["status"];
	toExtension: AllowedMedias;
	sizeConverted: number;
	timeConverted: number;
	port: MessagePort;
};

/////////////////////////////////////////////

type ConvertBoxProps = {
	mediaBeingConverted: MediaBeingConverted;
	convertionIndex: number;
	path: Path;
};

/////////////////////////////////////////////

export type ConvertInfo = { toExtension: AllowedMedias };

/////////////////////////////////////////////

interface PartialExceptStatus extends Partial<MediaBeingConverted> {
	status: ValuesOf<typeof progressStatus>;
}

/////////////////////////////////////////////

type NewConvertions = Readonly<{
	newConvertions: ReadonlyMap<Path, ConvertInfo>;
}>;
