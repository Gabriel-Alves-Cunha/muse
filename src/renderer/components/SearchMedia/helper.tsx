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

import { RightSlot } from "@components/ContextMenu/styles";
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

// I know this function is not the prettiest... I wanted to have specific
// abilities wich made me make this beautiful component...
export function InputAndResults() {
	const { searchStatus, searchTerm, results } = useSearcher();
	const [isOnFocus, setIsOnFocus] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);
	const [, startTransition] = useTransition();

	const foundSomething = searchStatus === FOUND_SOMETHING;
	const nothingFound = searchStatus === NOTHING_FOUND;
	const shouldPopoverOpen = foundSomething || nothingFound;

	// Close everything when the user clicks outside of the input,
	// but only if the input is not focused so it doesn't fire
	// everytime the user clicks outside of the input;
	// But if the user clicked on a media, we must play it,
	// so the only I found this to work was to wait a bit,
	// I found that such time had to be high, I settled on
	// a time of 200ms, but maybe on a slow machine it could
	// be need a higher time for the event to bubble...
	useOnClickOutside(inputRef, () =>
		isOnFocus && setTimeout(() => {
			setSearcher(defaultSearcher);
			setIsOnFocus(false);
			inputRef.current?.blur();
		}, 200));

	useEffect(() => {
		function closeSearchMediaPopoverOnEsc({ key }: KeyboardEvent) {
			if (key === "Escape" && isOnFocus) {
				setSearcher(defaultSearcher);
				setIsOnFocus(false);
				inputRef.current?.blur();
			}
		}

		window.addEventListener("keydown", closeSearchMediaPopoverOnEsc);

		return () =>
			window.removeEventListener("keydown", closeSearchMediaPopoverOnEsc);
	}, [isOnFocus]);

	useEffect(function searchForMedia() {
		setSearcher({ results: constRefToEmptyArray, searchStatus: SEARCHING });

		if (searchTerm.length < 2) return;

		// Using startTransition in case the search takes too long:
		startTransition(() => {
			const results = searchMedia(searchTerm);
			const searchStatus = results.length > 0 ? FOUND_SOMETHING : NOTHING_FOUND;

			setSearcher({ searchStatus, results });

			// Doing this hack to keep focus on the input cause
			// it is lost when the popover opens...	:(
			setTimeout(() => inputRef.current?.focus());
		});
	}, [searchTerm]);

	return (
		<>
			<>
				<label htmlFor="search-songs">Search for songs</label>
				<input
					onFocus={() => setIsOnFocus(true)}
					onChange={updateSearchTerm}
					value={searchTerm}
					spellCheck="false"
					key="search-songs"
					id="search-songs"
					autoCorrect="off"
					ref={inputRef}
					accessKey="k"
					type="text"
				/>

				{!isOnFocus && <RightSlot id="search">Alt+k</RightSlot>}
			</>

			<PopoverRoot open={shouldPopoverOpen}>
				<SearchMediaPopoverAnchor />

				<PopoverContent
					size={nothingFound ?
						"nothing-found-for-search-media" :
						"search-media-results"}
				>
					{nothingFound ?
						(
							<NothingFound>
								Nothing was found for &quot;{searchTerm}&quot;
							</NothingFound>
						) :
						foundSomething ?
						(results.map(([path, media]) => (
							<Row
								highlight={searchTerm}
								media={media}
								path={path}
								key={path}
							/>
						))) :
						undefined}
				</PopoverContent>
			</PopoverRoot>
		</>
	);
}

function Row({ media: { title, img, duration }, highlight, path }: RowProps) {
	const index = title.toLowerCase().indexOf(highlight);

	return (
		<Result
			onClick={() => playThisMedia(path, PlaylistList.MAIN_LIST)}
			data-tip="Play this media"
		>
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
					<Highlight>{title.slice(index, index + highlight.length)}</Highlight>
					{title.slice(index + highlight.length)}
				</Title>
				<SubTitle>{duration}</SubTitle>
			</Info>
		</Result>
	);
}

////////////////////////////////////////////////////////
////////////////////////////////////////////////////////
////////////////////////////////////////////////////////

type Searcher = Readonly<
	{
		results: readonly [Path, Media][];
		searchTerm: Lowercase<string>;
		searchStatus: SearchStatus;
	}
>;

type RowProps = Readonly<
	{ highlight: Lowercase<string>; media: Media; path: Path; }
>;

type InputChange = Readonly<React.ChangeEvent<HTMLInputElement>>;
