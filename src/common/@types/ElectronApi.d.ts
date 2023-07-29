import type { DownloadInfo, ID, Media, Path } from "./GeneralTypes";
import type { DeepReadonly, ValuesOf } from "./Utils";
import type { ChangeOptionsToSend } from "@components/MediaListKind/MediaOptions";
import type { ClientServerAPI } from "@main/preload/share";
import type { LyricsResponse } from "@main/preload/getLyrics.js";
import type { videoInfo } from "ytdl-core";

import {
	ElectronIpcMainProcessNotificationEnum,
	ElectronToReactMessageEnum,
	ReactToElectronMessageEnum,
} from "../enums";

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////

declare global {
	var runtimeGlobalsChecker: { getRuntimeGlobals: () => string[] };
	var electronApi: ElectronAPI;
	var isDev: boolean;
}

/////////////////////////////////////////////

export type ElectronAPI = DeepReadonly<{
	os: { dirs: { documents: Path; downloads: Path; music: Path } };
	notificationApi: {
		sendNotificationToElectronIpcMainProcess(
			type: ValuesOf<typeof ElectronIpcMainProcessNotificationEnum>,
		): void;
	};
	fs: {
		readDir(dir: Path): Promise<readonly Path[]>;
		deleteFile(path: Path): Promise<boolean>;
		getFullPathOfFilesForFilesInThisDirectory(
			dir: Path,
		): Promise<readonly Path[]>;
	};
	media: {
		getBasicInfo(url: string): Promise<videoInfo>;
		transformPathsToMedias(
			path: Path,
			assureMediaSizeIsGreaterThan60KB?: boolean,
			ignoreMediaWithLessThan60Seconds?: boolean,
		): Promise<[ID, Media][]>;
	};
	share: { createServer(filepaths: ReadonlySet<string>): ClientServerAPI };
	lyric: {
		searchForLyricsAndImage(
			mediaTitle: string,
			mediaArtist: string,
			getImage: boolean,
		): Promise<LyricsResponse>;
	};
}>;

/////////////////////////////////////////////

export type MetadataToChange = Readonly<{
	newValue: string | readonly string[];
	whatToChange: ChangeOptionsToSend;
}>[];

/////////////////////////////////////////////

export type MsgObjectReactToElectron = Readonly<
	| { type: typeof ReactToElectronMessageEnum.CREATE_A_NEW_DOWNLOAD }
	| { type: typeof ReactToElectronMessageEnum.ERROR; error: Error }
	| { type: typeof ReactToElectronMessageEnum.CONVERT_MEDIA }
	| {
			type: typeof ReactToElectronMessageEnum.WRITE_TAG;
			thingsToChange: MetadataToChange;
			mediaPath: Path;
	  }
>;

/////////////////////////////////////////////

export type MsgObjectElectronToReact = Readonly<
	| {
			type: typeof ElectronToReactMessageEnum.RESCAN_ONE_MEDIA;
			mediaPath: Path;
	  }
	| {
			type: typeof ElectronToReactMessageEnum.REMOVE_ONE_MEDIA;
			mediaPath: Path;
	  }
	| { type: typeof ElectronToReactMessageEnum.ADD_ONE_MEDIA; mediaPath: Path }
	| { type: typeof ElectronToReactMessageEnum.ERROR; error: Error }
	| { type: typeof ElectronToReactMessageEnum.RESCAN_ALL_MEDIA }
	| {
			type: typeof ElectronToReactMessageEnum.DELETE_ONE_MEDIA_FROM_COMPUTER;
			mediaPath: Path;
	  }
	| {
			type: typeof ElectronToReactMessageEnum.CREATE_A_NEW_DOWNLOAD;
			downloadInfo: DownloadInfo;
	  }
>;

/////////////////////////////////////////////

export type Tags = Readonly<{
	albumArtists?: readonly string[];
	genres?: readonly string[];
	imageURL?: string;
	lyrics?: string;
	album?: string;
	title?: string;
}>;
