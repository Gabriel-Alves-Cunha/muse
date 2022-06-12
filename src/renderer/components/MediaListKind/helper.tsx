import type { Media, Path } from "@common/@types/generalTypes";

import { BsThreeDotsVertical as Dots } from "react-icons/bs";
import { MdAudiotrack as MusicNote } from "react-icons/md";
import { memo, useRef } from "react";
import { Dialog } from "@radix-ui/react-dialog";
import create from "zustand";

import { ElectronIpcMainProcessNotificationEnum } from "@common/@types/electron-window";
import { MediaOptionsModal } from "./MediaOptions";
import { ImgWithFallback } from "@components/ImgWithFallback";
import { playThisMedia } from "@contexts/mediaHandler/useCurrentPlaying";
import { TooltipButton } from "@components/TooltipButton";
import { DialogTrigger } from "@components/Dialog";
import { PlaylistList } from "@contexts/mediaHandler/usePlaylists";
import { dbg } from "@common/utils";

import { RowWrapper, SubTitle, Title, Info, Img } from "./styles";
import { StyledOverlay } from "./MediaOptions/styles";

const notify =
	electron.notificationApi.sendNotificationToElectronIpcMainProcess;

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

export const allSelectedMedias: Set<Path> = new Set();

export const useFromList = create<FromList>(() => ({
	homeList: PlaylistList.MAIN_LIST,
	fromList: PlaylistList.FAVORITES,
	isHome: true,
}));
export const { getState: getFromList, setState: setFromList } = useFromList;

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

const Row = memo(({ media, path }: RowProps) => {
	const mediaRowRef = useRef<HTMLDivElement>(null);

	return (
		<RowWrapper ref={mediaRowRef}>
			<TooltipButton
				onClick={e => {
					const doContinueAndPlay = toggleMediaSelectIfCtrlPlusLeftClick(
						e,
						mediaRowRef,
						path,
					);

					if (doContinueAndPlay) {
						const { fromList, homeList, isHome } = getFromList();
						const list = isHome ? homeList : fromList;

						playThisMedia(path, list);
					}
				}}
				tooltip="Play this media"
				className="play"
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
					<SubTitle className="row">{media.duration}</SubTitle>
				</Info>
			</TooltipButton>

			<Dialog modal>
				<DialogTrigger
					data-tooltip="Open media options"
					tooltip-side="left-bottom"
				>
					<Dots />
				</DialogTrigger>

				<StyledOverlay>
					<MediaOptionsModal media={media} path={path} />
				</StyledOverlay>
			</Dialog>
		</RowWrapper>
	);
});
Row.displayName = "Row";

const leftClick = 0;
const toggleMediaSelectIfCtrlPlusLeftClick = (
	e: Readonly<React.MouseEvent<HTMLButtonElement, MouseEvent>>,
	mediaRowRef: Readonly<React.RefObject<HTMLDivElement>>,
	mediaPath: Readonly<Path>,
): boolean => {
	if (!e.ctrlKey || e.button !== leftClick || !mediaRowRef.current) return true;

	dbg("toggleMediaSelectIfCtrlPlusLeftClick %cBEFORE", "color:blue", {
		allSelectedMediasSize: allSelectedMedias.size,
		mediaPath,
		e,
	});

	const rowElement = mediaRowRef.current;

	if (allSelectedMedias.has(mediaPath)) {
		// Remove className "selected":
		rowElement.classList.remove("selected");

		// Remove media from the set:
		allSelectedMedias.delete(mediaPath);
	} else {
		// Add className "selected":
		rowElement.classList.add("selected");

		// Add media to the set:
		allSelectedMedias.add(mediaPath);
	}

	dbg("toggleMediaSelectIfCtrlPlusLeftClick %cAFTER", "color:green", {
		allSelectedMediasSize: allSelectedMedias.size,
		allSelectedMedias,
		rowElement,
		e,
	});

	return false;
};

export const computeItemKey = (_index: number, [path]: [Path, Media]) => path;
export const itemContent = (_index: number, [path, media]: [Path, Media]) => (
	<Row media={media} path={path} />
);

export const reloadWindow = () =>
	notify(ElectronIpcMainProcessNotificationEnum.RELOAD_WINDOW);

type RowProps = Readonly<{ media: Media; path: Path; }>;

type FromList = {
	fromList: Exclude<
		PlaylistList,
		PlaylistList.MAIN_LIST | PlaylistList.SORTED_BY_DATE
	>;
	homeList: Extract<
		PlaylistList,
		PlaylistList.MAIN_LIST | PlaylistList.SORTED_BY_DATE
	>;
	isHome: boolean;
};
