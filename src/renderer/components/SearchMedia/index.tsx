import { AiOutlineSearch as SearchIcon } from "react-icons/ai";

import { InputAndResults } from "./helper";

import { SearchWrapper } from "./styles";

export function SearchMedia() {
	return (
		<SearchWrapper>
			<SearchIcon size={17} />

			<InputAndResults />
		</SearchWrapper>
	);
}
