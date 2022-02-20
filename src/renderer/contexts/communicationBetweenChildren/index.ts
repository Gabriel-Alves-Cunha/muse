import type { ExtensionToBeConvertedTo } from "@common/@types/electron-window";
import type { DownloadValues, Path } from "@common/@types/typesAndEnums";

import create from "zustand";

import { assertUnreachable } from "@utils/utils";
import { TypeOfMsgObject } from "@common/@types/typesAndEnums";
import { dbg } from "@common/utils";

const defaultDownloadValues: DownloadValues = Object.freeze({
	canStartDownload: false,
	imageURL: "",
	title: "",
	url: "",
});

export const useDownloadValues = create<{
	downloadValues: DownloadValues;
}>(() => ({
	downloadValues: defaultDownloadValues,
}));

export const useConvertValues = create<{
	convertValues: ConvertValues[];
}>(() => ({
	convertValues: [],
}));

const { setState: setDownloadValuesState } = useDownloadValues;
const { setState: setConvertValuesState } = useConvertValues;

export function sendMsg(action: Action) {
	switch (action.type) {
		case MsgType.START_DOWNLOAD: {
			setDownloadValuesState({
				downloadValues: {
					imageURL: action.value.imageURL,
					title: action.value.title,
					canStartDownload: true,
					url: action.value.url,
				},
			});
			break;
		}

		case MsgType.RESET_DOWNLOAD_VALUES: {
			setDownloadValuesState({ downloadValues: defaultDownloadValues });
			break;
		}

		case MsgType.RESET_CONVERT_VALUES: {
			setConvertValuesState({ convertValues: [] });
			break;
		}

		case MsgType.START_CONVERT: {
			setConvertValuesState({
				convertValues: action.value.map(values => ({
					toExtension: values.toExtension,
					canStartConvert: true,
					path: values.path,
				})),
			});
			break;
		}

		default: {
			assertUnreachable(action);
			break;
		}
	}
}

const handleDownloadMedia = (value: DownloadValues) =>
	sendMsg({ type: MsgType.START_DOWNLOAD, value });

// TODO: SEE THIS:
window.electron?.notificationApi.receiveMsgFromElectron(object => {
	dbg("Received 'async-msg' from Electron on React side.\nobject =", object);

	switch (object.type) {
		case TypeOfMsgObject.DOWNLOAD_MEDIA: {
			handleDownloadMedia(object.params);
			break;
		}

		default: {
			console.error(
				"This 'async-msg' event has no receiver function!\nobject =",
				object,
			);
			break;
		}
	}
});

export type ConvertValues = Readonly<{
	toExtension: ExtensionToBeConvertedTo;
	canStartConvert: boolean;
	path: Path;
}>;

type Action =
	| Readonly<{ type: MsgType.START_CONVERT; value: readonly ConvertValues[] }>
	| Readonly<{ type: MsgType.START_DOWNLOAD; value: DownloadValues }>
	| Readonly<{ type: MsgType.RESET_DOWNLOAD_VALUES }>
	| Readonly<{ type: MsgType.RESET_CONVERT_VALUES }>;

export enum MsgType {
	RESET_DOWNLOAD_VALUES,
	RESET_CONVERT_VALUES,
	START_DOWNLOAD,
	START_CONVERT,
}
