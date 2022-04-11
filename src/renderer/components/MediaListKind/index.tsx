import type { Media, MediaID } from "@common/@types/typesAndEnums";

import { BsThreeDotsVertical as Dots } from "react-icons/bs";
import { MdAudiotrack as MusicNote } from "react-icons/md";
import { Dialog, Portal } from "@radix-ui/react-dialog";
import { memo } from "react";
import {
	type ListChildComponentProps,
	FixedSizeList as List,
} from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";

import { MediaOptionsModal } from "./MediaOptions";
import { ImgWithFallback } from "@components";
import { MAIN_LIST } from "@contexts/mediaHandler/usePlaylistsHelper";
import {
	type DefaultLists,
	type Playlist,
	CurrentPlayingEnum,
	useCurrentPlaying,
	usePlaylists,
} from "@contexts";

import { StyledOverlay } from "./MediaOptions/styles";
import {
	TriggerOptions,
	ListWrapper,
	PlayButton,
	RowWrapper,
	SubTitle,
	Title,
	Info,
	Img,
} from "./styles";

const PADDING_SIZE = 5;
const ROW_HEIGHT = 65;

const { getState } = useCurrentPlaying;
const playMedia = (mediaID: MediaID, playlistName: Playlist["name"]) =>
	getState().setCurrentPlaying({
		type: CurrentPlayingEnum.PLAY_THIS_MEDIA,
		playlistName,
		mediaID,
	});

export function MediaListKind({ playlistName }: MediaListKindProps) {
	const { playlists, mainList } = usePlaylists();
	const { currentPlaying } = useCurrentPlaying();
	let list: readonly Media[];

	// TODO: ErrorBoundary
	// Handle when playlistName === MAIN_LIST:
	if (playlistName === MAIN_LIST) {
		list = mainList;
	} else {
		console.time("loop to find all medias by id");
		// eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
		list = playlists
			.find(p => p.name === playlistName)!
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			.list.map(mediaID => mainList.find(media => media.id === mediaID)!);
		console.timeEnd("loop to find all medias by id");
	}
	if (!list)
		console.error(
			`There should/must be a list with name = "${playlistName}"!\nplaylists =`,
			playlists,
		);

	const Row = memo(
		({ index, data, style }: ListChildComponentProps<readonly Media[]>) => {
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			const media = data[index]!;

			return (
				<RowWrapper
					className={media.id === currentPlaying.mediaID ? "active" : ""}
					style={{
						...style,
						height: (parseFloat(String(style.height)) || 0) - PADDING_SIZE,
						width: (parseFloat(String(style.width)) || 0) - PADDING_SIZE,
						//			^ This way to safely turn style.width to a number.
					}}
				>
					<PlayButton onClick={() => playMedia(media.id, playlistName)}>
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

					<Dialog modal>
						<TriggerOptions>
							<Dots />
						</TriggerOptions>

						<Portal>
							<StyledOverlay>
								<MediaOptionsModal media={media} />
							</StyledOverlay>
						</Portal>
					</Dialog>
				</RowWrapper>
			);
		},
		(prevProps, nextProps) =>
			prevProps.data[prevProps.index]?.id ===
			nextProps.data[nextProps.index]?.id,
	);
	Row.displayName = "Row";

	console.log({ list });

	return (
		<ListWrapper>
			<AutoSizer>
				{({ height, width }) => (
					<List
						itemKey={(index, data) => data[index]?.id ?? 0 + Date.now()}
						itemSize={ROW_HEIGHT + PADDING_SIZE}
						overscanCount={15}
						itemCount={length}
						className="list"
						itemData={list}
						height={height}
						width={width}
					>
						{Row}
					</List>
				)}
			</AutoSizer>
		</ListWrapper>
	);
}

export type MediaListKindProps = Readonly<{
	playlistName: DefaultLists;
}>;
