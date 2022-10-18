import type { Values } from "@common/@types/utils";
import type { Path } from "@common/@types/generalTypes";

import { AiOutlineClose as Cancel } from "react-icons/ai";
import create from "zustand";

import { errorToast, infoToast, successToast } from "@styles/global";
import { type AllowedMedias, formatDuration } from "@common/utils";
import { type ProgressProps, progressIcons } from "@components/Progress";
import { assertUnreachable } from "@utils/utils";
import { isDownloadList } from "@components/Downloading/helper";
import { ProgressStatus } from "@common/enums";
import { t, Translator } from "@components/I18n";
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

import { CancelButton, ConvertionProgress } from "./styles";
import {
	handleSingleItemDeleteAnimation,
	TitleAndCancelWrapper,
	ItemWrapper,
} from "../Downloading/styles";

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

	return (convertingList.size > 0 ?
		(
			<>
				<Button variant="medium" onPointerUp={cleanAllDoneConvertions}>
					<Translator path="buttons.cleanFinished" />
				</Button>

				{Array.from(
					convertingList,
					([path, convertingMedia], index) => (
						<ConvertBox
							mediaBeingConverted={convertingMedia}
							convertionIndex={index}
							path={path}
							key={path}
						/>
					),
				)}
			</>
		) :
		(
			<p>
				<Translator path="infos.noConversionsInProgress" />
			</p>
		));
}

/////////////////////////////////////////////
// Helper functions for Popup:

function cleanAllDoneConvertions(): void {
	getConvertingList().forEach((download, url) => {
		if (
			download.status !==
				ProgressStatus.WAITING_FOR_CONFIRMATION_FROM_ELECTRON &&
			download.status !== ProgressStatus.ACTIVE
		)
			cancelConversionAndOrRemoveItFromList(url);
	});
}

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////

const ConvertBox = (
	{
		mediaBeingConverted: { toExtension, timeConverted, sizeConverted, status },
		convertionIndex,
		path,
	}: ConvertBoxProps,
) => (
	<ItemWrapper className="item">
		<TitleAndCancelWrapper>
			<p>{`${getBasename(path)}.${toExtension}`}</p>

			<CancelButton
				onPointerUp={e =>
					handleSingleItemDeleteAnimation(
						e,
						convertionIndex,
						!isDownloadList,
						path,
					)}
				aria-label={t("tooltips.cancelConversion")}
				title={t("tooltips.cancelConversion")}
				className="notransition"
			>
				<Cancel size={12} />
			</CancelButton>
		</TitleAndCancelWrapper>

		<ConvertionProgress>
			{`${t("infos.converted")} ${formatDuration(timeConverted)} s / ${
				prettyBytes(sizeConverted)
			}`}
			<span>{progressIcons.get(status)}</span>
		</ConvertionProgress>
	</ItemWrapper>
);

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
		const info = `${t("toasts.convertAlreadyExists")}"${path}"!`;

		infoToast(info);

		console.error(info, convertingList);
		throw new Error(info);
	}

	// MessageChannels are lightweight, it's cheap to create
	// a new one for each request. They will be used to
	// communicate the progress and status of each download.
	const { port1: frontEndPort, port2: backEndPort } = new MessageChannel();

	// Add new conversion to the list:
	setConvertingList(
		new Map(convertingList).set(path, {
			status: ProgressStatus.WAITING_FOR_CONFIRMATION_FROM_ELECTRON,
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

	if (mediaBeingConverted === undefined)
		return console.error(
			`There should be a convertion with path "${path}"!\nconvertList =`,
			convertingList,
		);

	// Cancel conversion
	if (mediaBeingConverted.status === ProgressStatus.ACTIVE)
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
		return console.error(
			"Received a message from Electron but the path is not in the list!",
		);

	// Update `convertingList`:
	setConvertingList(
		new Map(convertingList).set(path, { ...thisConversion, ...data }),
	);

	// Handle status:
	switch (data.status) {
		case ProgressStatus.FAILED: {
			// @ts-ignore => ^ In this case, `data` include an `error: Error` key:
			console.assert(data.error, "data.error should exist!");

			errorToast(
				`${t("toasts.conversionFailed")}${path}"! ${
					(data as typeof data & { error: Error; }).error.message
				}`,
			);

			cancelConversionAndOrRemoveItFromList(path);
			break;
		}

		case ProgressStatus.SUCCESS: {
			successToast(`${t("toasts.conversionSuccess")}"${path}"!`);

			cancelConversionAndOrRemoveItFromList(path);
			break;
		}

		case ProgressStatus.CANCEL: {
			infoToast(`${t("toasts.conversionCanceled")}"${path}"!`);

			cancelConversionAndOrRemoveItFromList(path);
			break;
		}

		case ProgressStatus.ACTIVE:
			break;

		case undefined:
			break;

		case ProgressStatus.WAITING_FOR_CONFIRMATION_FROM_ELECTRON:
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

export type MediaBeingConverted = Readonly<
	{
		status: ProgressProps["status"];
		toExtension: AllowedMedias;
		sizeConverted: number;
		timeConverted: number;
		port: MessagePort;
	}
>;

/////////////////////////////////////////////

type ConvertBoxProps = Readonly<
	{
		mediaBeingConverted: MediaBeingConverted;
		convertionIndex: number;
		path: Path;
	}
>;

/////////////////////////////////////////////

export type ConvertInfo = Readonly<{ toExtension: AllowedMedias; }>;

/////////////////////////////////////////////

interface PartialExceptStatus extends Partial<MediaBeingConverted> {
	status: Values<typeof ProgressStatus>;
}

/////////////////////////////////////////////

type NewConvertions = Readonly<
	{ newConvertions: ReadonlyMap<Path, ConvertInfo>; }
>;
