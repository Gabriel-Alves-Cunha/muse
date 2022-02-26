import type { ListChildComponentProps } from "react-window";
import type { MediaListKindProps } from "./Change";
import type { Media } from "@common/@types/typesAndEnums";

import { IoMdMusicalNote as MusicNote } from "react-icons/io";
import { FixedSizeList as List } from "react-window";
import { memo, useState } from "react";
import AutoSizer from "react-virtualized-auto-sizer";
import Popup from "reactjs-popup";

import { useCurrentPlaying, CurrentPlayingEnum, usePlaylists } from "@contexts";
import { Dots, ImgWithFallback } from "@components";
import { MediaOptionsModal } from "./MediaOptions";

import { pulse } from "@styles/animations";
import {
	ListWrapper,
	PlayButton,
	RowWrapper,
	SubTitle,
	Options,
	Title,
	Info,
	Img,
} from "./styles";

const PADDING_SIZE = 5;
const ROW_HEIGHT = 65;

export function MediaListKind({ mediaType }: MediaListKindProps) {
	const { setCurrentPlaying, currentPlaying } = useCurrentPlaying();
	const { playlists } = usePlaylists();

	const [showPopup, setShowPopup] = useState<Media>();

	// eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
	const mediaList = playlists.find(({ name }) => name === mediaType)!;
	if (!mediaList)
		console.error(
			`There should/must be a "${mediaType}"!\nplaylists =`,
			playlists,
		);

	const playMedia = (media: Media) =>
		setCurrentPlaying({
			type: CurrentPlayingEnum.PLAY_THIS_MEDIA,
			playlist: mediaList,
			media,
		});

	const Row = memo(
		({ index, data, style }: ListChildComponentProps<readonly Media[]>) => {
			const media = data[index];

			return media ? (
				<RowWrapper
					className={media.id === currentPlaying.media?.id ? "active" : ""}
					style={{
						...style,
						height: (parseFloat(String(style.height)) || 0) - PADDING_SIZE,
						width: (parseFloat(String(style.width)) || 0) - PADDING_SIZE,
						//			^ This way to safely turn style.width to a number.
					}}
				>
					<PlayButton onClick={() => playMedia(media)}>
						<Img>
							<ImgWithFallback
								Fallback={<MusicNote size="1.4em" />}
								media={media}
							/>
						</Img>

						<Info>
							<Title>{media.title}</Title>
							<SubTitle>{media.duration}</SubTitle>
						</Info>
					</PlayButton>

					<Options onClick={() => setShowPopup(media)} onMouseDown={pulse}>
						<Dots />
					</Options>
				</RowWrapper>
			) : null;
		},
		(prevProps, nextProps) =>
			prevProps.data[prevProps.index].id === nextProps.data[nextProps.index].id,
	);
	Row.displayName = "Row";

	return (
		<ListWrapper>
			<AutoSizer>
				{({ height, width }) => (
					<List
						itemKey={(index, data) => data[index].id + Date.now()}
						itemSize={ROW_HEIGHT + PADDING_SIZE}
						itemCount={mediaList.list.length}
						itemData={mediaList.list}
						overscanCount={15}
						className="list"
						height={height}
						width={width}
					>
						{Row}
					</List>
				)}
			</AutoSizer>

			<Popup
				onClose={() => setShowPopup(undefined)}
				open={Boolean(showPopup)}
				position="center center"
				{...{ overlayStyle }}
				defaultOpen={false}
				repositionOnResize
				closeOnEscape
				lockScroll
				nested
			>
				{/* eslint-disable-next-line  @typescript-eslint/no-non-null-assertion */}
				<MediaOptionsModal media={showPopup!} setShowPopup={setShowPopup} />
			</Popup>
		</ListWrapper>
	);
}

export const overlayStyle = Object.freeze({
	background: "rgba(0,0,0,0.15)",
	backdropFilter: "blur(2px)",
});
