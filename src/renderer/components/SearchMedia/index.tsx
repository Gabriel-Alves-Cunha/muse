import { AiOutlineSearch as SearchIcon } from "react-icons/ai";

import { Results, Input } from "./helper";

import { SearchWrapper, Wrapper, Search } from "./styles";

export function SearchMedia() {
	return (
		<Wrapper>
			<SearchWrapper>
				<Search>
					<SearchIcon size="1.1rem" />

					<Input />
				</Search>

				<Results />
			</SearchWrapper>
		</Wrapper>
	);
}
