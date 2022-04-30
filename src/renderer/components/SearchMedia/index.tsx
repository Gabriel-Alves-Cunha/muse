import type { MediaListKindProps } from "../MediaListKind";

import { useEffect, useRef, useTransition } from "react";
import { AiOutlineSearch as SearchIcon } from "react-icons/ai";
import { MdAutorenew as Reload } from "react-icons/md";
import { FiTrash as Clean } from "react-icons/fi";
import { Virtuoso } from "react-virtuoso";

import { searchForMediaFromList } from "@contexts";
import { useOnClickOutside } from "@hooks";
import { Tooltip } from "@components";
import {
	getSearcherFunctions,
	ButtonToTheSide,
	SearcherAction,
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

export function SearchMedia({ fromList, buttonToTheSide }: Props) {
	const { searchStatus, searchTerm, results } = useSearcher().searcher;
	const searcherRef = useRef<HTMLHeadingElement>(null);
	const [, startTransition] = useTransition();

	useOnClickOutside(searcherRef, () =>
		setSearcher({ type: SearcherAction.SET_TO_DEFAULT_STATE }),
	);

	useEffect(() => {
		setSearcher({ type: SearcherAction.SET_FROM_LIST, value: fromList });
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		setSearcher({
			type: SearcherAction.SET_SEARCH_STATUS,
			value: SearchStatus.SEARCHING,
		});

		if (searchTerm.length < 2) return;

		startTransition(() => {
			setSearcher({
				value: searchForMediaFromList(searchTerm, fromList),
				type: SearcherAction.SET_RESULTS,
			});

			getSearcherFunctions().searcher.results.length === 0
				? setSearcher({
						type: SearcherAction.SET_SEARCH_STATUS,
						value: SearchStatus.NOTHING_FOUND,
				  })
				: setSearcher({
						type: SearcherAction.SET_SEARCH_STATUS,
						value: SearchStatus.FOUND_SOMETHING,
				  });
		});
	}, [fromList, searchTerm]);

	return (
		<Wrapper ref={searcherRef}>
			<SearchWrapper>
				<Search>
					<SearchIcon size="1.2rem" />
					<input
						onChange={e =>
							setSearcher({
								type: SearcherAction.SET_SEARCH_TERM,
								value: e.target.value,
							})
						}
						placeholder="Search for songs"
						value={searchTerm}
						spellCheck="false"
						autoCorrect="off"
					/>
				</Search>

				{searchStatus === SearchStatus.NOTHING_FOUND ? (
					<NothingFound>
						Nothing was found for &quot;
						{getSearcherFunctions().searcher.searchTerm}
						&quot;
					</NothingFound>
				) : searchStatus === SearchStatus.FOUND_SOMETHING ? (
					<SearchResultsWrapper>
						{/* {getSearcherFunctions().searcher.results.map(m => (
							<Row media={m} key={m.id} highlight={searchTerm.toLowerCase()} />
						))} */}
						<Virtuoso
							itemContent={(_, m) => (
								<Row media={m} highlight={searchTerm.toLowerCase()} />
							)}
							computeItemKey={(_, m) => m.id}
							totalCount={results.length}
							fixedItemHeight={65}
							className="list"
							data={results}
							overscan={10}
							noValidate
							async
						/>
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
								getSearcherFunctions().searcher.searchStatus ===
								SearchStatus.RELOADING_ALL_MEDIAS
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
	fromList: MediaListKindProps["playlistName"];
	buttonToTheSide: ButtonToTheSide;
}>;
