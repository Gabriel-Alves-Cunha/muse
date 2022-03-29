import type { videoInfo } from "ytdl-core";
import type {
	NotificationEnum,
	DownloadValues,
	Media,
	Path,
} from "./typesAndEnums";

import { ChangeOptionsToSend } from "@components/MediaListKind/MediaOptions/Change";

declare global {
	/* eslint-disable no-var */
	var runtimeGlobalsChecker: { getRuntimeGlobals: () => string[] };
	var twoWayComm_React_Electron: MessagePort | undefined;
	var electron: VisibleElectron;
}

type VisibleElectron = Readonly<{
	notificationApi: {
		receiveMsgFromElectron(handleMsg: (msgObject: MsgObject) => void): void;
		sendNotificationToElectron(object: MsgObject): void;
	};
	fs: {
		getFullPathOfFilesForFilesInThisDirectory(
			dir: Path,
		): Promise<readonly Path[]>;
		readFile(path: Path): Promise<Readonly<Buffer>>;
		readdir(dir: Path): Promise<readonly Path[]>;
		deleteFile(path: Path): Promise<void>;
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
		convertToAudio(mediaPath: Path, extension: ExtensionToBeConvertedTo): void;
		transformPathsToMedias(paths: readonly Path[]): Promise<readonly Media[]>;
		writeTags(pathOfMedia: Path, data: WriteTag): Promise<Readonly<boolean>>;
		getInfo(url: string): Promise<void | Readonly<videoInfo>>;
	};
}>;

export type MsgObject =
	| Readonly<{
			type: NotificationEnum.DOWNLOAD_MEDIA;
			params: DownloadValues;
	  }>
	| Readonly<{
			type: NotificationEnum.WRITE_TAG;
			details: {
				whatToSend: ChangeOptionsToSend;
				mediaPath: Path;
				value: string;
			};
	  }>
	| Readonly<{
			type: NotificationEnum;
	  }>;

export type WriteTag = Readonly<{
	albumArtists?: readonly string[];
	genres?: readonly string[];
	imageURL?: string;
	album?: string;
	title?: string;
}>;

export type ExtensionToBeConvertedTo = "mp3";

export type ImgString = `data:${string};base64,${string}`;
