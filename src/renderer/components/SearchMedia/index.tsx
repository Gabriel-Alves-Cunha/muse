import { AiOutlineSearch as SearchIcon } from "react-icons/ai";

import { Input, Results } from "./helper";

import { SearchWrapper } from "./styles";

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Main function:

export const SearchMedia = () => (
	<>
		<SearchWrapper>
			<SearchIcon size={18} />

			<Input />
		</SearchWrapper>

		<Results />
	</>
);
