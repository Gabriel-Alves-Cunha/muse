import type { Media, Path } from "./typesAndEnums";
import type { videoInfo } from "ytdl-core";

import { TypeOfMsgObject } from "./typesAndEnums";

declare global {
	/* eslint-disable no-var */
	var runtimeGlobalsChecker: { getRuntimeGlobals: () => string[] };
	var twoWayComm_React_Electron: MessagePort | undefined;
	var electron: VisibleElectron;
}

type VisibleElectron = Readonly<{
	notificationApi: {
		sendNotificationToElectron(
			object: Readonly<{
				type: NotificationType;
				msg?: string;
			}>,
		): void;
		receiveMsgFromElectron(handleMsg: (msgObject: MsgObject) => void): void;
	};
	fs: {
		getFullPathOfFilesForFilesInThisDirectory(
			dir: Path,
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
		getInfo(url: string): Promise<void | Readonly<videoInfo>>;
	};
}>;

export type MsgObject = Readonly<{
	type: TypeOfMsgObject.DOWNLOAD_MEDIA;
	params: DownloadValues;
}>;

export type WriteTag = Readonly<{
	genres?: readonly string[];
	albumArtists?: string;
	imageURL?: string;
	album?: string;
	title?: string;
}>;

export type ExtensionToBeConvertedTo = "mp3";
