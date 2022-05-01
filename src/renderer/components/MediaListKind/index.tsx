import type { Media, MediaID, Mutable } from "@common/@types/typesAndEnums";

import { BsThreeDotsVertical as Dots } from "react-icons/bs";
import { MdAudiotrack as MusicNote } from "react-icons/md";
import { Dialog, Portal } from "@radix-ui/react-dialog";
import { ErrorBoundary } from "react-error-boundary";

import { memo, useMemo } from "react";
import { Virtuoso } from "react-virtuoso";

import { ImgWithFallback, Tooltip } from "@components";
import { MediaOptionsModal } from "./MediaOptions";
import {
	type Playlist,
	CurrentPlayingEnum,
	setCurrentPlaying,
	PlaylistActions,
	usePlaylists,
	setPlaylists,
	PlaylistEnum,
	getPlaylists,
	MAIN_LIST,
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

	const data = useMemo(() => {
		// Handle when playlistName === MAIN_LIST:
		const start = performance.now();
		const data =
			playlistName === MAIN_LIST
				? mainList
				: // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
				  playlists
						.find(p => p.name === playlistName)!
						// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
						.list.map(mediaID => mainList.find(m => m.id === mediaID)!);

		const end = performance.now();
		console.log(
			`%cLoop to find all medias by id took: ${end - start} ms.`,
			"color:brown",
		);

		return data;
	}, [mainList, playlistName, playlists]);

	return (
		<ListWrapper>
			<Virtuoso
				computeItemKey={computeItemKey}
				itemContent={itemContent}
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

const Row = memo(
	({ media, playlistName }: RowProps) => (
		<RowWrapper
			onClick={e => selectMeIfCtrlPlusLeftClick(e, media.id)}
			className={media.selected ? "selected" : ""}
		>
			<Tooltip text="Play this media">
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
			</Tooltip>

			<Dialog modal>
				<Tooltip text="Open media options">
					<TriggerOptions style={{ width: 29 }}>
						<Dots />
					</TriggerOptions>
				</Tooltip>

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

const computeItemKey = (_: number, media: Media) => media.id;
const itemContent = (_: number, media: Media, playlistName: string) => (
	<Row playlistName={playlistName} media={media} />
);

const playMedia = (mediaID: MediaID, playlistName: Playlist["name"]) =>
	setCurrentPlaying({
		type: CurrentPlayingEnum.PLAY_THIS_MEDIA,
		playlistName,
		mediaID,
	});

const selectMeIfCtrlPlusLeftClick = (
	e: React.MouseEvent<HTMLDivElement, MouseEvent>,
	mediaID: MediaID,
) => {
	// `e.button === 0` is left click
	if (!e.ctrlKey || e.button !== 0) return;

	// Make it have the className "selected":
	e.currentTarget.classList.add("selected");

	// Mark media as selected:
	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	const media = getPlaylists().mainList.find(
		m => m.id === mediaID,
	)! as Mutable<Media>;
	media.selected = true;

	setPlaylists({
		whatToDo: PlaylistActions.REFRESH_ONE_MEDIA_BY_ID,
		type: PlaylistEnum.UPDATE_MAIN_LIST,
		media,
	});
};

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

type RowProps = Readonly<{
	playlistName: Playlist["name"];
	media: Media;
}>;

export type MediaListKindProps = Readonly<{
	playlistName: Playlist["name"];
}>;

MediaListKind_.whyDidYouRender = {
	customName: "MediaListKind_",
};
