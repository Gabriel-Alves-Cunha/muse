import type { AllowedMedias } from "@common/utils";
import type { ProgressProps } from "../Progress";
import type { ValuesOf } from "@common/@types/utils";
import type { Path } from "@common/@types/generalTypes";

import { ProgressStatus, ReactToElectronMessage } from "@common/enums";
import { errorToast, infoToast, successToast } from "../toasts";
import { assertUnreachable } from "@utils/utils";
import { sendMsgToBackend } from "@common/crossCommunication";
import { convertingList } from "@contexts/convertList";
import { error, assert } from "@common/log";
import { translation } from "@i18n";
import { dbg } from "@common/debug";

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Main function:

export function createNewConvertion(
	convertInfo: ConvertInfo,
	path: Path,
): void {
	dbg("Trying to create a new conversion.", { convertingList });

	if (convertingList.has(path)) {
		const { t } = translation;

		const info = `${t("toasts.convertAlreadyExists")}"${path}"!`;

		infoToast(info);

		return error(info, convertingList);
	}

	// MessageChannels are lightweight, it's cheap to create
	// a new one for each request. They will be used to
	// communicate the progress and status of each download.
	const { port1: frontEndPort, port2: backEndPort } = new MessageChannel();

	// Sending port so we can communicate with electron:
	sendMsgToBackend({ type: ReactToElectronMessage.CONVERT_MEDIA }, backEndPort);

	// Add new conversion to the list:
	convertingList.set(path, {
		status: ProgressStatus.WAITING_FOR_CONFIRMATION_FROM_ELECTRON,
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
	const mediaBeingConverted = convertingList.get(path);

	if (!mediaBeingConverted)
		return error(`"${path}" not found! convertList =`, convertingList);

	// Cancel conversion
	if (mediaBeingConverted.status === ProgressStatus.ACTIVE)
		mediaBeingConverted.port.postMessage({ destroy: true, path });

	// Remove from converting list
	convertingList.delete(path);
}

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////

function handleUpdateConvertingList(
	{ data }: MessageEvent<PartialExceptStatus>,
	path: Path,
): void {
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
	convertingList.set(path, { ...thisConversion, ...data });

	const { t } = translation;

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
