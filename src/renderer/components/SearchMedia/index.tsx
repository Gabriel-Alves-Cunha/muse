import { AiOutlineSearch as SearchIcon } from "react-icons/ai";
import { useRef } from "react";

import { useOnClickOutside } from "@hooks";
import {
	type Props,
	ButtonToTheSide,
	defaultSearcher,
	useSearcher,
	setSearcher,
	Results,
	Input,
} from "./helper";

import { SearchWrapper, Wrapper, Search } from "./styles";

export function SearchMedia({ buttonToTheSide, playlistName }: Props) {
	const searcherRef = useRef<HTMLHeadingElement>(null);
	const searcher = useSearcher();

	useOnClickOutside(searcherRef, () =>
		searcher === defaultSearcher ? noop() : setSearcher(defaultSearcher),
	);

	return (
		<Wrapper>
			<SearchWrapper ref={searcherRef}>
				<Search>
					<SearchIcon size="1.1rem" />

					<Input playlistName={playlistName} />
				</Search>

				<Results playlistName={playlistName} />
			</SearchWrapper>

			<ButtonToTheSide buttonToTheSide={buttonToTheSide} />
		</Wrapper>
	);
}

SearchMedia.whyDidYouRender = {
	customName: "SearchMedia",
};

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};
