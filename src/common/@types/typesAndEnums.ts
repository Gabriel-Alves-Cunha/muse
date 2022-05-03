import type { ExtensionToBeConvertedTo } from "./electron-window";
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
	toExtension: ExtensionToBeConvertedTo;
	canStartConvert: boolean;
	path: Path;
}>;

export enum ProgressStatus {
	SUCCESS,
	CONVERT,
	ACTIVE,
	CANCEL,
	FAIL,
}
