import type { Media, Path } from "@common/@types/generalTypes";

import { useEffect, useRef, useState, useTransition } from "react";
import { MdMusicNote as MusicNote } from "react-icons/md";
import create from "zustand";

import { PopoverContent, PopoverRoot } from "@components/Popover";
import { PlaylistList, searchMedia } from "@contexts/mediaHandler/usePlaylists";
import { constRefToEmptyArray } from "@utils/array";
import { useOnClickOutside } from "@hooks/useOnClickOutside";
import { ImgWithFallback } from "@components/ImgWithFallback";
import { playThisMedia } from "@contexts/mediaHandler/useCurrentPlaying";
import { Tooltip } from "@components/Tooltip";

import { Img } from "../MediaListKind/styles";
import {
	SearchMediaPopoverAnchor,
	NothingFound,
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
	FOUND_SOMETHING,
	DOING_NOTHING,
	NOTHING_FOUND,
	SEARCHING,
}

const { FOUND_SOMETHING, NOTHING_FOUND, DOING_NOTHING, SEARCHING } =
	SearchStatus;

////////////////////////////////////////////////////////
////////////////////////////////////////////////////////
////////////////////////////////////////////////////////

export const defaultSearcher: Searcher = Object.freeze({
	results: constRefToEmptyArray,
	searchStatus: DOING_NOTHING,
	searchTerm: "",
});

const useSearcher = create(() => defaultSearcher);
const { setState: setSearcher } = useSearcher;

////////////////////////////////////////////////////////
////////////////////////////////////////////////////////
////////////////////////////////////////////////////////

const updateSearchTerm = (e: InputChange) =>
	setSearcher({ searchTerm: e.target.value.toLowerCase() });

////////////////////////////////////////////////////////
////////////////////////////////////////////////////////
////////////////////////////////////////////////////////

export function Input() {
	const [isOnFocus, setIsOnFocus] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);
	const [, startTransition] = useTransition();
	const { searchTerm } = useSearcher();

	useOnClickOutside(inputRef, () => {
		if (isOnFocus) {
			setSearcher(defaultSearcher);
			setIsOnFocus(false);
		}
	});

	// Close the popover when the user presses Esc:
	useEffect(() => {
		const closeOnEsc = ({ key }: KeyboardEvent) => {
			if (key === "Escape" && isOnFocus) {
				setSearcher(defaultSearcher);
				inputRef.current?.blur();
				setIsOnFocus(false);
			}
		};

		document.addEventListener("keydown", closeOnEsc);

		return () => document.removeEventListener("keydown", closeOnEsc);
	}, [isOnFocus]);

	useEffect(
		function handleOnChange() {
			setSearcher({
				results: constRefToEmptyArray,
				searchStatus: SEARCHING,
			});

			if (searchTerm.length < 2) return;

			startTransition(() => {
				const results = searchMedia(searchTerm);
				const searchStatus =
					results.length > 0 ? FOUND_SOMETHING : NOTHING_FOUND;

				setSearcher({ searchStatus, results });

				// Doing this to keep focus on it...	:|
				setTimeout(() => inputRef.current?.focus(), 0);
			});
		},
		[searchTerm],
	);

	return (
		<>
			<label htmlFor="search-songs">Search for songs</label>
			<input
				onClick={() => setIsOnFocus(true)}
				onChange={updateSearchTerm}
				value={searchTerm}
				spellCheck="false"
				id="search-songs"
				autoCorrect="off"
				ref={inputRef}
				type="text"
			/>
		</>
	);
}

const Row = ({
	media: { title, img, duration },
	highlight,
	path,
}: RowProps) => {
	const index = title.toLowerCase().indexOf(highlight);

	return (
		<Tooltip text="Play this media">
			<Result onClick={() => playThisMedia(path, PlaylistList.MAIN_LIST)}>
				<Img>
					<ImgWithFallback
						Fallback={<MusicNote size={13} />}
						mediaPath={path}
						mediaImg={img}
					/>
				</Img>

				<Info>
					<Title>
						{title.slice(0, index)}
						<Highlight>
							{title.slice(index, index + highlight.length)}
						</Highlight>
						{title.slice(index + highlight.length)}
					</Title>
					<SubTitle>{duration}</SubTitle>
				</Info>
			</Result>
		</Tooltip>
	);
};

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
						{results.map(([path, media]) => (
							<Row
								highlight={searchTerm}
								media={media}
								path={path}
								key={path}
							/>
						))}
					</>
				) : undefined}
			</PopoverContent>
		</PopoverRoot>
	);
}

////////////////////////////////////////////////////////
////////////////////////////////////////////////////////
////////////////////////////////////////////////////////

type Searcher = Readonly<{
	results: readonly [Path, Media][];
	searchTerm: Lowercase<string>;
	searchStatus: SearchStatus;
}>;

type RowProps = Readonly<{
	highlight: Lowercase<string>;
	media: Media;
	path: Path;
}>;

type InputChange = React.ChangeEvent<HTMLInputElement>;
