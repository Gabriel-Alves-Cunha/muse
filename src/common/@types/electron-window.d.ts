import type { DownloadInfo, Media, Path } from "./generalTypes";
import type { ChangeOptionsToSend } from "@components/MediaListKind/MediaOptions";
import type { ClientServerAPI } from "@main/preload/share";
import type { LyricsResponse } from "@main/preload/getLyrics.js";
import type { DeepReadonly } from "./utils";
import type { videoInfo } from "ytdl-core";
import type {
	ElectronIpcMainProcessNotificationEnum,
	ElectronToReactMessageEnum,
	ReactToElectronMessageEnum,
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
				type: ElectronIpcMainProcessNotificationEnum,
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
	| { type: ReactToElectronMessageEnum.CREATE_A_NEW_DOWNLOAD; }
	| { type: ReactToElectronMessageEnum.ERROR; error: Error; }
	| { type: ReactToElectronMessageEnum.CONVERT_MEDIA; }
	| {
		type: ReactToElectronMessageEnum.WRITE_TAG;
		thingsToChange: MetadataToChange;
		mediaPath: Path;
	}
>;

/////////////////////////////////////////////

export type MsgObjectElectronToReact = Readonly<
	| { type: ElectronToReactMessageEnum.REFRESH_ONE_MEDIA; mediaPath: Path; }
	| { type: ElectronToReactMessageEnum.REMOVE_ONE_MEDIA; mediaPath: Path; }
	| { type: ElectronToReactMessageEnum.ADD_ONE_MEDIA; mediaPath: Path; }
	| { type: ElectronToReactMessageEnum.ERROR; error: Error; }
	| { type: ElectronToReactMessageEnum.REFRESH_ALL_MEDIA; }
	| {
		type: ElectronToReactMessageEnum.DELETE_ONE_MEDIA_FROM_COMPUTER;
		mediaPath: Path;
	}
	| {
		type: ElectronToReactMessageEnum.CREATE_A_NEW_DOWNLOAD;
		downloadInfo: DownloadInfo;
	}
>;

/////////////////////////////////////////////

export type Tags = DeepReadonly<
	{
		albumArtists?: string[];
		genres?: string[];
		imageURL?: string;
		lyrics?: string;
		album?: string;
		title?: string;
	}
>;
