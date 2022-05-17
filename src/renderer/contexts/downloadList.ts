import type { MediaBeingDownloaded } from "@modules/Downloading";

import create from "zustand";

export const useDownloadingList = create<DownloadingList>(() => new Map());
export const { getState: downloadingList } = useDownloadingList;

////////////////////////////////////////////////
////////////////////////////////////////////////

export const useDownloadsToBeConfirmed = create<SetDownloadingList>(
	() => new Map()
);
export const { getState: downloadsToBeConfirmed } = useDownloadsToBeConfirmed;

type DownloadingList = Map<MediaUrl, MediaBeingDownloaded>;
type SetDownloadingList = Map<MediaUrl, boolean>;
export type MediaUrl = string;
