import type { MediaListKindProps } from "../MediaListKind";
import type { Media, MediaID } from "@common/@types/typesAndEnums";

import { memo, useEffect, useReducer, useRef } from "react";
import { Virtuoso } from "react-virtuoso";
import {
	MdOutlineSearch as SearchIcon,
	MdMusicNote as MusicNote,
	MdAutorenew as Reload,
	MdDelete as Clean,
} from "react-icons/md";

import { useOnClickOutside } from "@hooks";
import { assertUnreachable } from "@utils/utils";
import { ImgWithFallback } from "@components";
import {
	type Playlist,
	CurrentPlayingEnum,
	useCurrentPlaying,
	PlaylistActions,
	PlaylistEnum,
	usePlaylists,
} from "@contexts";

import { ImgWrapper, Info, SubTitle, Title } from "../MediaListKind/styles";
import { Loading } from "@styles/appStyles";
import {
	SearchResultsWrapper,
	ReloadContainer,
	SearchWrapper,
	NothingFound,
	Wrapper,
	Search,
	Result,
	Button,
} from "./styles";

enum SearchStatus {
	RELOADING_ALL_MEDIAS,
	FOUND_SOMETHING,
	DOING_NOTHING,
	NOTHING_FOUND,
	SEARCHING,
}

const defaultSearcher = Object.freeze({
	searchStatus: SearchStatus.DOING_NOTHING,
	searchTerm: "",
	results: [],
} as const);

const { getState: getPlaylistsFunctions } = usePlaylists;
const cleanHistory = () =>
	getPlaylistsFunctions().setPlaylists({
		type: PlaylistEnum.UPDATE_HISTORY,
		whatToDo: PlaylistActions.CLEAN,
	});

export function SearchMedia({ fromList, buttonToTheSide }: Props) {
	const [searcher, dispatchSearcher] = useReducer(
		searcherReducer,
		defaultSearcher,
	);
	const searcherRef = useRef<HTMLHeadingElement>(null);

	const reload = async () => {
		dispatchSearcher({
			value: SearchStatus.RELOADING_ALL_MEDIAS,
			type: SearcherAction.SET_SEARCH_STATUS,
		});

		await getPlaylistsFunctions().searchLocalComputerForMedias(true);

		dispatchSearcher({
			type: SearcherAction.SET_SEARCH_STATUS,
			value: SearchStatus.DOING_NOTHING,
		});
	};

	useOnClickOutside(searcherRef, () => {
		dispatchSearcher({ type: SearcherAction.SET_SEARCH_TERM, value: "" });
		dispatchSearcher({ type: SearcherAction.SET_RESULTS, value: [] });
		dispatchSearcher({
			type: SearcherAction.SET_SEARCH_STATUS,
			value: SearchStatus.DOING_NOTHING,
		});
	});

	useEffect(() => {
		if (searcher.searchTerm.length < 2) return;

		// TODO: use useTransition instead.
		const searchTimeout = setTimeout(
			() =>
				dispatchSearcher({
					value: getPlaylistsFunctions().searchForMediaFromList(
						searcher.searchTerm,
						fromList,
					),
					type: SearcherAction.SET_RESULTS,
				}),
			400,
		);

		return () => clearTimeout(searchTimeout);
	}, [fromList, searcher.searchTerm]);

	const buttonToTheSideJSX: Record<ButtonToTheSide, JSX.Element> = {
		[ButtonToTheSide.RELOAD_BUTTON]: (
			<ReloadContainer onClick={reload}>
				{searcher.searchStatus === SearchStatus.RELOADING_ALL_MEDIAS ? (
					<div style={{ transform: "scale(0.3)", animation: "" }}>
						<Loading />
					</div>
				) : (
					<Reload size={17} color="#ccc" />
				)}
			</ReloadContainer>
		),
		[ButtonToTheSide.CLEAN]: (
			<Button>
				<Clean size={14} onClick={cleanHistory} />
			</Button>
		),
		[ButtonToTheSide.NOTHING]: <></>,
	};

	const showSearchResultJSX: Record<SearchStatus, JSX.Element> = {
		[SearchStatus.NOTHING_FOUND]: (
			<NothingFound>
				Nothing was found for &quot{searcher.searchTerm}&quot
			</NothingFound>
		),
		[SearchStatus.FOUND_SOMETHING]: (
			<SearchResults results={searcher.results} fromList={fromList} />
		),
		[SearchStatus.RELOADING_ALL_MEDIAS]: <></>,
		[SearchStatus.DOING_NOTHING]: <></>,
		[SearchStatus.SEARCHING]: <></>,
	};

	return (
		<Wrapper ref={searcherRef}>
			<SearchWrapper>
				<Search>
					<SearchIcon size="1.2em" />
					<input
						onChange={e =>
							dispatchSearcher({
								type: SearcherAction.SET_SEARCH_TERM,
								value: e.target.value,
							})
						}
						placeholder="Search for songs"
						value={searcher.searchTerm}
						autoCapitalize="on"
						spellCheck="false"
						autoCorrect="off"
						type="text"
					/>
				</Search>

				{showSearchResultJSX[searcher.searchStatus]}
			</SearchWrapper>

			{buttonToTheSideJSX[buttonToTheSide]}
		</Wrapper>
	);
}

const { getState: getCurrentPlaying } = useCurrentPlaying;
const playMedia = (mediaID: MediaID, playlistName: Playlist["name"]) =>
	getCurrentPlaying().setCurrentPlaying({
		type: CurrentPlayingEnum.PLAY_THIS_MEDIA,
		playlistName,
		mediaID,
	});

function SearchResults({
	fromList,
	results,
}: {
	fromList: MediaListKindProps["playlistName"];
	results: readonly Media[];
}) {
	const Row = memo(
		({ media }: { media: Media }) => (
			<Result onClick={() => playMedia(media.id, fromList)}>
				<ImgWrapper>
					<ImgWithFallback
						Fallback={<MusicNote size="1.4em" />}
						media={media}
					/>
				</ImgWrapper>

				<Info>
					<Title style={{ marginLeft: 5, textAlign: "left" }}>
						{media.title}
					</Title>
					<SubTitle style={{ marginLeft: 5 }}>{media.duration}</SubTitle>
				</Info>
			</Result>
		),
		(prevMedia, nextMedia) => prevMedia.media.id === nextMedia.media.id,
	);
	Row.displayName = "Row";

	return (
		<SearchResultsWrapper>
			<Virtuoso
				itemContent={(_, media) => <Row media={media} />}
				computeItemKey={(_, { id }) => id}
				totalCount={results.length}
				fixedItemHeight={60}
				className="list"
				data={results}
				overscan={10}
				height={400}
				width={250}
				noValidate
				async
			/>
		</SearchResultsWrapper>
	);
}

function searcherReducer(prev: SearcherProps, action: Action): SearcherProps {
	switch (action.type) {
		case SearcherAction.SET_RESULTS: {
			const { searchTerm, searchStatus } = prev;

			return {
				results: action.value,
				searchStatus,
				searchTerm,
			};
		}

		case SearcherAction.SET_SEARCH_TERM: {
			const { results, searchStatus } = prev;

			return {
				searchTerm: action.value,
				searchStatus,
				results,
			};
		}

		case SearcherAction.SET_SEARCH_STATUS: {
			const { results, searchTerm } = prev;

			return {
				searchStatus: action.value,
				searchTerm,
				results,
			};
		}

		default:
			return assertUnreachable(action);
	}
}

type SearcherProps = Readonly<{
	searchStatus: SearchStatus;
	results: readonly Media[];
	searchTerm: string;
}>;

type Action =
	| Readonly<{ type: SearcherAction.SET_SEARCH_STATUS; value: SearchStatus }>
	| Readonly<{ type: SearcherAction.SET_RESULTS; value: readonly Media[] }>
	| Readonly<{ type: SearcherAction.SET_SEARCH_TERM; value: string }>;

type Props = Readonly<{
	fromList: MediaListKindProps["playlistName"];
	buttonToTheSide: ButtonToTheSide;
}>;

enum SearcherAction {
	SET_SEARCH_STATUS,
	SET_SEARCH_TERM,
	SET_RESULTS,
}

export enum ButtonToTheSide {
	RELOAD_BUTTON,
	NOTHING,
	CLEAN,
}
