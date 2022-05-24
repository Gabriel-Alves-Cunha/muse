import { AiOutlineSearch as SearchIcon } from "react-icons/ai";

import { type Props, ButtonToTheSide, Results, Input } from "./helper";

import { SearchWrapper, Wrapper, Search } from "./styles";

export function SearchMedia({ buttonToTheSide }: Props) {
	return (
		<Wrapper>
			<SearchWrapper>
				<Search>
					<SearchIcon size="1.1rem" />

					<Input />
				</Search>

				<Results />
			</SearchWrapper>

			<ButtonToTheSide buttonToTheSide={buttonToTheSide} />
		</Wrapper>
	);
}
