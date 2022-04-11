import type {
	DownloadValues,
	ConvertValues,
} from "@common/@types/typesAndEnums";

import create from "zustand";

import { assertUnreachable } from "@utils/utils";

const defaultDownloadValues: DownloadValues = Object.freeze({
	canStartDownload: false,
	imageURL: "",
	title: "",
	url: "",
} as const);

// This prevents an infinite loop:
const constRefToEmptyArray = Object.freeze([]);

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
		case MsgBetweenChildrenEnum.START_DOWNLOAD: {
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

		case MsgBetweenChildrenEnum.RESET_DOWNLOAD_VALUES: {
			setDownloadValuesState({ downloadValues: defaultDownloadValues });
			break;
		}

		case MsgBetweenChildrenEnum.RESET_CONVERT_VALUES: {
			setConvertValuesState({ convertValues: constRefToEmptyArray });
			break;
		}

		case MsgBetweenChildrenEnum.START_CONVERT: {
			setConvertValuesState({
				convertValues: action.values.map(values => ({
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

type Action =
	| Readonly<{ type: MsgBetweenChildrenEnum.RESET_DOWNLOAD_VALUES }>
	| Readonly<{ type: MsgBetweenChildrenEnum.RESET_CONVERT_VALUES }>
	| Readonly<{
			type: MsgBetweenChildrenEnum.START_CONVERT;
			values: readonly ConvertValues[];
	  }>
	| Readonly<{
			type: MsgBetweenChildrenEnum.START_DOWNLOAD;
			value: DownloadValues;
	  }>;

export enum MsgBetweenChildrenEnum {
	RESET_DOWNLOAD_VALUES,
	RESET_CONVERT_VALUES,
	START_DOWNLOAD,
	START_CONVERT,
}
