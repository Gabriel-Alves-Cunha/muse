import type { DownloadValues } from "@renderer/contexts/communicationBetweenChildren";
import type { Media, Path } from "./types";
import type { videoInfo } from "ytdl-core";

declare global {
	/* eslint-disable no-var */
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
		getInfo(url: string): Promise<void | Readonly<videoInfo>>;
	};
	fs: {
		getFullPathOfFilesForFilesInThisDirectory(
			dir: Path
		): Promise<readonly Path[]>;
		readdir(dir: Path): Promise<readonly Path[]>;
		readFile(path: Path): Promise<Readonly<Buffer>>;
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
		writeTags(pathOfMedia: Path, data: WriteTag): Promise<Readonly<boolean>>;
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
