import type { DateAsNumber, Media, Path } from "@common/@types/generalTypes";

import { HiOutlineDotsVertical as Dots } from "react-icons/hi";
import { MdAudiotrack as MusicNote } from "react-icons/md";
import { Dialog, Portal } from "@radix-ui/react-dialog";
import { memo } from "react";
import create from "zustand";

import { ElectronIpcMainProcessNotificationEnum } from "@common/@types/electron-window";
import { MediaOptionsModal } from "./MediaOptions";
import { ImgWithFallback } from "@components/ImgWithFallback";
import { playThisMedia } from "@contexts/mediaHandler/useCurrentPlaying";
import { DialogTrigger } from "@components/DialogTrigger";
import {
	addToAllSelectedMedias,
	toggleSelectedMedia,
	PlaylistList,
	mainList,
} from "@contexts/mediaHandler/usePlaylists";

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

export function selectMedia(e: React.MouseEvent<HTMLSpanElement>): void {
	const itemClicked = (e.nativeEvent.target as HTMLElement).closest<
		HTMLDivElement
	>(rowWrapperClassName);

	if (!itemClicked) return console.warn("No media row found.");

	const itemClickedMediaPath = itemClicked.getAttribute("data-path");

	if (!itemClickedMediaPath) return console.error("No data-path found!");

	const media = mainList().get(itemClickedMediaPath);

	if (!media)
		return console.error(`No media found for "${itemClickedMediaPath}"`);

	if (!media.isSelected)
		addToAllSelectedMedias(media, itemClickedMediaPath);
}

const leftClick = 0;

function selectOrPlayMedia(
	e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
	mediaPath: Path,
	media: Media,
) {
	if (e.button !== leftClick || !e.ctrlKey) {
		const { fromList, homeList, isHome } = getFromList();
		const list = isHome ? homeList : fromList;

		return playThisMedia(mediaPath, list);
	}

	toggleSelectedMedia(media, mediaPath);
}

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////

const Row = memo(
	({ media, path }: RowProps) => (
		<RowWrapper
			data-path={path}
			className={media.isSelected ?
				"selected" :
				""}
		>
			<PlayButton
				onClick={e => selectOrPlayMedia(e, path, media)}
				data-tip="Play this media"
			>
				<Img>
					<ImgWithFallback
						Fallback={<MusicNote size="1.4rem" />}
						mediaImg={media.img}
						mediaPath={path}
					/>
				</Img>

				<Info>
					<Title>{media.title}</Title>
					<SubTitle className="row">
						{media.duration}
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
		prev.media.duration === next.media.duration &&
		prev.media.isSelected === next.media.isSelected,
);
Row.displayName = "Row";

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////

export const computeItemKey = (
	_index: number,
	[path]: [Path, Media, DateAsNumber],
) => path;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const computeHistoryItemKey = (
	_index: number,
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	[path, _, date]: [Path, Media, DateAsNumber],
) => `${path} ${date}`;
export const itemContent = (
	_index: number,
	[path, media]: [Path, Media, DateAsNumber],
) => <Row media={media} path={path} />;

export const reloadWindow = (): void =>
	notify(ElectronIpcMainProcessNotificationEnum.RELOAD_WINDOW);

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////

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
