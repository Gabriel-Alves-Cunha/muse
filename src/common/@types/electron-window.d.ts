/* eslint-disable no-var */
import type { AxiosRequestConfig, AxiosResponse } from "axios";
import type { DownloadValues } from "@renderer/contexts/communicationBetweenChildren";
import type { Media, Path } from "./types";
import type { videoInfo } from "ytdl-core";

declare global {
	var twoWayComm_React_Electron: MessagePort | undefined;
	var electron: VisibleElectron;
}

type VisibleElectron = Readonly<{
	notificationApi: {
		sendNotificationToElectron(
			object: Readonly<{
				type: NotificationType;
				msg?: string;
			}>
		): void;
		receiveMsgFromElectron(handleMsg: (msgObject: MsgObject) => void): void;
		request<ConfigType>(
			config: AxiosRequestConfig<ConfigType>
		): Promise<void | AxiosResponse<unknown, ConfigType>>;
		getInfo(url: string): Promise<void | videoInfo>;
	};
	fs: {
		getFullPathOfFilesForFilesInThisDirectory(
			dir: Path
		): Promise<readonly Path[]>;
		readdir(dir: Path): Promise<readonly Path[]>;
		readFile(path: Path): Promise<Buffer>;
		rm(path: Path): Promise<void>;
	};
	os: {
		homeDir: Path;
		dirs: {
			documents: Path;
			downloads: Path;
			music: Path;
		};
	};
	media: {
		transformPathsToMedias(paths: readonly Path[]): Promise<readonly Media[]>;
		convertToAudio(mediaPath: Path, extension: ExtensionToBeConvertedTo): void;
		writeTags(pathOfMedia: Path, data: WriteTag): Promise<boolean>;
	};
}>;

export type MsgObject = Readonly<{
	type: "download media";
	params: DownloadValues;
}>;

export type WriteTag = Readonly<{
	genres?: readonly string[];
	imageURL?: string;
	artist?: string;
	album?: string;
	title?: string;
}>;

export type NotificationType = "quitApp" | "maximize" | "minimize";
export type ExtensionToBeConvertedTo = "mp3";
export type ListenToNotification =
	| "refresh-all-media"
	| "refresh media"
	| "remove media"
	| "add media"
	| "del media";
