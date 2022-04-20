import type { Media, MediaID } from "@common/@types/typesAndEnums";

import { BsThreeDotsVertical as Dots } from "react-icons/bs";
import { MdAudiotrack as MusicNote } from "react-icons/md";
import { Dialog, Portal } from "@radix-ui/react-dialog";
import { ErrorBoundary } from "react-error-boundary";

import { memo, useMemo } from "react";
import { Virtuoso } from "react-virtuoso";

import { MediaOptionsModal } from "./MediaOptions";
import { ImgWithFallback } from "@components";
import { MAIN_LIST } from "@contexts/mediaHandler/usePlaylistsHelper";
import {
	type Playlist,
	CurrentPlayingEnum,
	useCurrentPlaying,
	setCurrentPlaying,
	usePlaylists,
} from "@contexts";

import { StyledOverlay } from "./MediaOptions/styles";
import {
	TriggerOptions,
	ListWrapper,
	PlayButton,
	RowWrapper,
	ImgWrapper,
	SubTitle,
	Button,
	Title,
	Alert,
	Info,
	Msg,
} from "./styles";

const timeLabel = "Loop to find all medias by id took";
const playMedia = (mediaID: MediaID, playlistName: Playlist["name"]) =>
	setCurrentPlaying({
		type: CurrentPlayingEnum.PLAY_THIS_MEDIA,
		playlistName,
		mediaID,
	});

export const MediaListKind = ({ playlistName }: MediaListKindProps) => (
	<ErrorBoundary
		FallbackComponent={ErrorFallback}
		onReset={() => {
			// TODO: reset the state of your app so the error doesn't happen again
			console.error(
				"This should reset all app data, but it does nothing at the moment",
			);
		}}
	>
		<MediaListKind_ playlistName={playlistName} />
	</ErrorBoundary>
);

function MediaListKind_({ playlistName }: MediaListKindProps) {
	const { playlists, mainList } = usePlaylists();
	const { currentPlaying } = useCurrentPlaying();

	const data = useMemo(() => {
		// Handle when playlistName === MAIN_LIST:
		if (playlistName === MAIN_LIST) return mainList;
		else {
			console.time(timeLabel);
			// eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
			const data = playlists
				.find(p => p.name === playlistName)!
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				.list.map(mediaID => mainList.find(m => m.id === mediaID)!);

			console.timeEnd(timeLabel);
			return data;
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
						<Title>{media.title}</Title>
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
				itemContent={(_, m) => <Row media={m} />}
				computeItemKey={(_, m) => m.id}
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

function ErrorFallback({ error, resetErrorBoundary }: ErrorBoundaryProps) {
	return (
		<Alert role="alert">
			<Title>Something went wrong:</Title>
			<SubTitle>
				Try closing and opening the app, if the error persists, click on the
				button below!
			</SubTitle>

			<Msg>{error.message}</Msg>

			<Button onClick={resetErrorBoundary}>Reset all app data!</Button>
		</Alert>
	);
}

type ErrorBoundaryProps = {
	resetErrorBoundary: () => void;
	error: Error;
};

export type MediaListKindProps = Readonly<{
	playlistName: Playlist["name"];
}>;
