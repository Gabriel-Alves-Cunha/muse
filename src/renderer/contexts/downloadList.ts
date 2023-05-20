import type { MediaBeingDownloaded } from "@components/Downloading";

import { create } from "zustand";

import { EMPTY_MAP } from "@utils/empty";

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////

// For in hand testing:
// import type { ValuesOf } from "@common/@types/utils";
// import { ProgressStatus } from "@common/enums";
// import { getRandomInt } from "@utils/utils";
//
// const { port1: testPort } = new MessageChannel();
// const testDownloadingMedias: [MediaUrl, MediaBeingDownloaded][] = Array.from(
// 	{
// 		length: 10,
// 	},
// 	(_, index) => {
// 		let status: ValuesOf<typeof ProgressStatus> = ProgressStatus.ACTIVE;
//
// 		{
// 			const random1_5 = getRandomInt(0, 5);
// 			switch (random1_5) {
// 				case 0: {
// 					status = ProgressStatus.ACTIVE;
// 					break;
// 				}
//
// 				case 1: {
// 					status = ProgressStatus.CANCEL;
// 					break;
// 				}
//
// 				case 2: {
// 					status = ProgressStatus.FAILED;
// 					break;
// 				}
//
// 				case 3: {
// 					status = ProgressStatus.SUCCESS;
// 					break;
// 				}
//
// 				default:
// 					break;
// 			}
// 		}
// 		const path: MediaUrl = `http://test-${index}.com`;
// 		const media: MediaBeingDownloaded = {
// 			title: `donwload-test-${index}`,
// 			percentage: 50,
// 			port: testPort,
// 			imageURL: "",
// 			status,
// 		};
//
// 		return [path, media];
// 	},
// );

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Main functions:

export const downloadingListRef = create<DownloadingList>(() => ({
	current: EMPTY_MAP,
}));

export const getDownloadingList = (): DownloadingList["current"] =>
	downloadingListRef.getState().current;

export const setDownloadingList = (
	newDownloadingList: DownloadingList["current"],
): void => downloadingListRef.setState({ current: newDownloadingList });

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Types:

export type MediaUrl = Readonly<string>;

export type DownloadingList = Readonly<{
	current: ReadonlyMap<MediaUrl, MediaBeingDownloaded>;
}>;
