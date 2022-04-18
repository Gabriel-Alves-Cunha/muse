import type { MediaListKindProps } from "@components/MediaListKind";
import type { Media, MediaID } from "@common/@types/typesAndEnums";

import { FiTrash as Clean } from "react-icons/fi";
import { Virtuoso } from "react-virtuoso";
import { memo } from "react";
import {
	MdMusicNote as MusicNote,
	MdAutorenew as Reload,
} from "react-icons/md";
import create from "zustand";

import { assertUnreachable } from "@utils/utils";
import { ImgWithFallback } from "@components";
import { MAIN_LIST } from "@contexts/mediaHandler/usePlaylistsHelper";
import {
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
	NothingFound,
	Result,
	Button,
} from "./styles";

export enum SearchStatus {
	RELOADING_ALL_MEDIAS,
	FOUND_SOMETHING,
	DOING_NOTHING,
	NOTHING_FOUND,
	SEARCHING,
}

export enum ButtonToTheSide {
	RELOAD_BUTTON,
	NOTHING,
	CLEAN,
}

export enum SearcherAction {
	SET_TO_DEFAULT_STATE,
	SET_SEARCH_STATUS,
	SET_SEARCH_TERM,
	SET_FROM_LIST,
	SET_RESULTS,
}

const defaultSearcher = Object.freeze({
	searchStatus: SearchStatus.DOING_NOTHING,
	fromList: MAIN_LIST,
	searchTerm: "",
	results: [],
});

export const useSearcher = create<{
	setSearcher: (action: Action) => void;
	searcher: SearcherProps;
}>((set, get) => ({
	searcher: defaultSearcher,
	setSearcher: (action: Action) => {
		switch (action.type) {
			case SearcherAction.SET_RESULTS: {
				set({
					searcher: {
						...get().searcher,
						results: action.value,
					},
				});
				break;
			}

			case SearcherAction.SET_SEARCH_TERM: {
				set({
					searcher: {
						...get().searcher,
						searchTerm: action.value,
					},
				});
				break;
			}

			case SearcherAction.SET_SEARCH_STATUS: {
				set({
					searcher: {
						...get().searcher,
						searchStatus: action.value,
					},
				});
				break;
			}

			case SearcherAction.SET_FROM_LIST: {
				set({
					searcher: {
						...get().searcher,
						fromList: action.value,
					},
				});
				break;
			}

			case SearcherAction.SET_TO_DEFAULT_STATE: {
				set({
					searcher: defaultSearcher,
				});
				break;
			}

			default:
				assertUnreachable(action);
		}
	},
}));

const { getState: getSearcherFunctions } = useSearcher;
const { setSearcher } = getSearcherFunctions();

const { getState: getPlaylistsFunctions } = usePlaylists;
const { setPlaylists, searchLocalComputerForMedias } = getPlaylistsFunctions();

export const cleanHistory = () =>
	setPlaylists({
		type: PlaylistEnum.UPDATE_HISTORY,
		whatToDo: PlaylistActions.CLEAN,
	});

export const reload = async () => {
	setSearcher({
		value: SearchStatus.RELOADING_ALL_MEDIAS,
		type: SearcherAction.SET_SEARCH_STATUS,
	});

	await searchLocalComputerForMedias(true);

	setSearcher({
		type: SearcherAction.SET_SEARCH_STATUS,
		value: SearchStatus.DOING_NOTHING,
	});
};

const { getState: getCurrentPlaying } = useCurrentPlaying;
const playMedia = (mediaID: MediaID) =>
	getCurrentPlaying().setCurrentPlaying({
		playlistName: getSearcherFunctions().searcher.fromList,
		type: CurrentPlayingEnum.PLAY_THIS_MEDIA,
		mediaID,
	});

function SearchResults({ results }: { results: readonly Media[] }) {
	const Row = memo(
		({ media }: { media: Media }) => (
			<Result onClick={() => playMedia(media.id)}>
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

const searchResultJSX: Map<SearchStatus, () => JSX.Element> = new Map();
searchResultJSX.set(SearchStatus.NOTHING_FOUND, () => (
	<NothingFound>
		Nothing was found for &quot;{getSearcherFunctions().searcher.searchTerm}
		&quot;
	</NothingFound>
));
searchResultJSX.set(SearchStatus.FOUND_SOMETHING, () => (
	<SearchResults results={getSearcherFunctions().searcher.results} />
));
searchResultJSX.set(SearchStatus.RELOADING_ALL_MEDIAS, () => <></>);
searchResultJSX.set(SearchStatus.DOING_NOTHING, () => <></>);
searchResultJSX.set(SearchStatus.SEARCHING, () => <></>);
Object.freeze(searchResultJSX);
export { searchResultJSX };

const buttonToTheSideJSX: Map<ButtonToTheSide, () => JSX.Element> = new Map();
buttonToTheSideJSX.set(ButtonToTheSide.RELOAD_BUTTON, () => (
	<ReloadContainer onClick={reload}>
		{getSearcherFunctions().searcher.searchStatus ===
		SearchStatus.RELOADING_ALL_MEDIAS ? (
			<div style={{ transform: "scale(0.3)", animation: "" }}>
				<Loading />
			</div>
		) : (
			<Reload size={17} color="#ccc" />
		)}
	</ReloadContainer>
));
buttonToTheSideJSX.set(ButtonToTheSide.CLEAN, () => (
	<Button>
		<Clean size={17} onClick={cleanHistory} />
	</Button>
));
buttonToTheSideJSX.set(ButtonToTheSide.NOTHING, () => <></>);
Object.freeze(buttonToTheSideJSX);
export { buttonToTheSideJSX };

type Action =
	| Readonly<{
			type: SearcherAction.SET_TO_DEFAULT_STATE;
	  }>
	| Readonly<{
			type: SearcherAction.SET_SEARCH_STATUS;
			value: SearcherProps["searchStatus"];
	  }>
	| Readonly<{
			type: SearcherAction.SET_FROM_LIST;
			value: SearcherProps["fromList"];
	  }>
	| Readonly<{
			type: SearcherAction.SET_RESULTS;
			value: SearcherProps["results"];
	  }>
	| Readonly<{
			type: SearcherAction.SET_SEARCH_TERM;
			value: SearcherProps["searchTerm"];
	  }>;

type SearcherProps = Readonly<{
	fromList: MediaListKindProps["playlistName"];
	searchStatus: SearchStatus;
	results: readonly Media[];
	searchTerm: string;
}>;
