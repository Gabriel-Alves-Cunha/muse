import type { MediaBeingDownloaded } from "@components/Downloading";
import type { ValuesOf } from "@common/@types/utils";

import { createSignal } from "solid-js";

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////

// For testing:
// import { progressStatus } from "@common/enums";
// import { getRandomInt } from "@utils/utils";
//
// const { port1: testPort } = new MessageChannel();
// const testDownloadingMedias: [MediaUrl, MediaBeingDownloaded][] = Array.from(
// 	{
// 		length: 10,
// 	},
// 	(_, index) => {
// 		let status: ValuesOf<typeof progressStatus> = progressStatus.ACTIVE;
//
// 		{
// 			const random1_5 = getRandomInt(0, 5);
// 			switch (random1_5) {
// 				case 0: {
// 					status = progressStatus.ACTIVE;
// 					break;
// 				}
//
// 				case 1: {
// 					status = progressStatus.CANCEL;
// 					break;
// 				}
//
// 				case 2: {
// 					status = progressStatus.FAILED;
// 					break;
// 				}
//
// 				case 3: {
// 					status = progressStatus.SUCCESS;
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

export const [getDownloadingList, setDownloadingList] =
	createSignal<DownloadingList>(new Map());

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Types:

export type DownloadingList = Map<MediaUrl, MediaBeingDownloaded>;

export type MediaUrl = string;
