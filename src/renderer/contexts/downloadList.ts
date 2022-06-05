import type { MediaBeingDownloaded } from "@modules/Downloading";

import create from "zustand";

// import { ProgressStatus } from "@common/enums";

// For testing:
// const { port1: testPort } = new MessageChannel();
// const testDownloadingMedias: [MediaUrl, MediaBeingDownloaded][] = Array(10)
// 	.fill(null)
// 	.map((_, index) => [
// 		`http://test-${index}.com`,
// 		{
// 			status: ProgressStatus.ACTIVE,
// 			isDownloading: true,
// 			percentage: 50,
// 			port: testPort,
// 			title: "test",
// 			imageURL: "",
// 		},
// 	]);

export const useDownloadingList = create<DownloadingList>(() => new Map());
export const { getState: downloadingList, setState: setDownloadingList } =
	useDownloadingList;

type DownloadingList = Map<MediaUrl, MediaBeingDownloaded>;
export type MediaUrl = string;
