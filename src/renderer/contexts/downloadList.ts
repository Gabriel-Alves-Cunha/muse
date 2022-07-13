import type { MediaBeingDownloaded } from "@components/Downloading";

import create from "zustand";

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////

// For testing:
// import { ProgressStatus } from "@common/enums";
// import { getRandomInt } from "@utils/utils";
//
// const { port1: testPort } = new MessageChannel();
// const testDownloadingMedias: [MediaUrl, MediaBeingDownloaded][] = Array.from({
// 	length: 10,
// }, (_, index) => {
// 	const random = getRandomInt(0, 10) <= 5 ? false : true;
// 	let status = ProgressStatus.ACTIVE;
// 	{
// 		const random1_5 = getRandomInt(0, 5);
// 		switch (random1_5) {
// 			case 0:
// 				status = ProgressStatus.ACTIVE;
// 				break;
//
// 			case 1:
// 				status = ProgressStatus.CANCEL;
// 				break;
//
// 			case 2:
// 				status = ProgressStatus.FAILED;
// 				break;
//
// 			case 3:
// 				status = ProgressStatus.SUCCESS;
// 				break;
//
// 			default:
// 				break;
// 		}
// 	}
// 	const path: MediaUrl = `http://test-${index}.com`;
// 	const media: MediaBeingDownloaded = {
// 		title: `donwload-test-${index}`,
// 		isDownloading: random,
// 		percentage: 50,
// 		port: testPort,
// 		imageURL: "",
// 		status,
// 	};
//
// 	return [path, media];
// });

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Main functions:

export const useDownloadingList = create<DownloadingList>(() => ({
	downloadingList: new Map(),
}));

////////////////////////////////////////////////

export const getDownloadingList = () =>
	useDownloadingList.getState().downloadingList;

////////////////////////////////////////////////

export const setDownloadingList = (
	downloadingList: DownloadingList["downloadingList"],
) => useDownloadingList.setState({ downloadingList });

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Types:

export type DownloadingList = Readonly<
	{ downloadingList: ReadonlyMap<MediaUrl, MediaBeingDownloaded>; }
>;

export type MediaUrl = Readonly<string>;
