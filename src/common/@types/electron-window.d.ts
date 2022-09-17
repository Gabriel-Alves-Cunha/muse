import type { DownloadInfo, Media, Path } from "./generalTypes";
import type { DeepReadonly, Values } from "./utils";
import type { ChangeOptionsToSend } from "@components/MediaListKind/MediaOptions";
import type { ClientServerAPI } from "@main/preload/share";
import type { LyricsResponse } from "@main/preload/getLyrics.js";
import type { videoInfo } from "ytdl-core";

import {
	ElectronIpcMainProcessNotification,
	ElectronToReactMessage,
	ReactToElectronMessage,
} from "../enums";

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////

declare global {
	/* eslint-disable no-var */
	var runtimeGlobalsChecker: { getRuntimeGlobals: () => string[]; };
	var electron: VisibleElectron;
}

/////////////////////////////////////////////

export type VisibleElectron = DeepReadonly<
	{
		os: { dirs: { documents: Path; downloads: Path; music: Path; }; };
		notificationApi: {
			sendNotificationToElectronIpcMainProcess(
				type: Values<typeof ElectronIpcMainProcessNotification>,
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
				paths: readonly string[],
				assureMediaSizeIsGreaterThan60KB?: boolean,
				ignoreMediaWithLessThan60Seconds?: boolean,
			): Promise<readonly [Path, Media][]>;
		};
		share: { createServer(filepaths: readonly Path[]): ClientServerAPI; };
		lyric: {
			searchForLyricsAndImage(
				mediaTitle: string,
				mediaArtist: string,
				getImage: boolean,
			): Promise<LyricsResponse>;
		};
	}
>;

/////////////////////////////////////////////

export type MetadataToChange = Readonly<
	{ newValue: string | readonly string[]; whatToChange: ChangeOptionsToSend; }
>[];

/////////////////////////////////////////////

export type MsgObjectReactToElectron = Readonly<
	| { type: typeof ReactToElectronMessage.CREATE_A_NEW_DOWNLOAD; }
	| { type: typeof ReactToElectronMessage.ERROR; error: Error; }
	| { type: typeof ReactToElectronMessage.CONVERT_MEDIA; }
	| {
		type: typeof ReactToElectronMessage.WRITE_TAG;
		thingsToChange: MetadataToChange;
		mediaPath: Path;
	}
>;

/////////////////////////////////////////////

export type MsgObjectElectronToReact = Readonly<
	| { type: typeof ElectronToReactMessage.REFRESH_ONE_MEDIA; mediaPath: Path; }
	| { type: typeof ElectronToReactMessage.REMOVE_ONE_MEDIA; mediaPath: Path; }
	| { type: typeof ElectronToReactMessage.ADD_ONE_MEDIA; mediaPath: Path; }
	| { type: typeof ElectronToReactMessage.ERROR; error: Error; }
	| { type: typeof ElectronToReactMessage.REFRESH_ALL_MEDIA; }
	| {
		type: typeof ElectronToReactMessage.DELETE_ONE_MEDIA_FROM_COMPUTER;
		mediaPath: Path;
	}
	| {
		type: typeof ElectronToReactMessage.CREATE_A_NEW_DOWNLOAD;
		downloadInfo: DownloadInfo;
	}
>;

/////////////////////////////////////////////

export type Tags = Readonly<
	{
		albumArtists?: readonly string[];
		genres?: readonly string[];
		imageURL?: string;
		lyrics?: string;
		album?: string;
		title?: string;
	}
>;
