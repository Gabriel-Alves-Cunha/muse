import type { ListChildComponentProps } from "react-window";
import type { MediaListKindProps } from "../MediaListKind/MediaOptions/Change";
import type { Playlist } from "@contexts";
import type { Media } from "@common/@types/typesAndEnums";

import { useEffect, useReducer, useRef } from "react";
import { AiOutlineSearch as SearchIcon } from "react-icons/ai";
import { IoMdMusicalNote as MusicNote } from "react-icons/io";
import { IoReloadSharp as Reload } from "react-icons/io5";
import { FiTrash as Clean } from "react-icons/fi";
import { FixedSizeList } from "react-window";

import { useOnClickOutside } from "@hooks";
import { assertUnreachable } from "@utils/utils";
import { ImgWithFallback } from "@components";
import { dbg } from "@common/utils";
import {
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
	Wrapper,
	Search,
	Result,
	Button,
} from "./styles";

export function SearchMedia({ fromList, buttonToTheSide }: Props) {
	const { searchLocalComputerForMedias, searchForMedia, setPlaylists } =
		usePlaylists();

	const [searcher, dispatchSearcher] = useReducer(searcherReducer, {
		isLoading: false,
		searchTerm: "",
		results: [],
	});
	const searcherRef = useRef(null);

	useOnClickOutside(searcherRef, () => {
		dispatchSearcher({ type: SearcherAction.SET_SEARCH_TERM, value: "" });
		dispatchSearcher({ type: SearcherAction.SET_RESULTS, value: [] });
	});

	const reload = async () => {
		dispatchSearcher({ type: SearcherAction.SET_IS_LOADING, value: true });

		await searchLocalComputerForMedias(true);

		dispatchSearcher({ type: SearcherAction.SET_IS_LOADING, value: false });
	};

	const cleanHistory = () => {
		dbg("Sending msg to clean history.");

		setPlaylists({
			type: PlaylistEnum.UPDATE_HISTORY,
			whatToDo: PlaylistActions.CLEAN,
		});
	};

	useEffect(() => {
		if (searcher.searchTerm.length < 2) return;

		const searchTimeout = setTimeout(
			() =>
				dispatchSearcher({
					value: searchForMedia(searcher.searchTerm),
					type: SearcherAction.SET_RESULTS,
				}),
			400,
		);

		return () => clearTimeout(searchTimeout);
	}, [searchForMedia, searcher.searchTerm]);

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

				{searcher.results.length > 0 && (
					<SearchResults results={searcher.results} fromList={fromList} />
				)}
			</SearchWrapper>

			{(() => {
				switch (buttonToTheSide) {
					case ButtonToTheSide.RELOAD_BUTTON: {
						return (
							<ReloadContainer
								withAnimation={!searcher.isLoading}
								onClick={reload}
							>
								{searcher.isLoading ? (
									<div style={{ transform: "scale(0.3)", animation: "" }}>
										<Loading />
									</div>
								) : (
									<Reload size={17} color="#ccc" />
								)}
							</ReloadContainer>
						);
						break;
					}

					case ButtonToTheSide.CLEAN: {
						return (
							<Button>
								<Clean size={14} onClick={cleanHistory} />
							</Button>
						);
						break;
					}

					case ButtonToTheSide.NOTHING: {
						return <></>;
						break;
					}

					default: {
						return assertUnreachable(buttonToTheSide);
						break;
					}
				}
			})()}
		</Wrapper>
	);
}

const { getState: getCurrentPlaying } = useCurrentPlaying;

function playMedia(media: Media, playlist: Playlist) {
	getCurrentPlaying().setCurrentPlaying({
		type: CurrentPlayingEnum.PLAY_THIS_MEDIA,
		playlist,
		media,
	});
}

function SearchResults({
	results,
	fromList,
}: {
	fromList: MediaListKindProps["mediaType"];
	results: readonly Media[];
}) {
	const { playlists } = usePlaylists();
	const listWrapperReference = useRef<HTMLElement>(null);

	const playlist = playlists.find(({ name }) => name === fromList);
	if (!playlist)
		throw new Error(`There should be "${fromList}" to search through!`);

	const Row = ({
		index,
		data,
		style,
	}: ListChildComponentProps<readonly Media[]>) => {
		const media = data[index];

		return media ? (
			<Result
				onClick={() => playMedia(media, playlist)}
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
		) : null;
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
			const ret: SearcherProps = {
				searchTerm: prev.searchTerm,
				isLoading: prev.isLoading,
				results: action.value,
			};

			return ret;
		}

		case SearcherAction.SET_SEARCH_TERM: {
			const ret: SearcherProps = {
				isLoading: prev.isLoading,
				searchTerm: action.value,
				results: prev.results,
			};

			return ret;
		}

		case SearcherAction.SET_IS_LOADING: {
			const ret: SearcherProps = {
				searchTerm: prev.searchTerm,
				isLoading: action.value,
				results: prev.results,
			};

			return ret;
		}

		default:
			return assertUnreachable(action);
	}
}

type SearcherProps = Readonly<{
	results: readonly Media[];
	searchTerm: string;
	isLoading: boolean;
}>;

type Action =
	| Readonly<{ type: SearcherAction.SET_RESULTS; value: readonly Media[] }>
	| Readonly<{ type: SearcherAction.SET_SEARCH_TERM; value: string }>
	| Readonly<{ type: SearcherAction.SET_IS_LOADING; value: boolean }>;

enum SearcherAction {
	SET_SEARCH_TERM,
	SET_IS_LOADING,
	SET_RESULTS,
}

type Props = {
	fromList: MediaListKindProps["mediaType"];
	buttonToTheSide: ButtonToTheSide;
};

export enum ButtonToTheSide {
	RELOAD_BUTTON,
	NOTHING,
	CLEAN,
}
