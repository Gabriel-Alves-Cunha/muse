import type { ID, Media } from "@common/@types/generalTypes";
import type { ValuesOf } from "@common/@types/utils";

import { subscribeWithSelector } from "zustand/middleware";
import create from "zustand";

import { searchMedia, unDiacritic } from "@contexts/usePlaylists";
import { emptyArray } from "@common/empty";

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

export const SearchStatus = {
	FOUND_SOMETHING: 2,
	DOING_NOTHING: 3,
	NOTHING_FOUND: 4,
	SEARCHING: 5,
} as const;

/////////////////////////////////////////

const defaultSearcher: Searcher = {
	searchStatus: SearchStatus.DOING_NOTHING,
	results: emptyArray,
	searchTerm: "",
	highlight: "",
};

export const useSearcher = create<Searcher>()(
	subscribeWithSelector((_set, _get, _api) => defaultSearcher),
);

export const { setState: setSearcher, getState: getSearcher } = useSearcher;

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

export function setSearchTerm(e: InputChange): void {
	// stopping propagation so the space key doesn't toggle play state.
	e.stopPropagation();

	setSearcher({
		highlight: unDiacritic(e.target.value),
		searchTerm: e.target.value,
	});
}

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

export const setDefaultSearch = () => setSearcher(defaultSearcher);

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Search for medias:

useSearcher.subscribe(
	(state) => state.highlight,
	(highlight) => {
		if (highlight.length < 2)
			return setSearcher({
				searchStatus: SearchStatus.DOING_NOTHING,
				results: emptyArray,
			});

		// This is, so far, not needed, cause searching is really fast!
		// setSearcher({ results: emptyArray, searchStatus: SearchStatus.SEARCHING });

		const results = searchMedia(highlight);
		const searchStatus =
			results.length > 0
				? SearchStatus.FOUND_SOMETHING
				: SearchStatus.NOTHING_FOUND;

		setSearcher({ searchStatus, results });
	},
);

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Types:

type Searcher = {
	searchStatus: ValuesOf<typeof SearchStatus>;
	results: readonly [ID, Media][];
	searchTerm: string;
	highlight: string;
};

/////////////////////////////////////////

type InputChange = React.ChangeEvent<HTMLInputElement>;
