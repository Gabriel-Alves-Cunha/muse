import type { AllowedMedias } from "@common/utils";
import type { ProgressProps } from "../Progress";
import type { ValuesOf } from "@common/@types/Utils";
import type { Path } from "@common/@types/GeneralTypes";

import { ProgressStatusEnum, ReactToElectronMessageEnum } from "@common/enums";
import { errorToast, infoToast, successToast } from "../toasts";
import { assertUnreachable } from "@utils/utils";
import { sendMsgToBackend } from "@common/crossCommunication";
import { error, assert } from "@common/log";
import { dbg } from "@common/debug";
import { t } from "@i18n";
import {
	convertingListRef,
	getConvertingList,
	setConvertingList,
} from "@contexts/convertList";

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Main function:

export function createNewConvertion(
	convertInfo: ConvertInfo,
	path: Path,
): void {
	dbg("Trying to create a new conversion.", { convertingListRef });

	const convertingList = getConvertingList();

	if (convertingList.has(path)) {
		const info = `${t("toasts.convertAlreadyExists")}"${path}"!`;

		infoToast(info);

		error(info, convertingList);

		return;
	}

	// MessageChannels are lightweight, it's cheap to create
	// a new one for each request. They will be used to
	// communicate the progress and status of each download.
	const { port1: frontEndPort, port2: backEndPort } = new MessageChannel();

	// Sending port so we can communicate with electron:
	sendMsgToBackend(
		{ type: ReactToElectronMessageEnum.CONVERT_MEDIA },
		backEndPort,
	);

	// Add new conversion to the list:
	setConvertingList(
		new Map(convertingList).set(path, {
			status: ProgressStatusEnum.WAITING_FOR_CONFIRMATION_FROM_ELECTRON,
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
}

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Helper functions for `createNewConvertion()`:

export const logThatPortIsClosing = (): void =>
	dbg("Closing ports (react port).");

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////

export function cancelConversionAndOrRemoveItFromList(path: string): void {
	const convertingList = getConvertingList();
	const mediaBeingConverted = convertingList.get(path);

	if (!mediaBeingConverted) {
		error(`"${path}" not found! convertList =`, convertingListRef);

		return;
	}

	// Cancel conversion
	if (mediaBeingConverted.status === ProgressStatusEnum.ACTIVE)
		mediaBeingConverted.port.postMessage({ destroy: true, path });

	// Remove from converting list
	const newConvertingList = new Map(convertingList);
	newConvertingList.delete(path);

	setConvertingList(newConvertingList);
}

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////

function handleUpdateConvertingList(
	{ data }: MessageEvent<PartialExceptStatus>,
	path: Path,
): void {
	dbg(`Received a message from Electron on port for "${path}":`, {
		convertingListRef,
		data,
	});

	const convertingList = getConvertingList();

	// Assert that the download exists:
	const thisConversion = convertingList.get(path);
	if (!thisConversion) {
		error("Received a message from Electron but the path is not in the list!");

		return;
	}

	// Update `convertingList`:
	setConvertingList(
		new Map(convertingList).set(path, { ...thisConversion, ...data }),
	);

	// Handle status:
	switch (data.status) {
		case ProgressStatusEnum.FAILED: {
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

		case ProgressStatusEnum.SUCCESS: {
			successToast(`${t("toasts.conversionSuccess")}"${path}"!`);

			cancelConversionAndOrRemoveItFromList(path);
			break;
		}

		case ProgressStatusEnum.CANCEL: {
			infoToast(`${t("toasts.conversionCanceled")}"${path}"!`);

			cancelConversionAndOrRemoveItFromList(path);
			break;
		}

		case ProgressStatusEnum.WAITING_FOR_CONFIRMATION_FROM_ELECTRON:
		case ProgressStatusEnum.ACTIVE:
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
	status: ValuesOf<typeof ProgressStatusEnum>;
};
