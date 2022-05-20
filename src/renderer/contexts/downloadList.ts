import type { MediaBeingDownloaded } from "@modules/Downloading";

import create from "zustand";

export const useDownloadingList = create<DownloadingList>(() => new Map());
export const { getState: downloadingList, setState: setDownloadingList } =
	useDownloadingList;

type DownloadingList = Map<MediaUrl, MediaBeingDownloaded>;
export type MediaUrl = string;
