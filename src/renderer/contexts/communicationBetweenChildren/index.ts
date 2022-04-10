import type {
	DownloadValues,
	ConvertValues,
} from "@common/@types/typesAndEnums";

import create from "zustand";

import { ReactElectronAsyncMessageEnum } from "@common/@types/electron-window";
import { assertUnreachable } from "@utils/utils";
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
	convertValues: readonly ConvertValues[];
}>(() => ({
	convertValues: [],
}));

const { setState: setDownloadValuesState } = useDownloadValues;
const { setState: setConvertValuesState } = useConvertValues;

export function sendMsg(action: Action) {
	switch (action.type) {
		case MsgEnum.START_DOWNLOAD: {
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

		case MsgEnum.RESET_DOWNLOAD_VALUES: {
			setDownloadValuesState({ downloadValues: defaultDownloadValues });
			break;
		}

		case MsgEnum.RESET_CONVERT_VALUES: {
			setConvertValuesState({ convertValues: [] });
			break;
		}

		case MsgEnum.START_CONVERT: {
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
	sendMsg({ type: MsgEnum.START_DOWNLOAD, value });

globalThis.electron?.notificationApi.receiveMsgFromElectron(object => {
	dbg("Received 'async-msg' from Electron on React side.\nobject =", object);

	switch (object.type) {
		case ReactElectronAsyncMessageEnum.DOWNLOAD_MEDIA: {
			handleDownloadMedia(object.downloadValues);
			break;
		}

		default: {
			console.error(
				"This event has no receiver function on `receiveMsgFromElectron()`!\nobject =",
				object,
			);
			break;
		}
	}
});

type Action =
	| Readonly<{ type: MsgEnum.START_CONVERT; value: readonly ConvertValues[] }>
	| Readonly<{ type: MsgEnum.START_DOWNLOAD; value: DownloadValues }>
	| Readonly<{ type: MsgEnum.RESET_DOWNLOAD_VALUES }>
	| Readonly<{ type: MsgEnum.RESET_CONVERT_VALUES }>;

export enum MsgEnum {
	RESET_DOWNLOAD_VALUES,
	RESET_CONVERT_VALUES,
	START_DOWNLOAD,
	START_CONVERT,
}
