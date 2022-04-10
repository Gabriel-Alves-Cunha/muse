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
		receiveMsgFromElectron(handleMsg: (msgObject: MsgObject) => void): void;
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
		getBasicInfo(url: string): Promise<void | Readonly<videoInfo>>;
	};
}>;

export enum ReactElectronAsyncMessageEnum {
	DELETE_ONE_MEDIA_FROM_COMPUTER = "delete one media from computer", // 1
	REFRESH_ALL_MEDIA = "refresh all media", // 2
	REFRESH_ONE_MEDIA = "refresh one media", // 3
	REMOVE_ONE_MEDIA = "remove one media", // 4
	DOWNLOAD_MEDIA = "download media", // 5
	ADD_ONE_MEDIA = "add one media", // 6
	CONVERT_MEDIA = "convert media", // 7
	WRITE_TAG = "write tag", // 8
	ERROR = "error", // 9
}

export type MsgObject =
	| Readonly<{
			type: ReactElectronAsyncMessageEnum.DELETE_ONE_MEDIA_FROM_COMPUTER;
			media: Media;
	  }> // 1
	| Readonly<{
			type: ReactElectronAsyncMessageEnum.REFRESH_ALL_MEDIA;
	  }> // 2
	| Readonly<{
			type: ReactElectronAsyncMessageEnum.REFRESH_ONE_MEDIA;
			mediaPath: Path;
	  }> // 3
	| Readonly<{
			type: ReactElectronAsyncMessageEnum.REMOVE_ONE_MEDIA;
			mediaPath: Path;
	  }> // 4
	| Readonly<{
			type: ReactElectronAsyncMessageEnum.DOWNLOAD_MEDIA;
			downloadValues: DownloadValues;
	  }> // 5
	| Readonly<{
			type: ReactElectronAsyncMessageEnum.ADD_ONE_MEDIA;
			mediaPath: Path;
	  }> // 6
	| Readonly<{
			type: ReactElectronAsyncMessageEnum.CONVERT_MEDIA;
			convertValues: ConvertValues;
	  }> // 7
	| Readonly<{
			type: ReactElectronAsyncMessageEnum.WRITE_TAG;
			params: Readonly<{
				newValue: string | readonly string[];
				whatToChange: ChangeOptionsToSend;
				mediaPath: Path;
			}>;
	  }> // 8
	| Readonly<{
			type: ReactElectronAsyncMessageEnum.ERROR;
			error: Error;
	  }>; // 9

export type WriteTag = Readonly<{
	albumArtists?: readonly string[];
	genres?: readonly string[];
	imageURL?: string;
	album?: string;
	title?: string;
}>;

export enum NotificationEnum {
	MAXIMIZE,
	MINIMIZE,
	QUIT_APP,
}

export type ExtensionToBeConvertedTo = "mp3";

export type ImgString = `data:${string};base64,${string}`;
