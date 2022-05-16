import type { AllowedMedias } from "@common/utils";
import type { PrettyBytes } from "@common/prettyBytes";

import { pages } from "@utils/app";

export type Page = Readonly<typeof pages[number]>;
export type Path = Readonly<string>;
export type MediaID = Media["id"];

type DateAsNumber = Readonly<number>;

export type Media = Readonly<{
	dateOfArival: DateAsNumber;
	genres?: readonly string[];
	selected: boolean;
	size: PrettyBytes;
	favorite: boolean;
	duration: string;
	artist?: string;
	album?: string;
	title: string;
	img?: string;
	id: number;
	path: Path;
}>;

export type Mutable<T> = {
	-readonly [P in keyof T]: T[P] extends ReadonlyArray<infer U> ? U[] : T[P];
};

export type DownloadInfo = Readonly<{
	canStartDownload: boolean;
	extension: AllowedMedias;
	imageURL: string;
	title: string;
	url: string;
}>;

export type ConvertInfo = Readonly<{
	toExtension: AllowedMedias;
	canStartConvert: boolean;
	path: Path;
}>;

export enum ProgressStatus {
	WAITING,
	SUCCESS,
	CONVERT,
	ACTIVE,
	CANCEL,
	FAIL,
}

export enum ERROR_KIND {
	DOWNLOAD_TO_BE_CONFIRMED_NOT_ON_DOWNLOADS_TO_BE_CONFIRMED_LIST = "0",
	CONVERTION_TO_BE_CONFIRMED_NOT_ON_CONVERTS_TO_BE_CONFIRMED_LIST = "1",
	CONVERTION_TO_BE_CONFIRMED_NOT_ON_CONVERTING_LIST = "2",
	DOWNLOAD_TO_BE_CONFIRMED_NOT_ON_DOWNLOADING_LIST = "3",
	CREATE_CONVERSION_FAILED = "4",
	CREATE_DOWNLOAD_FAILED = "5",
}
