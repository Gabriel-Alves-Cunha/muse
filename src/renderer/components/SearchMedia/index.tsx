import { AiOutlineSearch as SearchIcon } from "react-icons/ai";

import { InputAndResults } from "./helper";

import { SearchWrapper } from "./styles";

export const SearchMedia = () => (
	<SearchWrapper>
		<SearchIcon size={17} />

		<InputAndResults />
	</SearchWrapper>
);
