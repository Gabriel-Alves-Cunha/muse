import { AiOutlineSearch as SearchIcon } from "react-icons/ai";

import { Input, Results } from "./helper";

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Main function:

export const SearchMedia = () => (
	<>
		<div className="hover:border-active focus:border-active focus-within:border-active search-media-wrapper">
			<SearchIcon className="w-5 h-5 text-input cursor-default ml-3 hover:text-active focus:text-active focus-within:text-active duration-75" />

			<Input />
		</div>

		<Results />
	</>
);
