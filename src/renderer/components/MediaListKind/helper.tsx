import type { DateAsNumber, Media, Path } from "@common/@types/generalTypes";

import { HiOutlineDotsVertical as Dots } from "react-icons/hi";
import { MdAudiotrack as MusicNote } from "react-icons/md";
import { Dialog, Portal } from "@radix-ui/react-dialog";
import { memo } from "react";
import create from "zustand";

import { ElectronIpcMainProcessNotificationEnum } from "@common/@types/electron-window";
import { MediaOptionsModal } from "./MediaOptions";
import { ImgWithFallback } from "@components/ImgWithFallback";
import { currentPlaying, playThisMedia } from "@contexts/useCurrentPlaying";
import { DialogTrigger } from "@components/DialogTrigger";
import { PlaylistList } from "@contexts/usePlaylists";
import {
	addToAllSelectedMedias,
	allSelectedMedias,
	toggleSelectedMedia,
} from "@contexts/useAllSelectedMedias";

import { StyledDialogBlurOverlay } from "./MediaOptions/styles";
import {
	rowWrapperClassName,
	PlayButton,
	RowWrapper,
	SubTitle,
	Title,
	Info,
	Img,
} from "./styles";

const notify =
	electron.notificationApi.sendNotificationToElectronIpcMainProcess;

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

export const useFromList = create<FromList>(() => ({
	homeList: PlaylistList.MAIN_LIST,
	fromList: PlaylistList.FAVORITES,
	isHome: true,
}));

export const { getState: getFromList, setState: setFromList } = useFromList;

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

export function selectMediaByEvent(e: React.MouseEvent<HTMLSpanElement>): void {
	const mediaClickedMediaPath = (e.nativeEvent.target as HTMLElement)
		.closest<HTMLDivElement>(rowWrapperClassName)
		?.getAttribute("data-path");

	if (!mediaClickedMediaPath)
		return console.info("No 'data-path' found!");

	addToAllSelectedMedias(mediaClickedMediaPath);
}

/////////////////////////////////////////

export const rightClick = 2;
export const leftClick = 0;

function selectOrPlayMedia(
	e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
	mediaPath: Path,
) {
	if (e.button !== leftClick || e.ctrlKey === false) {
		const { fromList, homeList, isHome } = getFromList();
		const list = isHome === true ? homeList : fromList;

		return playThisMedia(mediaPath, list);
	}

	toggleSelectedMedia(mediaPath);
}

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////

const Row = memo(
	({ media, path }: RowProps) => (
		<RowWrapper
			className={(allSelectedMedias().has(path) === true ?
				"selected " :
				"") + (currentPlaying().path === path ? "playing " : "")}
			data-path={path}
		>
			<PlayButton
				onClick={e => selectOrPlayMedia(e, path)}
				data-tip="Play this media"
				data-place="bottom"
			>
				<Img>
					<ImgWithFallback
						Fallback={<MusicNote size="1.4rem" />}
						mediaImg={media.image}
						mediaPath={path}
					/>
				</Img>

				<Info>
					<Title>{media.title}</Title>

					<SubTitle className="row">
						{media.duration}
						&emsp;|&emsp;
						{media.artist}
					</SubTitle>
				</Info>
			</PlayButton>

			<Dialog modal>
				<DialogTrigger tooltip="Open media options">
					<Dots size={17} />
				</DialogTrigger>

				<Portal>
					<StyledDialogBlurOverlay>
						<MediaOptionsModal media={media} path={path} />
					</StyledDialogBlurOverlay>
				</Portal>
			</Dialog>
		</RowWrapper>
	),
	(prev, next) =>
		prev.media.title === next.media.title &&
		prev.media.artist === next.media.artist &&
		prev.media.duration === next.media.duration,
);
Row.displayName = "Row";

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////

export const computeItemKey = (
	_index: number,
	[path]: [Path, Media, DateAsNumber],
): Path => path;

/////////////////////////////////////////

export const computeHistoryItemKey = (
	_index: number,
	[path, , date]: [Path, Media, DateAsNumber],
): `${Path}•${DateAsNumber}` => `${path}•${date}`;

/////////////////////////////////////////

export const itemContent = (
	_index: number,
	[path, media]: [Path, Media, DateAsNumber],
) => <Row media={media} path={path} />;

/////////////////////////////////////////

export const reloadWindow = (): void =>
	notify(ElectronIpcMainProcessNotificationEnum.RELOAD_WINDOW);

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Types:

type RowProps = Readonly<{ media: Media; path: Path; }>;

type FromList = Readonly<
	{
		fromList: Exclude<
			PlaylistList,
			PlaylistList.MAIN_LIST | PlaylistList.SORTED_BY_DATE
		>;
		homeList: Extract<
			PlaylistList,
			PlaylistList.MAIN_LIST | PlaylistList.SORTED_BY_DATE
		>;
		isHome: boolean;
	}
>;
