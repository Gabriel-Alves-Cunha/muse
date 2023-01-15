import type { ValuesOf } from "@common/@types/utils";

import { create } from "zustand";

import { playlistList } from "@common/enums";

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

export const useFromList = create<FromList>(() => ({
	fromList: playlistList.favorites,
	homeList: playlistList.mainList,
	isHome: true,
}));

export const { getState: getFromList, setState: setFromList } = useFromList;

/////////////////////////////////////////

const useIsCtxMenuOpen = create(() => ({ isCtxMenuOpen: false }));

export const isCtxMenuOpen = () => useIsCtxMenuOpen.getState().isCtxMenuOpen;

export const setIsCtxMenuOpen = (isCtxMenuOpen: boolean) =>
	useIsCtxMenuOpen.setState({ isCtxMenuOpen });

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Types:

type PlaylistList = ValuesOf<typeof playlistList>;

/////////////////////////////////////////////

type FromList = {
	fromList: Exclude<
		PlaylistList,
		typeof playlistList.mainList | typeof playlistList.sortedByDate
	>;
	homeList: Extract<
		PlaylistList,
		typeof playlistList.mainList | typeof playlistList.sortedByDate
	>;
	isHome: boolean;
};
