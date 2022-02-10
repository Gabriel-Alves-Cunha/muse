import type { ExtensionToBeConvertedTo } from "@common/@types/electron-window";
import type { Path } from "@common/@types/typesAndEnums";

import create from "zustand";

import { assertUnreachable } from "@utils/utils";

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
		case Type.START_DOWNLOAD: {
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

		case Type.RESET_DOWNLOAD_VALUES: {
			setDownloadValuesState({ downloadValues: defaultDownloadValues });
			break;
		}

		case Type.RESET_CONVERT_VALUES: {
			setConvertValuesState({ convertValues: [] });
			break;
		}

		case Type.START_CONVERT: {
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

export type ConvertValues = Readonly<{
	toExtension: ExtensionToBeConvertedTo;
	canStartConvert: boolean;
	path: Path;
}>;

export type DownloadValues = Readonly<{
	canStartDownload: boolean;
	imageURL: string;
	title: string;
	url: string;
}>;

type Action =
	| Readonly<{ type: Type.START_CONVERT; value: readonly ConvertValues[] }>
	| Readonly<{ type: Type.START_DOWNLOAD; value: DownloadValues }>
	| Readonly<{ type: Type.RESET_DOWNLOAD_VALUES }>
	| Readonly<{ type: Type.RESET_CONVERT_VALUES }>;

export enum Type {
	RESET_DOWNLOAD_VALUES,
	RESET_CONVERT_VALUES,
	START_DOWNLOAD,
	START_CONVERT,
}
