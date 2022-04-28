import type { MediaListKindProps } from "@components/MediaListKind";
import type { Media, MediaID } from "@common/@types/typesAndEnums";

import { FiTrash as Clean } from "react-icons/fi";
import {
	MdMusicNote as MusicNote,
	MdAutorenew as Reload,
} from "react-icons/md";
import create from "zustand";

import { assertUnreachable } from "@utils/utils";
import { ImgWithFallback } from "@components";
import { Tooltip } from "@components";
import {
	searchLocalComputerForMedias,
	CurrentPlayingEnum,
	setCurrentPlaying,
	PlaylistActions,
	PlaylistEnum,
	setPlaylists,
	MAIN_LIST,
} from "@contexts";

import { SearchResultsWrapper, NothingFound, Result, Button } from "./styles";
import { ImgWrapper, Info, SubTitle, Title } from "../MediaListKind/styles";

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
				set({ searcher: defaultSearcher });
				break;
			}

			default: {
				assertUnreachable(action);
				break;
			}
		}
	},
}));

export const { getState: getSearcherFunctions } = useSearcher;
export const { setSearcher } = getSearcherFunctions();

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

const playMedia = (mediaID: MediaID) =>
	setCurrentPlaying({
		playlistName: getSearcherFunctions().searcher.fromList,
		type: CurrentPlayingEnum.PLAY_THIS_MEDIA,
		mediaID,
	});

const Row = ({ media }: { media: Media }) => (
	<Result onClick={() => playMedia(media.id)}>
		<ImgWrapper>
			<ImgWithFallback Fallback={<MusicNote size={13} />} media={media} />
		</ImgWrapper>

		<Info>
			<Title style={{ marginLeft: 5, textAlign: "left" }}>{media.title}</Title>
			<SubTitle style={{ marginLeft: 5 }}>{media.duration}</SubTitle>
		</Info>
	</Result>
);

const SearchResults = ({ results }: { results: readonly Media[] }) => (
	<SearchResultsWrapper>
		<div>
			{results.map(m => (
				<Row media={m} key={m.id} />
			))}
		</div>
	</SearchResultsWrapper>
);

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
	<Tooltip text="Reload all medias">
		<Button onClick={reload} className="reload">
			<Reload
				className={
					getSearcherFunctions().searcher.searchStatus ===
					SearchStatus.RELOADING_ALL_MEDIAS
						? "reloading"
						: ""
				}
				size={17}
			/>
		</Button>
	</Tooltip>
));
buttonToTheSideJSX.set(ButtonToTheSide.CLEAN, () => (
	<Tooltip text="Clean history">
		<Button>
			<Clean size={15} onClick={cleanHistory} />
		</Button>
	</Tooltip>
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
