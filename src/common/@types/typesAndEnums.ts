import { folders } from "@utils/app";

export type Page = Readonly<typeof folders[number]>;
export type PrettyBytes = Readonly<string>;
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

export enum NotificationType {
	MAXIMIZE,
	MINIMIZE,
	QUIT_APP,
}
export enum ListenToNotification {
	REFRESH_ALL_MEDIA,
	REFRESH_MEDIA,
	REMOVE_MEDIA,
	ADD_MEDIA,
	DEL_MEDIA,
}

export enum TypeOfMsgObject {
	DOWNLOAD_MEDIA,
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
