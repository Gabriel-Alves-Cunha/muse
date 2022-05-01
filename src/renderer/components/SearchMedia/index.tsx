import type { MediaListKindProps } from "../MediaListKind";

import { useEffect, useRef, useTransition } from "react";
import { AiOutlineSearch as SearchIcon } from "react-icons/ai";
import { MdAutorenew as Reload } from "react-icons/md";
import { FiTrash as Clean } from "react-icons/fi";

import { searchForMediaFromList } from "@contexts";
import { useOnClickOutside } from "@hooks";
import { Tooltip } from "@components";
import {
	constRefToEmptyArray,
	handleInputChange,
	ButtonToTheSide,
	defaultSearcher,
	cleanHistory,
	SearchStatus,
	useSearcher,
	setSearcher,
	reload,
	Row,
} from "./helper";

import {
	SearchResultsWrapper,
	SearchWrapper,
	NothingFound,
	Wrapper,
	Search,
	Button,
} from "./styles";

export function SearchMedia({ buttonToTheSide, playlistName }: Props) {
	const searcherRef = useRef<HTMLHeadingElement>(null);
	const [, startTransition] = useTransition();
	const searcher = useSearcher();

	const { searchStatus, searchTerm, results } = searcher;

	useOnClickOutside(searcherRef, () =>
		// This shit is not returning a const ref to defaultSearcher for why???
		// searcher === defaultSearcher
		JSON.stringify(searcher) === JSON.stringify(defaultSearcher)
			? undefined
			: setSearcher(defaultSearcher),
	);

	useEffect(() => {
		setSearcher(prev => ({
			...prev,
			searchStatus: SearchStatus.SEARCHING,
			results: constRefToEmptyArray,
		}));

		if (searchTerm.length < 2) return;

		startTransition(() => {
			const results = searchForMediaFromList(searchTerm, playlistName);
			const searchStatus =
				results.length > 0
					? SearchStatus.FOUND_SOMETHING
					: SearchStatus.NOTHING_FOUND;

			setSearcher(prev => ({
				...prev,
				searchStatus,
				results,
			}));
		});
	}, [playlistName, searchTerm]);

	console.log(searcher, "are they the same?", searcher === defaultSearcher);

	return (
		<Wrapper>
			<SearchWrapper ref={searcherRef}>
				<Search>
					<SearchIcon size="1.1rem" />

					<input
						placeholder="Search for songs"
						onChange={handleInputChange}
						value={searchTerm}
						spellCheck="false"
						autoCorrect="off"
					/>
				</Search>

				{searchStatus === SearchStatus.NOTHING_FOUND ? (
					<NothingFound>
						Nothing was found for &quot;
						{searchTerm}
						&quot;
					</NothingFound>
				) : searchStatus === SearchStatus.FOUND_SOMETHING ? (
					<SearchResultsWrapper>
						{results.map(media => (
							<Row
								playlistName={playlistName}
								highlight={searchTerm}
								key={media.id}
								media={media}
							/>
						))}
						{/* <Virtuoso
							itemContent={(_, media) => (
								<Row
									playlistName={playlistName}
									highlight={highlight}
									media={media}
								/>
							)}
							computeItemKey={(_, m) => m.id}
							totalCount={results.length}
							fixedItemHeight={65}
							className="list"
							data={results}
							overscan={10}
							noValidate
							async
						/> */}
					</SearchResultsWrapper>
				) : (
					<></>
				)}
			</SearchWrapper>

			{buttonToTheSide === ButtonToTheSide.RELOAD_BUTTON ? (
				<Tooltip text="Reload all medias">
					<Button onClick={reload} className="reload">
						<Reload
							className={
								searchStatus === SearchStatus.RELOADING_ALL_MEDIAS
									? "reloading"
									: ""
							}
							size={17}
						/>
					</Button>
				</Tooltip>
			) : buttonToTheSide === ButtonToTheSide.CLEAN ? (
				<Tooltip text="Clean history">
					<Button>
						<Clean size={15} onClick={cleanHistory} />
					</Button>
				</Tooltip>
			) : (
				<></>
			)}
		</Wrapper>
	);
}

type Props = Readonly<{
	playlistName: MediaListKindProps["playlistName"];
	buttonToTheSide: ButtonToTheSide;
}>;

SearchMedia.whyDidYouRender = {
	logOnDifferentValues: true,
	customName: "SearchMedia",
};
