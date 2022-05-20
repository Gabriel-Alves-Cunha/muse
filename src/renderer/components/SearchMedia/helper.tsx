import type { MediaListKindProps } from "@components/MediaListKind";
import type { Media } from "@common/@types/generalTypes";

import { useEffect, useRef, useTransition } from "react";
import { FiTrash as Clean } from "react-icons/fi";
import {
	MdMusicNote as MusicNote,
	MdAutorenew as Reload,
} from "react-icons/md";
import create from "zustand";

import { PopoverContent, PopoverRoot } from "@components/Popover";
import { constRefToEmptyArray } from "@utils/array";
import { useOnClickOutside } from "@hooks/useOnClickOutside";
import { ImgWithFallback } from "@components/ImgWithFallback";
import { MAIN_LIST } from "@contexts/mediaHandler/usePlaylistsHelper";
import { Tooltip } from "@components/Tooltip";
import {
	searchLocalComputerForMedias,
	searchMedia,
	PlaylistActions,
	WhatToDo,
	setPlaylists,
} from "@contexts/mediaHandler/usePlaylists";
import {
	CurrentPlayingEnum,
	setCurrentPlaying,
} from "@contexts/mediaHandler/useCurrentPlaying";

import { ImgWrapper } from "../MediaListKind/styles";
import {
	SearchMediaPopoverAnchor,
	NothingFound,
	ReloadButton,
	Highlight,
	SubTitle,
	Result,
	Title,
	Info,
} from "./styles";

////////////////////////////////////////////////////////
////////////////////////////////////////////////////////
////////////////////////////////////////////////////////

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

////////////////////////////////////////////////////////
////////////////////////////////////////////////////////
////////////////////////////////////////////////////////

export const defaultSearcher: Searcher = Object.freeze({
	results: constRefToEmptyArray,
	searchStatus: DOING_NOTHING,
	searchTerm: "",
});

export const useSearcher = create(() => defaultSearcher);
export const { setState: setSearcher } = useSearcher;

////////////////////////////////////////////////////////
////////////////////////////////////////////////////////
////////////////////////////////////////////////////////

const cleanHistory = () =>
	setPlaylists({
		type: WhatToDo.UPDATE_HISTORY,
		whatToDo: PlaylistActions.CLEAN,
	});

const reload = async () => {
	setSearcher({
		...defaultSearcher,
		searchStatus: RELOADING_ALL_MEDIAS,
	});

	await searchLocalComputerForMedias(true);

	setSearcher({ searchStatus: DOING_NOTHING });
};

export const setSearchTerm = (e: InputChange) =>
	setSearcher({ searchTerm: e.target.value.toLowerCase() });

const playMedia = (mediaID: Media["id"]) =>
	setCurrentPlaying({
		type: CurrentPlayingEnum.PLAY_THIS_MEDIA,
		list: MAIN_LIST,
		path: mediaID,
	});

////////////////////////////////////////////////////////
////////////////////////////////////////////////////////
////////////////////////////////////////////////////////

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

export function Input() {
	const inputRef = useRef<HTMLInputElement>(null);
	const [, startTransition] = useTransition();
	const { searchTerm } = useSearcher();

	useOnClickOutside(inputRef, () => searchTerm && setSearcher(defaultSearcher));

	useEffect(() => {
		setSearcher({
			results: constRefToEmptyArray,
			searchStatus: SEARCHING,
		});

		if (searchTerm.length < 2) return;

		startTransition(() => {
			const results = searchMedia(searchTerm);
			const searchStatus = results.length > 0 ? FOUND_SOMETHING : NOTHING_FOUND;

			setSearcher({ searchStatus, results });

			// Doing this to keep focus on it...	:|
			setTimeout(() => inputRef.current?.focus(), 0);
		});
	}, [searchTerm]);

	return (
		<input
			placeholder="Search for songs"
			onChange={setSearchTerm}
			value={searchTerm}
			spellCheck="false"
			autoCorrect="off"
			ref={inputRef}
			type="text"
		/>
	);
}

export function Results() {
	const { searchStatus, searchTerm, results } = useSearcher();
	const foundSomething = searchStatus === FOUND_SOMETHING;
	const nothingFound = searchStatus === NOTHING_FOUND;
	const shouldOpen = foundSomething || nothingFound;

	return (
		<PopoverRoot open={shouldOpen}>
			<SearchMediaPopoverAnchor />

			<PopoverContent
				size={
					nothingFound
						? "nothing-found-for-search-media"
						: "search-media-results"
				}
			>
				{nothingFound ? (
					<NothingFound>
						Nothing was found for &quot;{searchTerm}&quot;
					</NothingFound>
				) : foundSomething ? (
					<>
						{results.map(media => (
							<Row highlight={searchTerm} key={media.id} media={media} />
						))}
					</>
				) : undefined}
			</PopoverContent>
		</PopoverRoot>
	);
}

export function ButtonToTheSide({ buttonToTheSide }: Props1) {
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
}

////////////////////////////////////////////////////////
////////////////////////////////////////////////////////
////////////////////////////////////////////////////////

type Searcher = Readonly<{
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

////////////////////////////////////////////////////////
////////////////////////////////////////////////////////
////////////////////////////////////////////////////////

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
