import type { ValuesOf } from "@common/@types/utils";

import { proxy } from "valtio";

import { PlaylistListEnum } from "@common/enums";

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

export const fromList = proxy<FromList>({
	homeList: PlaylistListEnum.mainList,
	curr: PlaylistListEnum.favorites,
	isHome: true,
});

/////////////////////////////////////////

export const isCtxMenuOpen = proxy({ curr: false });

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Types:

type PlaylistList = ValuesOf<typeof PlaylistListEnum>;

/////////////////////////////////////////////

type FromList = {
	curr: Exclude<
		PlaylistList,
		typeof PlaylistListEnum.mainList | typeof PlaylistListEnum.sortedByDate
	>;
	homeList: Extract<
		PlaylistList,
		typeof PlaylistListEnum.mainList | typeof PlaylistListEnum.sortedByDate
	>;
	isHome: boolean;
};
