import type { MediaListKindProps } from "@components/MediaListKind";
import type { Media, MediaID } from "@common/@types/typesAndEnums";

import { useEffect, useTransition } from "react";
import { FiTrash as Clean } from "react-icons/fi";
import {
	MdMusicNote as MusicNote,
	MdAutorenew as Reload,
} from "react-icons/md";
import create from "zustand";

import { constRefToEmptyArray } from "@utils/array";
import {
	searchLocalComputerForMedias,
	searchForMediaFromList,
	CurrentPlayingEnum,
	setCurrentPlaying,
	PlaylistActions,
	PlaylistEnum,
	setPlaylists,
} from "@contexts";
import {
	ImgWithFallback,
	PopoverContent,
	PopoverRoot,
	Tooltip,
} from "@components";

import { ImgWrapper, Info } from "../MediaListKind/styles";
import {
	SearchMediaPopoverAnchor,
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

export const defaultSearcher: Searcher = Object.freeze({
	results: constRefToEmptyArray,
	searchStatus: DOING_NOTHING,
	playlistName: "",
	searchTerm: "",
});

export const useSearcher = create(() => defaultSearcher);
export const { setState: setSearcher } = useSearcher;

const cleanHistory = () =>
	setPlaylists({
		type: PlaylistEnum.UPDATE_HISTORY,
		whatToDo: PlaylistActions.CLEAN,
	});

const reload = async () => {
	setSearcher({
		searchStatus: RELOADING_ALL_MEDIAS,
		results: constRefToEmptyArray,
		searchTerm: "",
	});

	await searchLocalComputerForMedias(true);

	setSearcher({ searchStatus: DOING_NOTHING });
};

export const setSearchTerm = ({ target: { value } }: InputChange) =>
	setSearcher({ searchTerm: value.toLowerCase() });

const playMedia = (mediaID: MediaID) => {
	const { playlistName } = useSearcher.getState();

	setCurrentPlaying({
		type: CurrentPlayingEnum.PLAY_THIS_MEDIA,
		playlistName,
		mediaID,
	});
};

const Row = ({ highlight, media }: RowProps) => {
	const index = media.title.toLowerCase().indexOf(highlight);

	return (
		<Tooltip text="Play this media">
			<Result onClick={() => playMedia(media.id)}>
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

export const Input = () => {
	const { searchTerm, playlistName } = useSearcher();
	const [, startTransition] = useTransition();

	useEffect(() => {
		setSearcher({ results: constRefToEmptyArray });

		if (searchTerm.length < 2) return;

		setSearcher({ searchStatus: SEARCHING });

		startTransition(() => {
			const results = searchForMediaFromList(searchTerm, playlistName);
			const searchStatus = results.length > 0 ? FOUND_SOMETHING : NOTHING_FOUND;

			setSearcher({ searchStatus, results });
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [searchTerm]);

	return (
		<input
			placeholder="Search for songs"
			onChange={setSearchTerm}
			value={searchTerm}
			spellCheck="false"
			autoCorrect="off"
		/>
	);
};

export const Results = () => {
	const { searchStatus, searchTerm, results } = useSearcher();
	const foundSomething = searchStatus === FOUND_SOMETHING;
	const nothingFound = searchStatus === NOTHING_FOUND;
	const shouldOpen = nothingFound || foundSomething;

	return (
		<PopoverRoot open={shouldOpen}>
			<SearchMediaPopoverAnchor />

			<PopoverContent
				size={
					nothingFound ? "nothingFoundForSearchMedia" : "searchMediaResults"
				}
			>
				{nothingFound ? (
					<NothingFound>
						Nothing was found for &quot;{searchTerm}&quot;
					</NothingFound>
				) : foundSomething ? (
					<SearchResults>
						{results.map(media => (
							<Row highlight={searchTerm} key={media.id} media={media} />
						))}
					</SearchResults>
				) : undefined}
			</PopoverContent>
		</PopoverRoot>
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
	playlistName: MediaListKindProps["playlistName"];
	searchTerm: Lowercase<string>;
	searchStatus: SearchStatus;
	results: readonly Media[];
}>;

type RowProps = Readonly<{
	highlight: Lowercase<string>;
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
