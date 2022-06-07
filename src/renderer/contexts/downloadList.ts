import type { MediaBeingDownloaded } from "@modules/Downloading";

import create from "zustand";

import { ProgressStatus } from "@common/enums";

// For testing:
const { port1: testPort } = new MessageChannel();
const testDownloadingMedias: [MediaUrl, MediaBeingDownloaded][] = Array(10)
	.fill(null)
	.map((_, index) => {
		const path: MediaUrl = `http://test-${index}.com`;
		const media: MediaBeingDownloaded = {
			status: ProgressStatus.ACTIVE,
			title: `donwload-test-${index}`,
			isDownloading: true,
			percentage: 50,
			port: testPort,
			imageURL: "",
		};

		return [path, media];
	});

export const useDownloadingList = create<DownloadingList>(() => ({
	downloadingList: new Map(testDownloadingMedias),
}));
export const { getState: getDownloadingList, setState: setDownloadingList } =
	useDownloadingList;

type DownloadingList = { downloadingList: Map<MediaUrl, MediaBeingDownloaded> };
export type MediaUrl = string;
