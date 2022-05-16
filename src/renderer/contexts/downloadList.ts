import type { MediaBeingDownloaded } from "@modules/Downloading";

import create from "zustand";

export const useDownloadingList = create<DownloadingList>(() => []);

export const { setState: setDownloadingList, getState: getDownloadingList } =
	useDownloadingList;

///////////////////////////////////////////
///////////////////////////////////////////

export const downloadsToBeConfirmed: Map<MediaUrl, boolean> = new Map();

type DownloadingList = readonly MediaBeingDownloaded[];
export type MediaUrl = string;
