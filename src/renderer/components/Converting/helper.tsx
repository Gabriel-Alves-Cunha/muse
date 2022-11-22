import type { ValuesOf } from "@common/@types/utils";
import type { Path } from "@common/@types/generalTypes";

import { AiOutlineClose as Cancel } from "react-icons/ai";

import { errorToast, infoToast, successToast } from "@components/toasts";
import { type AllowedMedias, formatDuration } from "@common/utils";
import { type ProgressProps, progressIcons } from "@components/Progress";
import { assertUnreachable } from "@utils/utils";
import { isDownloadList } from "@components/Downloading/helper";
import { progressStatus } from "@common/enums";
import { convertingList } from "@contexts/convertList";
import { t, Translator } from "@components/I18n";
import { prettyBytes } from "@common/prettyBytes";
import { getBasename } from "@common/path";
import { Button } from "@components/Button";
import { dbg } from "@common/debug";

import { handleSingleItemDeleteAnimation } from "../Downloading/styles";
import { observable } from "@legendapp/state";
import { useSelector, For } from "@legendapp/state/react";

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Constants:

export const newConvertions = observable<Map<Path, ConvertInfo>>(new Map());

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////

export function Popup() {
	const convertingList_ = useSelector(() => convertingList.get());

	return convertingList_.size > 0 ? (
		<>
			<Button variant="medium" onPointerUp={cleanAllDoneConvertions}>
				<Translator path="buttons.cleanFinished" />
			</Button>

			{Array.from(convertingList_, ([path, convertingMedia], index) => (
				<ConvertBox
					mediaBeingConverted={convertingMedia}
					convertionIndex={index}
					path={path}
					key={path}
				/>
			))}
		</>
	) : (
		<p>
			<Translator path="infos.noConversionsInProgress" />
		</p>
	);
}

/////////////////////////////////////////////
// Helper functions for Popup:

function cleanAllDoneConvertions(): void {
	for (const [url, download] of convertingList.peek())
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
}: ConvertBoxProps) => (
	<div className="item relative flex flex-col w-60 h-16 border-[1px] border-solid border-opacity-70 rounded-md p-2 animate-none">
		<div className="relative flex justify-start items-center w-[90%] h-4 mb-2">
			<p className="text-alternative whitespace-nowrap font-primary text-sm text-left overflow-hidden w-[90%]">
				{`${getBasename(path)}.${toExtension}`}
			</p>

			<button
				className="absolute flex w-5 h-5 -right-5 cursor-pointer bg-none rounded-full border-none hover:bg-icon-button-hovered focus:bg-icon-button-hovered no-transition"
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
				<Cancel className="w-3 h-3 fill-gray-600" />
			</button>
		</div>

		<div className="flex justify-between whitespace-nowrap text-muted font-primary text-sm tracking-wide overflow-hidden text-left">
			{`${t("infos.converted")} ${formatDuration(
				timeConverted,
			)} s / ${prettyBytes(sizeConverted)}`}

			<span className="text-white mr-1">{progressIcons.get(status)}</span>
		</div>
	</div>
);

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////

export function createNewConvertion(
	convertInfo: ConvertInfo,
	path: Readonly<Path>,
): MessagePort {
	const convertingList_ = convertingList.peek();

	dbg("Trying to create a new conversion...", { convertingList_ });

	if (convertingList_.has(path)) {
		const info = `${t("toasts.convertAlreadyExists")}"${path}"!`;

		infoToast(info);

		console.error(info, convertingList_);
		throw new Error(info);
	}

	// MessageChannels are lightweight, it's cheap to create
	// a new one for each request. They will be used to
	// communicate the progress and status of each download.
	const { port1: frontEndPort, port2: backEndPort } = new MessageChannel();

	// Add new conversion to the list:
	convertingList_.set(path, {
		status: progressStatus.WAITING_FOR_CONFIRMATION_FROM_ELECTRON,
		toExtension: convertInfo.toExtension,
		port: frontEndPort,
		timeConverted: 0,
		sizeConverted: 0,
	});

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
	const convertingList_ = convertingList.peek();

	const mediaBeingConverted = convertingList_.get(path);

	if (mediaBeingConverted === undefined)
		return console.error(
			`There should be a convertion with path "${path}"!\nconvertList =`,
			convertingList_,
		);

	// Cancel conversion
	if (mediaBeingConverted.status === progressStatus.ACTIVE)
		mediaBeingConverted.port.postMessage({ destroy: true, path });

	// Remove from converting list:
	convertingList_.delete(path);
}

/////////////////////////////////////////////
/////////////////////////////////////////////

function handleUpdateConvertingList(
	{ data }: MessageEvent<PartialExceptStatus>,
	path: Path,
): void {
	const convertingList_ = convertingList.peek();

	dbg(`Received a message from Electron on port for "${path}":`, {
		convertingList_,
		data,
	});

	// Assert that the download exists:
	const thisConversion = convertingList_.get(path);
	if (thisConversion === undefined)
		return console.error(
			"Received a message from Electron but the path is not in the list!",
		);

	// Update `convertingList`:
	convertingList_.set(path, { ...thisConversion, ...data });

	// Handle status:
	switch (data.status) {
		case progressStatus.FAILED: {
			// @ts-ignore => ^ In this case, `data` include an `error: Error` key:
			console.assert(data.error, "data.error should exist!");

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

export type MediaBeingConverted = Readonly<{
	status: ProgressProps["status"];
	toExtension: AllowedMedias;
	sizeConverted: number;
	timeConverted: number;
	port: MessagePort;
}>;

/////////////////////////////////////////////

type ConvertBoxProps = Readonly<{
	mediaBeingConverted: MediaBeingConverted;
	convertionIndex: number;
	path: Path;
}>;

/////////////////////////////////////////////

export type ConvertInfo = Readonly<{ toExtension: AllowedMedias }>;

/////////////////////////////////////////////

interface PartialExceptStatus extends Partial<MediaBeingConverted> {
	status: ValuesOf<typeof progressStatus>;
}
