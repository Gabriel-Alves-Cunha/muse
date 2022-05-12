import type { Media, MediaID, Mutable } from "@common/@types/typesAndEnums";

import { BsThreeDotsVertical as Dots } from "react-icons/bs";
import { MdAudiotrack as MusicNote } from "react-icons/md";
import { memo, useRef } from "react";
import { Dialog } from "@radix-ui/react-dialog";
import ContentLoader from "react-content-loader";
import create from "zustand";

import { CurrentPlayingEnum, setCurrentPlaying } from "@contexts";
import { ImgWithFallback, Tooltip } from "@components";
import { MediaOptionsModal } from "./MediaOptions";
import { useOnClickOutside } from "@hooks";

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

const allSelectedMedias: Set<MediaID> = new Set();
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

export const ScrollPlaceholder = memo(() => (
	<ContentLoader
		foregroundColor="#ecebeb"
		backgroundColor="#f3f3f3"
		viewBox="0 0 200 160"
		width={200}
		height={65}
		speed={2}
	>
		<rect x="55" y="26" rx="3" ry="3" width="52" height="6" />
		<rect x="54" y="9" rx="3" ry="3" width="140" height="6" />
		<rect x="0" y="0" rx="13" ry="13" width="45" height="45" />
	</ContentLoader>
));
ScrollPlaceholder.displayName = "ScrollPlaceholder";

const playMedia = (mediaID: MediaID) =>
	setCurrentPlaying({
		playlistName: playlistName.getState().playlistName,
		type: CurrentPlayingEnum.PLAY_THIS_MEDIA,
		mediaID,
	});

const toggleMediaSelectIfCtrlPlusLeftClick = (
	e: Readonly<React.MouseEvent<HTMLDivElement, MouseEvent>>,
	isSelected: Mutable<boolean>,
	mediaID: Readonly<MediaID>
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
