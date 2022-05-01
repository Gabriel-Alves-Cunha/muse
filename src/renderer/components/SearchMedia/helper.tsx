import type { Media, MediaID } from "@common/@types/typesAndEnums";

import { FiTrash as Clean } from "react-icons/fi";
import {
	MdMusicNote as MusicNote,
	MdAutorenew as Reload,
} from "react-icons/md";
import create from "zustand";

import { ImgWithFallback, Tooltip } from "@components";
import {
	searchLocalComputerForMedias,
	CurrentPlayingEnum,
	setCurrentPlaying,
	PlaylistActions,
	PlaylistEnum,
	setPlaylists,
} from "@contexts";

import { ImgWrapper, Info, SubTitle, Title } from "../MediaListKind/styles";
import { Result, Button } from "./styles";

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

export const constRefToEmptyArray = [];
export const defaultSearcher: SearcherProps = Object.freeze({
	searchStatus: SearchStatus.DOING_NOTHING,
	results: constRefToEmptyArray,
	searchTerm: "",
});

export const useSearcher = create(() => defaultSearcher);
export const { getState: getSearcher, setState: setSearcher } = useSearcher;

export const cleanHistory = () =>
	setPlaylists({
		type: PlaylistEnum.UPDATE_HISTORY,
		whatToDo: PlaylistActions.CLEAN,
	});

export const reload = async () => {
	setSearcher({
		...defaultSearcher,
		searchStatus: SearchStatus.RELOADING_ALL_MEDIAS,
	});

	await searchLocalComputerForMedias(true);

	setSearcher({
		...defaultSearcher,
		searchStatus: SearchStatus.DOING_NOTHING,
	});
};

export const handleInputChange = ({
	target: { value },
}: React.ChangeEvent<HTMLInputElement>) =>
	setSearcher(prev => ({
		...prev,
		searchTerm: value.toLowerCase(),
	}));

const playMedia = (mediaID: MediaID, playlistName: string) =>
	setCurrentPlaying({
		type: CurrentPlayingEnum.PLAY_THIS_MEDIA,
		playlistName,
		mediaID,
	});

export const Row = ({ highlight, media, playlistName }: RowProps) => {
	const index = media.title.toLowerCase().indexOf(highlight);

	return (
		<Result onClick={() => playMedia(media.id, playlistName)}>
			<Tooltip text="Play this media">
				<>
					<ImgWrapper>
						<ImgWithFallback Fallback={<MusicNote size={13} />} media={media} />
					</ImgWrapper>

					<Info>
						<Title style={{ marginLeft: 5, textAlign: "left" }}>
							{media.title.slice(0, index)}
							<span className="highlight">
								{media.title.slice(index, index + highlight.length)}
							</span>
							{media.title.slice(index + highlight.length)}
						</Title>
						<SubTitle style={{ marginLeft: 5 }}>{media.duration}</SubTitle>
					</Info>
				</>
			</Tooltip>
		</Result>
	);
};

// const searchResultJSX: Map<SearchStatus, () => JSX.Element> = new Map();
// searchResultJSX.set(SearchStatus.NOTHING_FOUND, () => (
// 	<NothingFound>
// 		Nothing was found for &quot;{getSearcherFunctions().searcher.searchTerm}
// 		&quot;
// 	</NothingFound>
// ));
// searchResultJSX.set(SearchStatus.FOUND_SOMETHING, () => (
// 	<SearchResultsWrapper>
// 		{getSearcherFunctions().searcher.results.map(m => (
// 			<Row media={m} key={m.id} />
// 		))}
// 	</SearchResultsWrapper>
// ));
// searchResultJSX.set(SearchStatus.RELOADING_ALL_MEDIAS, () => <></>);
// searchResultJSX.set(SearchStatus.DOING_NOTHING, () => <></>);
// searchResultJSX.set(SearchStatus.SEARCHING, () => <></>);
// Object.freeze(searchResultJSX);
// export { searchResultJSX };

const buttonToTheSideJSX: Map<ButtonToTheSide, () => JSX.Element> = new Map();
buttonToTheSideJSX.set(ButtonToTheSide.RELOAD_BUTTON, () => (
	<Tooltip text="Reload all medias">
		<Button onClick={reload} className="reload">
			<Reload
				className={
					getSearcher().searchStatus === SearchStatus.RELOADING_ALL_MEDIAS
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

type SearcherProps = Readonly<{
	searchTerm: Lowercase<string>;
	searchStatus: SearchStatus;
	results: readonly Media[];
}>;

type RowProps = Readonly<{
	playlistName: string;
	highlight: string;
	media: Media;
}>;
