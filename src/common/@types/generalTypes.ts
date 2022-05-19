import type { AllowedMedias } from "../utils";
import type { PrettyBytes } from "../prettyBytes";

import { pages } from "@utils/app";

export type Page = Readonly<typeof pages[number]>;
export type Path = Readonly<string>;

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