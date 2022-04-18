import type { MediaListKindProps } from "../MediaListKind";

import { FiSearch as SearchIcon } from "react-icons/fi";
import { useEffect, useRef } from "react";

import { useOnClickOutside } from "@hooks";
import { usePlaylists } from "@contexts";
import {
	buttonToTheSideJSX,
	searchResultJSX,
	ButtonToTheSide,
	SearcherAction,
	SearchStatus,
	useSearcher,
} from "./helper";

import { SearchWrapper, Wrapper, Search } from "./styles";

const { getState: getSearcherFunctions } = useSearcher;
const { setSearcher } = getSearcherFunctions();

const { getState: getPlaylistsFunctions } = usePlaylists;
const { searchForMediaFromList } = getPlaylistsFunctions();

export function SearchMedia({ fromList, buttonToTheSide }: Props) {
	const searcherRef = useRef<HTMLHeadingElement>(null);
	const {
		searcher: { searchStatus, searchTerm },
	} = useSearcher();

	useOnClickOutside(searcherRef, () =>
		setSearcher({ type: SearcherAction.SET_TO_DEFAULT_STATE }),
	);

	useEffect(() => {
		setSearcher({ type: SearcherAction.SET_FROM_LIST, value: fromList });
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		if (searchTerm.length < 2) return;

		setSearcher({
			type: SearcherAction.SET_SEARCH_STATUS,
			value: SearchStatus.SEARCHING,
		});

		// TODO: use useTransition instead.
		const searchTimeout = setTimeout(() => {
			setSearcher({
				value: searchForMediaFromList(searchTerm, fromList),
				type: SearcherAction.SET_RESULTS,
			});

			if (getSearcherFunctions().searcher.results.length === 0)
				setSearcher({
					type: SearcherAction.SET_SEARCH_STATUS,
					value: SearchStatus.NOTHING_FOUND,
				});
			else
				setSearcher({
					type: SearcherAction.SET_SEARCH_STATUS,
					value: SearchStatus.FOUND_SOMETHING,
				});
		}, 400);

		return () => clearTimeout(searchTimeout);
	}, [fromList, searchTerm]);

	return (
		<Wrapper ref={searcherRef}>
			<>
				<SearchWrapper>
					<>
						<Search>
							<SearchIcon size="1.2em" />
							<input
								onChange={e =>
									setSearcher({
										type: SearcherAction.SET_SEARCH_TERM,
										value: e.target.value,
									})
								}
								placeholder="Search for songs"
								autoCapitalize="on"
								spellCheck="false"
								autoCorrect="off"
								type="text"
							/>
						</Search>

						{searchResultJSX.get(searchStatus)?.()}
					</>
				</SearchWrapper>

				{buttonToTheSideJSX.get(buttonToTheSide)?.()}
			</>
		</Wrapper>
	);
}

type Props = Readonly<{
	fromList: MediaListKindProps["playlistName"];
	buttonToTheSide: ButtonToTheSide;
}>;
