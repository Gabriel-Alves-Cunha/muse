import type { Media, Mutable } from "@common/@types/generalTypes";

import { BsThreeDotsVertical as Dots } from "react-icons/bs";
import { MdAudiotrack as MusicNote } from "react-icons/md";
import { memo, useRef } from "react";
import { Dialog } from "@radix-ui/react-dialog";
import create from "zustand";

import { useOnClickOutside } from "@hooks/useOnClickOutside";
import { MediaOptionsModal } from "./MediaOptions";
import { ImgWithFallback } from "@components/ImgWithFallback";
import { Tooltip } from "@components/Tooltip";
import {
	CurrentPlayingEnum,
	setCurrentPlaying,
} from "@contexts/mediaHandler/useCurrentPlaying";

import { StyledOverlay } from "./MediaOptions/styles";
import {
	TriggerOptions,
	PlayButton,
	RowWrapper,
	ImgWrapper,
	SubTitle,
	Title,
	Info,
} from "./styles";

const allSelectedMedias: Set<Media["id"]> = new Set();
export const playlistName = create(() => ({ playlistName: "" }));

const Row = memo(
	({ media }: RowProps) => {
		const mediaRowRef = useRef<HTMLDivElement>(null);
		const isSelected = useRef(false).current;

		useOnClickOutside(
			mediaRowRef,
			() => isSelected && allSelectedMedias.delete(media.id)
		);

		return (
			<RowWrapper
				onClick={event =>
					toggleMediaSelectIfCtrlPlusLeftClick(event, isSelected, media.id)
				}
				ref={mediaRowRef}
			>
				<Tooltip text="Play this media">
					<PlayButton onClick={() => playMedia(media.id)}>
						<ImgWrapper>
							<ImgWithFallback
								Fallback={<MusicNote size="1.4rem" />}
								media={media}
							/>
						</ImgWrapper>

						<Info>
							<Title>{media.title}</Title>
							<SubTitle>{media.duration}</SubTitle>
						</Info>
					</PlayButton>
				</Tooltip>

				<Dialog modal>
					<Tooltip text="Open media options">
						<TriggerOptions style={{ width: 29 }}>
							<Dots />
						</TriggerOptions>
					</Tooltip>

					<StyledOverlay>
						<MediaOptionsModal media={media} />
					</StyledOverlay>
				</Dialog>
			</RowWrapper>
		);
	},
	(prevMedia, nextMedia) => prevMedia.media.id === nextMedia.media.id
);
Row.displayName = "Row";

const playMedia = (mediaID: Media["id"]) =>
	setCurrentPlaying({
		list: playlistName.getState().playlistName,
		type: CurrentPlayingEnum.PLAY_THIS_MEDIA,
		path: mediaID,
	});

const toggleMediaSelectIfCtrlPlusLeftClick = (
	e: Readonly<React.MouseEvent<HTMLDivElement, MouseEvent>>,
	isSelected: Mutable<boolean>,
	mediaID: Readonly<Media["id"]>
) => {
	// `e.button === 0` is left click
	if (!e.ctrlKey || e.button !== 0) return;

	e.preventDefault();
	e.stopPropagation();

	if (allSelectedMedias.has(mediaID)) {
		console.assert(isSelected, "isSelected should be true");

		// Remove className "selected":
		e.currentTarget.classList.remove("selected");

		// Remove media from the set:
		allSelectedMedias.delete(mediaID);

		// Set the `isSelected` ref to false:
		isSelected = false;
	} else {
		console.assert(!isSelected, "isSelected should be false");

		// Add className "selected":
		e.currentTarget.classList.add("selected");

		// Add media to the set:
		allSelectedMedias.add(mediaID);

		// Set the `isSelected` ref to false:
		isSelected = true;
	}
};

export const computeItemKey = (_: number, media: Media) => media.id;
export const itemContent = (_: number, media: Media) => <Row media={media} />;

type RowProps = Readonly<{
	media: Media;
}>;
