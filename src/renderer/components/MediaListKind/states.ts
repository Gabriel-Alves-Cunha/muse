import type { ValuesOf } from "@common/@types/Utils";

import { create } from "zustand";

import { PlaylistListEnum } from "@common/enums";

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

export const useListTypeToDisplay = create<ListTypeToDisplay>(() => ({
	homeListToDisplay: PlaylistListEnum.mainList,
	current: PlaylistListEnum.mainList,
}));

export const {
	getState: getListTypeToDisplay,
	setState: setListTypeToDisplay,
} = useListTypeToDisplay;

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Types:

type ListTypes = ValuesOf<typeof PlaylistListEnum>;

type ListTypeToDisplay = Readonly<{
	homeListToDisplay: ListTypes;
	current: ListTypes;
}>;
