import { AiOutlineSearch as SearchIcon } from "react-icons/ai";

import { Input, Results } from "./helper";

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Main function:

export const SearchMedia = () => (
	<>
		<div className="relative flex justify-start items-center w-80 h-10 border-2 border-solid border-input cursor-default rounded-xl bg-none transition-all ease-out duration-200 hover:border-active focus:border-active focus-within:border-active">
			<SearchIcon className="w-5 h-5 text-input cursor-default ml-3 hover:text-active focus:text-active focus-within:text-active" />

			<Input />
		</div>

		<Results />
	</>
);
