import type { MediaListKindProps } from "../MediaListKind";

import { AiOutlineSearch as SearchIcon } from "react-icons/ai";
import { useEffect, useRef } from "react";

import { searchForMediaFromList } from "@contexts";
import { useOnClickOutside } from "@hooks";
import {
	getSearcherFunctions,
	buttonToTheSideJSX,
	searchResultJSX,
	ButtonToTheSide,
	SearcherAction,
	SearchStatus,
	useSearcher,
	setSearcher,
} from "./helper";

import { SearchWrapper, Wrapper, Search } from "./styles";

export function SearchMedia({ fromList, buttonToTheSide }: Props) {
	const { searchStatus, searchTerm } = useSearcher().searcher;
	const searcherRef = useRef<HTMLHeadingElement>(null);

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
			<SearchWrapper>
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
						value={searchTerm}
						spellCheck="false"
						autoCorrect="off"
						type="text"
					/>
				</Search>

				{searchResultJSX.get(searchStatus)?.()}
			</SearchWrapper>

			{buttonToTheSideJSX.get(buttonToTheSide)?.()}
		</Wrapper>
	);
}

type Props = Readonly<{
	fromList: MediaListKindProps["playlistName"];
	buttonToTheSide: ButtonToTheSide;
}>;
