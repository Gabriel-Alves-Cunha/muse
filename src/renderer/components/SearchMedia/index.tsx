import type { MediaListKindProps } from "../MediaListKind/MediaOptions/Change";
import type { Media } from "@common/@types/typesAndEnums";

import { FixedSizeList, type ListChildComponentProps } from "react-window";
import { useEffect, useReducer, useRef } from "react";
import { AiOutlineSearch as SearchIcon } from "react-icons/ai";
import { IoMdMusicalNote as MusicNote } from "react-icons/io";
import { IoReloadSharp as Reload } from "react-icons/io5";
import { FiTrash as Clean } from "react-icons/fi";

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

import { Img, Info, SubTitle, Title } from "../MediaListKind/styles";
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
});

export function SearchMedia({ fromList, buttonToTheSide }: Props) {
	const { searchLocalComputerForMedias, searchForMedia, setPlaylists } =
		usePlaylists();
	const [searcher, dispatchSearcher] = useReducer(
		searcherReducer,
		defaultSearcher,
	);
	const searcherRef = useRef(null);

	useOnClickOutside(searcherRef, () => {
		dispatchSearcher({ type: SearcherAction.SET_SEARCH_TERM, value: "" });
		dispatchSearcher({ type: SearcherAction.SET_RESULTS, value: [] });
	});

	const reload = async () => {
		dispatchSearcher({
			type: SearcherAction.SET_SEARCH_STATUS,
			value: SearchStatus.RELOADING_ALL_MEDIAS,
		});

		await searchLocalComputerForMedias(true);

		dispatchSearcher({
			type: SearcherAction.SET_SEARCH_STATUS,
			value: SearchStatus.DOING_NOTHING,
		});
	};

	const cleanHistory = () =>
		setPlaylists({
			type: PlaylistEnum.UPDATE_HISTORY,
			whatToDo: PlaylistActions.CLEAN,
		});

	useEffect(() => {
		if (searcher.searchTerm.length < 2) return;

		const searchTimeout = setTimeout(
			() =>
				dispatchSearcher({
					value: searchForMedia(searcher.searchTerm),
					type: SearcherAction.SET_RESULTS,
				}),
			300,
		);

		return () => clearTimeout(searchTimeout);
	}, [searchForMedia, searcher.searchTerm]);

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

function playMedia(media: Media, playlistName: Playlist["name"]) {
	getCurrentPlaying().setCurrentPlaying({
		type: CurrentPlayingEnum.PLAY_THIS_MEDIA,
		playlistName,
		media,
	});
}

function SearchResults({
	results,
	fromList,
}: {
	fromList: MediaListKindProps["playlistName"];
	results: readonly Media[];
}) {
	const { playlists } = usePlaylists();
	const listWrapperReference = useRef<HTMLElement>(null);

	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	const playlist = playlists.find(({ name }) => name === fromList)!;
	if (!playlist)
		console.error(`There should be "${fromList}" to search through!`);

	const Row = ({
		index,
		data,
		style,
	}: ListChildComponentProps<readonly Media[]>) => {
		const media = data[index];

		return (
			<Result
				onClick={() => playMedia(media, fromList)}
				key={media.id}
				style={style}
			>
				<Img>
					<ImgWithFallback
						Fallback={<MusicNote size="1.4em" />}
						media={media}
					/>
				</Img>

				<Info>
					<Title style={{ marginLeft: 5, textAlign: "left" }}>
						{media.title}
					</Title>
					<SubTitle style={{ marginLeft: 5 }}>{media.duration}</SubTitle>
				</Info>
			</Result>
		);
	};

	return (
		<SearchResultsWrapper ref={listWrapperReference}>
			<FixedSizeList
				itemKey={(index, results) => results[index].id}
				itemCount={results.length}
				itemData={results}
				overscanCount={15}
				className="list"
				itemSize={60}
				height={400}
				width={250}
			>
				{Row}
			</FixedSizeList>
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
