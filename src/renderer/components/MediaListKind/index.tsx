import type { MediaListKindProps } from "./MediaOptions/Change";
import type { Media } from "@common/@types/typesAndEnums";

import { BsThreeDotsVertical as Dots } from "react-icons/bs";
import { MdAudiotrack as MusicNote } from "react-icons/md";
import { memo, useState } from "react";
import {
	type ListChildComponentProps,
	FixedSizeList as List,
} from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import Popup from "reactjs-popup";

import { useCurrentPlaying, CurrentPlayingEnum, usePlaylists } from "@contexts";
import { MediaOptionsModal } from "./MediaOptions";
import { ImgWithFallback } from "@components";

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

export function MediaListKind({ playlistName }: MediaListKindProps) {
	const { setCurrentPlaying, currentPlaying } = useCurrentPlaying();
	const { playlists } = usePlaylists();

	const [showPopup, setShowPopup] = useState<Media>();

	// TODO: ErrorBoundary
	// eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
	const list = playlists.find(p => p.name === playlistName)!;
	if (!list)
		console.error(
			`There should/must be a list with name = "${playlistName}"!\nplaylists =`,
			playlists,
		);

	const playMedia = (media: Media) =>
		setCurrentPlaying({
			type: CurrentPlayingEnum.PLAY_THIS_MEDIA,
			playlistName,
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

					<Options onClick={() => setShowPopup(media)}>
						<Dots />
					</Options>
				</RowWrapper>
			) : null;
		},
		(prevProps, nextProps) =>
			prevProps.data[prevProps.index]?.id ===
			nextProps.data[nextProps.index]?.id,
	);
	Row.displayName = "Row";

	return (
		<ListWrapper>
			<AutoSizer>
				{({ height, width }) => (
					<List
						itemKey={(index, data) => data[index]?.id ?? 0 + Date.now()}
						itemSize={ROW_HEIGHT + PADDING_SIZE}
						itemCount={list.list.length}
						itemData={list.list}
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
} as const);
