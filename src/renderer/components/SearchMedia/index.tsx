import { useState } from "react";
import { AiOutlineSearch as SearchIcon } from "react-icons/ai";

import { Results, Input } from "./helper";

import { SearchWrapper } from "./styles";

export function SearchMedia() {
	const [isResultsOpen, setIsResultsOpen] = useState(false);

	return (
		<SearchWrapper>
			<SearchIcon size={17} />

			<Input isResultsOpen={isResultsOpen} setIsResultsOpen={setIsResultsOpen} />

			<Results />
		</SearchWrapper>
	);
}
