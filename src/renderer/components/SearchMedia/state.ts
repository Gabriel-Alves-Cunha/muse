import type { Path, Media } from "@common/@types/GeneralTypes";
import type { ValuesOf } from "@common/@types/Utils";

import { subscribeWithSelector } from "zustand/middleware";
import { create } from "zustand";

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

const defaultDataOfSearchMedia: SearchMedia = {
	searchStatus: SearchStatusEnum.DOING_NOTHING,
	searchTerm: "",
	highlight: "",
	results: [],
} as const;

export const useDataOfSearchMedia = create(
	subscribeWithSelector<SearchMedia>(() => defaultDataOfSearchMedia),
);

export const {
	getState: getDataOfSearchMedia,
	setState: setDataOfSearchMedia,
} = useDataOfSearchMedia;

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

export function setSearchTerm(e: InputChange): void {
	// stopping propagation so the space key doesn't toggle play state.
	e.stopPropagation();

	setDataOfSearchMedia({
		highlight: unDiacritic(e.target.value),
		searchTerm: e.target.value,
	});
}

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

export const setDefaultSearchMediaData = (): void =>
	setDataOfSearchMedia(defaultDataOfSearchMedia);

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Search for medias:

useDataOfSearchMedia.subscribe(
	(state) => state.searchTerm,
	(searchTerm) => {
		if (searchTerm.length < 2) {
			setDataOfSearchMedia({
				searchStatus: SearchStatusEnum.DOING_NOTHING,
				results: [],
			});

			return;
		}

		// This is, so far, not needed, cause searching is really fast!
		// setSearcher({ results: emptyArray, searchStatus: SearchStatus.SEARCHING });

		const results = searchMedia(searchTerm);

		setDataOfSearchMedia({
			searchStatus:
				results.length > 0
					? SearchStatusEnum.FOUND_SOMETHING
					: SearchStatusEnum.NOTHING_FOUND,
			results,
		});
	},
);

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Types:

type SearchMedia = Readonly<{
	searchStatus: ValuesOf<typeof SearchStatusEnum>;
	results: readonly [Path, Media][];
	searchTerm: string;
	highlight: string;
}>;

/////////////////////////////////////////

type InputChange = React.ChangeEvent<HTMLInputElement>;
