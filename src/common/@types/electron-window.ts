import type { DownloadInfo, Media, Path } from "./generalTypes";
import type { ChangeOptionsToSend } from "@components/MediaListKind/MediaOptions";
import type { videoInfo } from "ytdl-core";

declare global {
	/* eslint-disable no-var */
	var runtimeGlobalsChecker: { getRuntimeGlobals: () => string[]; };
	var electron: VisibleElectron;
}

export type VisibleElectron = Readonly<
	{
		os: { dirs: Readonly<{ documents: Path; downloads: Path; music: Path; }>; };
		notificationApi: Readonly<
			{
				sendNotificationToElectronIpcMainProcess(
					type: ElectronIpcMainProcessNotificationEnum,
				): void;
			}
		>;
		fs: Readonly<
			{
				getFullPathOfFilesForFilesInThisDirectory(
					dir: Path,
				): Promise<readonly Path[]>;
				readFile(path: Path): Promise<Readonly<Buffer | undefined>>;
				readdir(dir: Path): Promise<readonly Path[]>;
				deleteFile(path: Path): Promise<void>;
			}
		>;
		media: Readonly<
			{
				transformPathsToMedias(
					paths: readonly string[],
					assureMediaSizeIsGreaterThan60KB?: Readonly<boolean>,
					ignoreMediaWithLessThan60Seconds?: Readonly<boolean>,
				): Promise<readonly [Path, Media][]>;
				getBasicInfo(url: string): Promise<Readonly<videoInfo>>;
			}
		>;
	}
>;

export enum ReactToElectronMessageEnum {
	CREATE_A_NEW_DOWNLOAD = "create a new download",
	CONVERT_MEDIA = "convert media",
	WRITE_TAG = "write tag",
	ERROR = "error",
}

export type MetadataToChange = Readonly<
	{ newValue: string | readonly string[]; whatToChange: ChangeOptionsToSend; }
>[];

export type MsgObjectReactToElectron =
	| Readonly<{ type: ReactToElectronMessageEnum.CREATE_A_NEW_DOWNLOAD; }>
	| Readonly<{ type: ReactToElectronMessageEnum.CONVERT_MEDIA; }>
	| Readonly<
		{
			type: ReactToElectronMessageEnum.WRITE_TAG;
			thingsToChange: MetadataToChange;
			mediaPath: Path;
		}
	>
	| Readonly<{ type: ReactToElectronMessageEnum.ERROR; error: Error; }>;

export enum ElectronToReactMessageEnum {
	DELETE_ONE_MEDIA_FROM_COMPUTER = "delete one media from computer",
	CREATE_CONVERSION_FAILED = "create conversion failed",
	CREATE_DOWNLOAD_FAILED = "create download failed",
	NEW_COVERSION_CREATED = "new conversion created",
	CREATE_A_NEW_DOWNLOAD = "create a new download",
	NEW_DOWNLOAD_CREATED = "new download created",
	REFRESH_ALL_MEDIA = "refresh all media",
	REFRESH_ONE_MEDIA = "refresh one media",
	REMOVE_ONE_MEDIA = "remove one media",
	ADD_ONE_MEDIA = "add one media",
	ERROR = "error",
}

export type MsgObjectElectronToReact =
	| Readonly<
		{
			type: ElectronToReactMessageEnum.DELETE_ONE_MEDIA_FROM_COMPUTER;
			mediaPath: Path;
		}
	>
	| Readonly<
		{
			type: ElectronToReactMessageEnum.CREATE_A_NEW_DOWNLOAD;
			downloadInfo: DownloadInfo;
		}
	>
	| Readonly<{ type: ElectronToReactMessageEnum.REFRESH_ALL_MEDIA; }>
	| Readonly<
		{ type: ElectronToReactMessageEnum.REFRESH_ONE_MEDIA; mediaPath: Path; }
	>
	| Readonly<
		{ type: ElectronToReactMessageEnum.REMOVE_ONE_MEDIA; mediaPath: Path; }
	>
	| Readonly<
		{ type: ElectronToReactMessageEnum.ADD_ONE_MEDIA; mediaPath: Path; }
	>
	| Readonly<{ type: ElectronToReactMessageEnum.ERROR; error: Error; }>
	| Readonly<
		{ type: ElectronToReactMessageEnum.NEW_DOWNLOAD_CREATED; url: string; }
	>
	| Readonly<
		{ type: ElectronToReactMessageEnum.CREATE_DOWNLOAD_FAILED; url: string; }
	>
	| Readonly<
		{ type: ElectronToReactMessageEnum.NEW_COVERSION_CREATED; path: Path; }
	>
	| Readonly<
		{ type: ElectronToReactMessageEnum.CREATE_CONVERSION_FAILED; path: Path; }
	>;

export type WriteTag = Readonly<
	{
		albumArtists?: readonly string[];
		genres?: readonly string[];
		imageURL?: string;
		album?: string;
		title?: string;
	}
>;

export enum ElectronIpcMainProcessNotificationEnum {
	TOGGLE_DEVELOPER_TOOLS,
	TOGGLE_MAXIMIZE,
	RELOAD_WINDOW,
	MINIMIZE,
	QUIT_APP,
}

export type ImgString = Readonly<`data:${string};base64,${string}`>;
