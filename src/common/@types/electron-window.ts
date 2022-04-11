import type { ChangeOptionsToSend } from "@components/MediaListKind/MediaOptions";
import type { videoInfo } from "ytdl-core";
import type {
	DownloadValues,
	ConvertValues,
	Media,
	Path,
} from "./typesAndEnums";

declare global {
	/* eslint-disable no-var */
	var runtimeGlobalsChecker: { getRuntimeGlobals: () => string[] };
	var electron: VisibleElectron;
}

type VisibleElectron = Readonly<{
	notificationApi: {
		sendNotificationToElectronIpcMainProcess(
			object: Readonly<{
				type: ElectronIpcMainProcessNotificationEnum;
				msg?: string;
			}>,
		): void;
		receiveMsgFromElectronWindow(
			handleMsg: (msgObject: MsgObjectReactToElectron) => void,
		): void;
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
		getBasicInfo(url: string): Promise<Readonly<videoInfo>>;
	};
}>;

export enum ReactToElectronMessageEnum {
	DOWNLOAD_MEDIA = "download media", // 1
	CONVERT_MEDIA = "convert media", // 2
	WRITE_TAG = "write tag", // 3
	ERROR = "error", // 4
}

export type MsgObjectReactToElectron =
	| Readonly<{
			type: ReactToElectronMessageEnum.DOWNLOAD_MEDIA;
			downloadValues: DownloadValues;
	  }> // 1
	| Readonly<{
			type: ReactToElectronMessageEnum.CONVERT_MEDIA;
			convertValues: ConvertValues;
	  }> // 2
	| Readonly<{
			type: ReactToElectronMessageEnum.WRITE_TAG;
			params: Readonly<{
				newValue: string | readonly string[];
				whatToChange: ChangeOptionsToSend;
				mediaPath: Path;
			}>;
	  }> // 3
	| Readonly<{
			type: ReactToElectronMessageEnum.ERROR;
			error: Error;
	  }>; // 4

export enum ElectronToReactMessageEnum {
	DELETE_ONE_MEDIA_FROM_COMPUTER = "delete one media from computer", // 1
	DISPLAY_DOWNLOADING_MEDIAS = "display downloading medias", // 2
	REFRESH_ALL_MEDIA = "refresh all media", // 3
	REFRESH_ONE_MEDIA = "refresh one media", // 4
	REMOVE_ONE_MEDIA = "remove one media", // 5
	ADD_ONE_MEDIA = "add one media", // 6
	ERROR = "error", // 7
}

export type MsgObjectElectronToReact =
	| Readonly<{
			type: ElectronToReactMessageEnum.DELETE_ONE_MEDIA_FROM_COMPUTER;
			mediaPath: Path;
	  }> // 1
	| Readonly<{
			type: ElectronToReactMessageEnum.DISPLAY_DOWNLOADING_MEDIAS;
			downloadValues: DownloadValues;
	  }> // 2
	| Readonly<{
			type: ElectronToReactMessageEnum.REFRESH_ALL_MEDIA;
	  }> // 3
	| Readonly<{
			type: ElectronToReactMessageEnum.REFRESH_ONE_MEDIA;
			mediaPath: Path;
	  }> // 4
	| Readonly<{
			type: ElectronToReactMessageEnum.REMOVE_ONE_MEDIA;
			mediaPath: Path;
	  }> // 5
	| Readonly<{
			type: ElectronToReactMessageEnum.ADD_ONE_MEDIA;
			mediaPath: Path;
	  }> // 6
	| Readonly<{
			type: ElectronToReactMessageEnum.ERROR;
			error: Error;
	  }>; // 7

export type WriteTag = Readonly<{
	albumArtists?: readonly string[];
	genres?: readonly string[];
	imageURL?: string;
	album?: string;
	title?: string;
}>;

export enum ElectronIpcMainProcessNotificationEnum {
	MAXIMIZE,
	MINIMIZE,
	QUIT_APP,
}

export type ExtensionToBeConvertedTo = "mp3";

export type ImgString = `data:${string};base64,${string}`;
