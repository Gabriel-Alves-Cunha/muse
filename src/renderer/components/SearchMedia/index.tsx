import { AiOutlineSearch as SearchIcon } from "react-icons/ai";

import { Input, Results } from "./helper";

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Main function:

export const SearchMedia = () => (
	<>
		<div className="relative flex justify-start items-center w-80 h-10 border-2 border-solid border-input cursor-default rounded-xl bg-none transition-all ease-out duration-200 search-media">
			<SearchIcon className="w-5 h-5 text-alternative cursor-default mx-3 duration-100" />

			<Input />
		</div>

		<Results />
	</>
);
