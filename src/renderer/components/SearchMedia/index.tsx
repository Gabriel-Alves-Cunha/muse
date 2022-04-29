import type { MediaListKindProps } from "../MediaListKind";

import { AiOutlineSearch as SearchIcon } from "react-icons/ai";
import { MdAutorenew as Reload } from "react-icons/md";
import { useEffect, useRef } from "react";
import { FiTrash as Clean } from "react-icons/fi";

import { searchForMediaFromList } from "@contexts";
import { useOnClickOutside } from "@hooks";
import { Tooltip } from "@components";
import {
	getSearcherFunctions,
	ButtonToTheSide,
	SearcherAction,
	SearchStatus,
	cleanHistory,
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
								value={searchTerm}
								spellCheck="false"
								autoCorrect="off"
								type="text"
							/>
						</Search>

						{
							{
								[SearchStatus.NOTHING_FOUND]: (
									<NothingFound>
										Nothing was found for &quot;
										{getSearcherFunctions().searcher.searchTerm}
										&quot;
									</NothingFound>
								),
								[SearchStatus.FOUND_SOMETHING]: (
									<SearchResultsWrapper>
										{getSearcherFunctions().searcher.results.map(m => (
											<Row media={m} key={m.id} />
										))}
									</SearchResultsWrapper>
								),
							}[String(searchStatus)]
						}
					</>
				</SearchWrapper>

				{
					{
						[ButtonToTheSide.RELOAD_BUTTON]: (
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
						),
						[ButtonToTheSide.CLEAN]: (
							<Tooltip text="Clean history">
								<Button>
									<Clean size={15} onClick={cleanHistory} />
								</Button>
							</Tooltip>
						),
					}[String(buttonToTheSide)]
				}
			</>
		</Wrapper>
	);
}

type Props = Readonly<{
	fromList: MediaListKindProps["playlistName"];
	buttonToTheSide: ButtonToTheSide;
}>;
