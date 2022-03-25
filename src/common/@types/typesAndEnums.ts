import type { PrettyBytes } from "@common/prettyBytes";

import { pages } from "@utils/app";

export type Page = Readonly<typeof pages[number]>;
export type Path = Readonly<string>;

type DateAsNumber = Readonly<number>;

export type Media = Readonly<{
	dateOfArival: DateAsNumber;
	genres?: readonly string[];
	size: PrettyBytes;
	duration: string;
	artist?: string;
	album?: string;
	title: string;
	index: number;
	img?: string;
	id: number;
	path: Path;
}>;

export enum NotificationEnum {
	DOWNLOAD_MEDIA,
	WRITE_TAG,
	MAXIMIZE,
	MINIMIZE,
	QUIT_APP,
}
export enum ListenToNotification {
	DELETE_ONE_MEDIA_FROM_COMPUTER,
	REFRESH_ALL_MEDIA,
	REFRESH_ONE_MEDIA,
	REMOVE_ONE_MEDIA,
	ADD_ONE_MEDIA,
}

export type Mutable<T> = {
	-readonly [P in keyof T]: T[P] extends ReadonlyArray<infer U> ? U[] : T[P];
};

export type DownloadValues = Readonly<{
	canStartDownload: boolean;
	imageURL: string;
	title: string;
	url: string;
}>;

export enum ProgressStatus {
	SUCCESS,
	CONVERT,
	ACTIVE,
	CANCEL,
	FAIL,
}
