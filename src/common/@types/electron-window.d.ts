import type { DownloadInfo, Media, Path } from "./generalTypes";
import type { DeepReadonly, ValuesOf } from "./utils";
import type { ChangeOptionsToSend } from "@components/MediaListKind/MediaOptions";
import type { ClientServerAPI } from "@main/preload/share";
import type { LyricsResponse } from "@main/preload/getLyrics.js";
import type { videoInfo } from "ytdl-core";

import {
	electronIpcMainProcessNotification,
	electronToReactMessage,
	reactToElectronMessage,
} from "../enums";

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////

declare global {
	var runtimeGlobalsChecker: { getRuntimeGlobals: () => string[] };
	var audio: HTMLAudioElement | null;
	var electron: VisibleElectron;
	var isDev: boolean;
}

/////////////////////////////////////////////

export type VisibleElectron = DeepReadonly<{
	os: { dirs: { documents: Path; downloads: Path; music: Path } };
	notificationApi: {
		sendNotificationToElectronIpcMainProcess(
			type: ValuesOf<typeof electronIpcMainProcessNotification>,
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
			paths: readonly Path[],
			assureMediaSizeIsGreaterThan60KB?: boolean,
			ignoreMediaWithLessThan60Seconds?: boolean,
		): Promise<readonly [Path, Media][]>;
	};
	share: { createServer(filepaths: readonly Path[]): ClientServerAPI };
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
	| { type: typeof reactToElectronMessage.CREATE_A_NEW_DOWNLOAD }
	| { type: typeof reactToElectronMessage.ERROR; error: Error }
	| { type: typeof reactToElectronMessage.CONVERT_MEDIA }
	| {
			type: typeof reactToElectronMessage.WRITE_TAG;
			thingsToChange: MetadataToChange;
			mediaPath: Path;
	  }
>;

/////////////////////////////////////////////

export type MsgObjectElectronToReact = Readonly<
	| { type: typeof electronToReactMessage.REFRESH_ONE_MEDIA; mediaPath: Path }
	| { type: typeof electronToReactMessage.REMOVE_ONE_MEDIA; mediaPath: Path }
	| { type: typeof electronToReactMessage.ADD_ONE_MEDIA; mediaPath: Path }
	| { type: typeof electronToReactMessage.ERROR; error: Error }
	| { type: typeof electronToReactMessage.REFRESH_ALL_MEDIA }
	| {
			type: typeof electronToReactMessage.DELETE_ONE_MEDIA_FROM_COMPUTER;
			mediaPath: Path;
	  }
	| {
			type: typeof electronToReactMessage.CREATE_A_NEW_DOWNLOAD;
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
