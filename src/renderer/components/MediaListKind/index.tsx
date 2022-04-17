import type { Media, MediaID } from "@common/@types/typesAndEnums";

import { BsThreeDotsVertical as Dots } from "react-icons/bs";
import { MdAudiotrack as MusicNote } from "react-icons/md";
import { Dialog, Portal } from "@radix-ui/react-dialog";
import { memo, useMemo } from "react";
import { Virtuoso } from "react-virtuoso";

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
	ImgWrapper,
} from "./styles";

const timeLabel = "Loop to find all medias by id";
const { getState } = useCurrentPlaying;
const playMedia = (mediaID: MediaID, playlistName: Playlist["name"]) =>
	getState().setCurrentPlaying({
		type: CurrentPlayingEnum.PLAY_THIS_MEDIA,
		playlistName,
		mediaID,
	});

// TODO: ErrorBoundary if there is no playlist with playlistName
export function MediaListKind({ playlistName }: MediaListKindProps) {
	const { playlists, mainList } = usePlaylists();
	const { currentPlaying } = useCurrentPlaying();

	const data = useMemo(() => {
		// Handle when playlistName === MAIN_LIST:
		if (playlistName === MAIN_LIST) return mainList;
		else
			try {
				console.time(timeLabel);
				// eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
				const data = playlists
					.find(p => p.name === playlistName)!
					// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
					.list.map(mediaID => mainList.find(m => m.id === mediaID)!);

				return Object.freeze(data);
			} finally {
				console.timeEnd(timeLabel);
			}
	}, [mainList, playlistName, playlists]);

	const Row = memo(
		({ media }: { media: Media }) => (
			<RowWrapper
				className={media.id === currentPlaying.mediaID ? "active" : ""}
			>
				<PlayButton onClick={() => playMedia(media.id, playlistName)}>
					<ImgWrapper>
						<ImgWithFallback
							Fallback={<MusicNote size="1.4em" />}
							media={media}
						/>
					</ImgWrapper>

					<Info>
						<Title className="mytitle">{media.title}</Title>
						<SubTitle>{media.duration}</SubTitle>
					</Info>
				</PlayButton>

				<Dialog modal>
					<TriggerOptions style={{ width: 30 }}>
						<Dots />
					</TriggerOptions>

					<Portal>
						<StyledOverlay>
							<MediaOptionsModal media={media} />
						</StyledOverlay>
					</Portal>
				</Dialog>
			</RowWrapper>
		),
		(prevMedia, nextMedia) => prevMedia.media.id === nextMedia.media.id,
	);
	Row.displayName = "Row";

	return (
		<ListWrapper>
			<Virtuoso
				itemContent={(_, media) => <Row media={media} />}
				computeItemKey={(_, { id }) => id}
				totalCount={data.length}
				fixedItemHeight={65}
				className="list"
				overscan={10}
				data={data}
				noValidate
				async
			/>
		</ListWrapper>
	);
}

export type MediaListKindProps = Readonly<{
	playlistName: DefaultLists;
}>;
