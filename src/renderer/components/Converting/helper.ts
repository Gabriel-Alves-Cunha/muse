import type { AllowedMedias } from "@common/utils";
import type { ProgressProps } from "../Progress";
import type { ValuesOf } from "@common/@types/utils";
import type { Path } from "@common/@types/generalTypes";

import create from "zustand";

import { getConvertingList, setConvertingList } from "@contexts/convertList";
import { errorToast, infoToast, successToast } from "../toasts";
import { error, assert, throwErr } from "@common/log";
import { assertUnreachable } from "@utils/utils";
import { ProgressStatus } from "@common/enums";
import { useTranslation } from "@i18n";
import { emptyMap } from "@common/empty";
import { dbg } from "@common/debug";

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Constants:

export const useNewConvertions = create<NewConvertions>(() => ({
	newConvertions: emptyMap,
	toExtension: "mp3",
}));

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////

const { t } = useTranslation();

export function createNewConvertion(
	convertInfo: ConvertInfo,
	path: Path,
): MessagePort {
	const convertingList = getConvertingList();

	dbg("Trying to create a new conversion...", { convertingList });

	if (convertingList.has(path)) {
		const info = `${t("toasts.convertAlreadyExists")}"${path}"!`;

		error(info, convertingList);
		infoToast(info);
		throwErr(info);
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
// Helper functions for `createNewConvertion()`:

export const logThatPortIsClosing = () => dbg("Closing ports (react port).");

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////

export function cancelConversionAndOrRemoveItFromList(path: string): void {
	const convertingList = getConvertingList();

	const mediaBeingConverted = convertingList.get(path);

	if (!mediaBeingConverted)
		return error(
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
	if (!thisConversion)
		return error(
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
			assert(data.error, "data.error should exist!");

			errorToast(
				`${t("toasts.conversionFailed")}${path}"! ${
					(data as typeof data & { error: Error }).error.message
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

		case ProgressStatus.WAITING_FOR_CONFIRMATION_FROM_ELECTRON:
		case ProgressStatus.ACTIVE:
		case undefined:
			break;

		default:
			assertUnreachable(data.status);
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

export type ConvertInfo = { toExtension: AllowedMedias };

/////////////////////////////////////////////

type PartialExceptStatus = Partial<MediaBeingConverted> & {
	status: ValuesOf<typeof ProgressStatus>;
};

/////////////////////////////////////////////

type NewConvertions = Readonly<{
	newConvertions: ReadonlyMap<Path, ConvertInfo>;
	toExtension: AllowedMedias;
}>;
