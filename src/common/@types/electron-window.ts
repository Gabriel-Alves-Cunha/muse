import type { DownloadInfo, Media, Path } from "./generalTypes";
import type { ChangeOptionsToSend } from "@components/MediaListKind/MediaOptions";
import type { TurnServerOnReturn } from "@main/preload/share";
import type { videoInfo } from "ytdl-core";

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////

declare global {
	/* eslint-disable no-var */
	var runtimeGlobalsChecker: { getRuntimeGlobals: () => string[]; };
	var electron: VisibleElectron;
}

/////////////////////////////////////////////

export type VisibleElectron = Readonly<
	{
		os: { dirs: Readonly<{ documents: Path; downloads: Path; music: Path; }>; };
		notificationApi: Readonly<
			{
				sendNotificationToElectronIpcMainProcess(
					type: Readonly<ElectronIpcMainProcessNotificationEnum>,
				): void;
			}
		>;
		fs: Readonly<
			{
				getFullPathOfFilesForFilesInThisDirectory(
					dir: Readonly<Path>,
				): Promise<readonly Path[]>;
				deleteFile(path: Readonly<Path>): Promise<Readonly<boolean>>;
				readDir(dir: Readonly<Path>): Promise<readonly Path[]>;
			}
		>;
		media: Readonly<
			{
				transformPathsToMedias(
					paths: readonly string[],
					assureMediaSizeIsGreaterThan60KB?: Readonly<boolean>,
					ignoreMediaWithLessThan60Seconds?: Readonly<boolean>,
				): Promise<readonly [Path, Media][]>;
				getBasicInfo(url: Readonly<string>): Promise<Readonly<videoInfo>>;
			}
		>;
		share: Readonly<
			{
				turnServerOn(filePath: Readonly<Path>): Readonly<TurnServerOnReturn>;
				makeItOnlyOneFile(
					filepaths: ReadonlySet<Path>,
				): Promise<Readonly<Path>>;
			}
		>;
	}
>;

/////////////////////////////////////////////

export enum ReactToElectronMessageEnum {
	CREATE_A_NEW_DOWNLOAD = "create a new download",
	CONVERT_MEDIA = "convert media",
	WRITE_TAG = "write tag",
	ERROR = "error",
}

/////////////////////////////////////////////

export type MetadataToChange = Readonly<
	{ newValue: string | readonly string[]; whatToChange: ChangeOptionsToSend; }
>[];

/////////////////////////////////////////////

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

/////////////////////////////////////////////

export enum ElectronToReactMessageEnum {
	DELETE_ONE_MEDIA_FROM_COMPUTER = "delete one media from computer",
	CREATE_A_NEW_DOWNLOAD = "create a new download",
	REFRESH_ALL_MEDIA = "refresh all media",
	REFRESH_ONE_MEDIA = "refresh one media",
	REMOVE_ONE_MEDIA = "remove one media",
	ADD_ONE_MEDIA = "add one media",
	ERROR = "error",
}

/////////////////////////////////////////////

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
	| Readonly<{ type: ElectronToReactMessageEnum.ERROR; error: Error; }>;

/////////////////////////////////////////////

export type Tags = Readonly<
	{
		albumArtists?: readonly string[];
		genres?: readonly string[];
		imageURL?: string;
		album?: string;
		title?: string;
	}
>;

/////////////////////////////////////////////

export enum ElectronIpcMainProcessNotificationEnum {
	TOGGLE_DEVELOPER_TOOLS,
	TOGGLE_MAXIMIZE,
	RELOAD_WINDOW,
	MINIMIZE,
	QUIT_APP,
}
