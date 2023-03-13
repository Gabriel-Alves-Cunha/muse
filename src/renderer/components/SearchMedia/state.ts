import type { Path, Media } from "@common/@types/GeneralTypes";
import type { ValuesOf } from "@common/@types/Utils";

import { subscribeKey } from "valtio/utils";
import { proxy } from "valtio";

import { searchMedia, unDiacritic } from "@contexts/playlists";

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

export const SearchStatusEnum = {
	FOUND_SOMETHING: 2,
	DOING_NOTHING: 3,
	NOTHING_FOUND: 4,
	SEARCHING: 5,
} as const;

/////////////////////////////////////////

const defaultSearcher: Searcher = {
	searchStatus: SearchStatusEnum.DOING_NOTHING,
	searchTerm: "",
	highlight: "",
	results: [],
};

export const searcher = proxy<Searcher>({ ...defaultSearcher });

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

export function setSearchTerm(e: InputChange): void {
	// stopping propagation so the space key doesn't toggle play state.
	e.stopPropagation();

	searcher.highlight = unDiacritic(e.target.value);
	searcher.searchTerm = e.target.value;
}

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

export const setDefaultSearch = (): void => {
	Object.assign(searcher, defaultSearcher);
};

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Search for medias:

subscribeKey(searcher, "highlight", () => {
	if (searcher.highlight.length < 2) {
		searcher.searchStatus = SearchStatusEnum.DOING_NOTHING;
		searcher.results.length = 0;

		return;
	}

	// This is, so far, not needed, cause searching is really fast!
	// setSearcher({ results: emptyArray, searchStatus: SearchStatus.SEARCHING });

	const results = searchMedia(searcher.highlight);

	searcher.results = results;
	searcher.searchStatus =
		results.length > 0
			? SearchStatusEnum.FOUND_SOMETHING
			: SearchStatusEnum.NOTHING_FOUND;
});

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Types:

type Searcher = {
	searchStatus: ValuesOf<typeof SearchStatusEnum>;
	results: [Path, Media][];
	searchTerm: string;
	highlight: string;
};

/////////////////////////////////////////

type InputChange = React.ChangeEvent<HTMLInputElement>;
