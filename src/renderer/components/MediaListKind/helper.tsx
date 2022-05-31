import type { Media, Mutable, Path } from "@common/@types/generalTypes";

import { BsThreeDotsVertical as Dots } from "react-icons/bs";
import { MdAudiotrack as MusicNote } from "react-icons/md";
import { memo, useRef } from "react";
import { Dialog } from "@radix-ui/react-dialog";
import create from "zustand";

import { ElectronIpcMainProcessNotificationEnum } from "@common/@types/electron-window";
import { useOnClickOutside } from "@hooks/useOnClickOutside";
import { MediaOptionsModal } from "./MediaOptions";
import { ImgWithFallback } from "@components/ImgWithFallback";
import { playThisMedia } from "@contexts/mediaHandler/useCurrentPlaying";
import { TooltipButton } from "@components/TooltipButton";
import { DialogTrigger } from "@components/Dialog";
import { PlaylistList } from "@contexts/mediaHandler/usePlaylists";

import { RowWrapper, SubTitle, Title, Info, Img } from "./styles";
import { StyledOverlay } from "./MediaOptions/styles";

const notify =
	electron.notificationApi.sendNotificationToElectronIpcMainProcess;

const allSelectedMedias: Set<Path> = new Set();

export const useFromList = create(() => ({ fromList: PlaylistList.MAIN_LIST }));
export const { getState: getFromList, setState: setFromList } = useFromList;

const Row = memo(
	({ media, path }: RowProps) => {
		const mediaRowRef = useRef<HTMLDivElement>(null);
		const isSelected = useRef(false).current;

		useOnClickOutside(
			mediaRowRef,
			// Deselect:
			() => isSelected && allSelectedMedias.delete(path),
		);

		return (
			<RowWrapper
				onClick={event =>
					toggleMediaSelectIfCtrlPlusLeftClick(event, isSelected, path)
				}
				ref={mediaRowRef}
			>
				<TooltipButton
					onClick={() => playThisMedia(path, getFromList().fromList)}
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
	},
	// At the moment, the only that changes is duration, so we can use shallow:
	(prev, curr) => prev.media.duration === curr.media.duration,
);
Row.displayName = "Row";

const leftClick = 0;
const toggleMediaSelectIfCtrlPlusLeftClick = (
	e: Readonly<React.MouseEvent<HTMLDivElement, MouseEvent>>,
	isSelected: Mutable<boolean>,
	mediaPath: Readonly<Path>,
) => {
	if (!e.ctrlKey || e.button !== leftClick) return;

	e.preventDefault();
	e.stopPropagation();

	if (allSelectedMedias.has(mediaPath)) {
		console.assert(isSelected, "isSelected should be true");

		// Remove className "selected":
		e.currentTarget.classList.remove("selected");

		// Remove media from the set:
		allSelectedMedias.delete(mediaPath);

		// Set the `isSelected` ref to false:
		isSelected = false;
	} else {
		console.assert(!isSelected, "isSelected should be false");

		// Add className "selected":
		e.currentTarget.classList.add("selected");

		// Add media to the set:
		allSelectedMedias.add(mediaPath);

		// Set the `isSelected` ref to false:
		isSelected = true;
	}
};

export const computeItemKey = (_index: number, [path]: [Path, Media]) => path;
export const itemContent = (_index: number, [path, media]: [Path, Media]) => (
	<Row media={media} path={path} />
);

export const reloadWindow = () =>
	notify(ElectronIpcMainProcessNotificationEnum.RELOAD_WINDOW);

type RowProps = Readonly<{
	media: Media;
	path: Path;
}>;
