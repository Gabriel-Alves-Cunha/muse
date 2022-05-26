import { AiOutlineSearch as SearchIcon } from "react-icons/ai";

import { Results, Input } from "./helper";

import { SearchWrapper } from "./styles";

export function SearchMedia() {
	return (
		<SearchWrapper>
			<SearchIcon size={17} />

			<Input />

			<Results />
		</SearchWrapper>
	);
}
