import type { MediaListKindProps } from "@components/MediaListKind";
import type { Media, MediaID } from "@common/@types/typesAndEnums";

import { useEffect, useTransition } from "react";
import { FiTrash as Clean } from "react-icons/fi";
import {
	MdMusicNote as MusicNote,
	MdAutorenew as Reload,
} from "react-icons/md";
import create from "zustand";

import { ImgWithFallback, Tooltip } from "@components";
import {
	searchLocalComputerForMedias,
	searchForMediaFromList,
	CurrentPlayingEnum,
	setCurrentPlaying,
	PlaylistActions,
	PlaylistEnum,
	setPlaylists,
} from "@contexts";

import { ImgWrapper, Info } from "../MediaListKind/styles";
import {
	ResultsWrapper,
	SearchResults,
	NothingFound,
	ReloadButton,
	Highlight,
	SubTitle,
	Result,
	Title,
} from "./styles";

export enum SearchStatus {
	RELOADING_ALL_MEDIAS,
	FOUND_SOMETHING,
	DOING_NOTHING,
	NOTHING_FOUND,
	SEARCHING,
}

export enum ButtonToTheSideEnum {
	RELOAD_BUTTON,
	NOTHING,
	CLEAN,
}

const { CLEAN, RELOAD_BUTTON } = ButtonToTheSideEnum;
const {
	RELOADING_ALL_MEDIAS,
	FOUND_SOMETHING,
	NOTHING_FOUND,
	DOING_NOTHING,
	SEARCHING,
} = SearchStatus;

export const constRefToEmptyArray = Object.freeze([]);
export const defaultSearcher: Searcher = Object.freeze({
	results: constRefToEmptyArray,
	searchStatus: DOING_NOTHING,
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
		searchStatus: RELOADING_ALL_MEDIAS,
	});

	await searchLocalComputerForMedias(true);

	setSearcher({
		searchStatus: DOING_NOTHING,
	});
};

export const handleInputChange = ({ target: { value } }: InputChange) =>
	setSearcher({ searchTerm: value.toLowerCase() });

const playMedia = (mediaID: MediaID, playlistName: string) =>
	setCurrentPlaying({
		type: CurrentPlayingEnum.PLAY_THIS_MEDIA,
		playlistName,
		mediaID,
	});

export const Row = ({ highlight, media, playlistName }: RowProps) => {
	const index = media.title.toLowerCase().indexOf(highlight);

	return (
		<Tooltip text="Play this media">
			<Result onClick={() => playMedia(media.id, playlistName)}>
				<ImgWrapper>
					<ImgWithFallback Fallback={<MusicNote size={13} />} media={media} />
				</ImgWrapper>

				<Info>
					<Title>
						{media.title.slice(0, index)}
						<Highlight>
							{media.title.slice(index, index + highlight.length)}
						</Highlight>
						{media.title.slice(index + highlight.length)}
					</Title>
					<SubTitle>{media.duration}</SubTitle>
				</Info>
			</Result>
		</Tooltip>
	);
};

export const Input = ({ playlistName }: Props2) => {
	const [, startTransition] = useTransition();
	const { searchTerm } = useSearcher();

	useEffect(() => {
		setSearcher({
			results: constRefToEmptyArray,
			searchStatus: SEARCHING,
		});

		if (searchTerm.length < 2) return;

		startTransition(() => {
			const results = searchForMediaFromList(searchTerm, playlistName);
			const searchStatus = results.length > 0 ? FOUND_SOMETHING : NOTHING_FOUND;

			setSearcher({
				searchStatus,
				results,
			});
		});
	}, [playlistName, searchTerm]);

	return (
		<input
			placeholder="Search for songs"
			onChange={handleInputChange}
			value={searchTerm}
			spellCheck="false"
			autoCorrect="off"
		/>
	);
};

export const Results = ({ playlistName }: Props2) => {
	const { searchStatus, searchTerm, results } = useSearcher();

	return (
		<ResultsWrapper>
			{searchStatus === NOTHING_FOUND ? (
				<NothingFound>
					Nothing was found for &quot;{searchTerm}&quot;
				</NothingFound>
			) : searchStatus === FOUND_SOMETHING ? (
				<SearchResults>
					{results.map(media => (
						<Row
							playlistName={playlistName}
							highlight={searchTerm}
							key={media.id}
							media={media}
						/>
					))}
				</SearchResults>
			) : undefined}
		</ResultsWrapper>
	);
};

export const ButtonToTheSide = ({ buttonToTheSide }: Props1) => {
	const { searchStatus } = useSearcher();

	return (
		<div>
			{buttonToTheSide === RELOAD_BUTTON ? (
				<Tooltip text="Reload all medias">
					<ReloadButton onClick={reload} className="reload">
						<Reload
							className={
								searchStatus === RELOADING_ALL_MEDIAS ? "reloading" : ""
							}
							size={17}
						/>
					</ReloadButton>
				</Tooltip>
			) : buttonToTheSide === CLEAN ? (
				<Tooltip text="Clean history">
					<ReloadButton>
						<Clean size={15} onClick={cleanHistory} />
					</ReloadButton>
				</Tooltip>
			) : undefined}
		</div>
	);
};

type Searcher = Readonly<{
	searchTerm: Lowercase<string>;
	searchStatus: SearchStatus;
	results: readonly Media[];
}>;

type RowProps = Readonly<{
	playlistName: string;
	highlight: string;
	media: Media;
}>;

type Props1 = Readonly<{
	buttonToTheSide: ButtonToTheSideEnum;
}>;

type Props2 = Readonly<{
	playlistName: MediaListKindProps["playlistName"];
}>;

type InputChange = React.ChangeEvent<HTMLInputElement>;

export type Props = Props1 & Props2;

Row.whyDidYouRender = {
	customName: "Row",
};

Input.whyDidYouRender = {
	customName: "Input",
};

Results.whyDidYouRender = {
	customName: "Results",
};

ButtonToTheSide.whyDidYouRender = {
	customName: "ButtonToTheSide",
};
