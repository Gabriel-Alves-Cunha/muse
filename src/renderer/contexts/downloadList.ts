import type { MediaBeingDownloaded } from "@components/Downloading";

import { observable } from "@legendapp/state";

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
// 	let status = ProgressStatus.ACTIVE;
//
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

export const downloadingList = observable<DownloadingList>(new Map());

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Types:

export type DownloadingList = Map<MediaUrl, MediaBeingDownloaded>;

export type MediaUrl = Readonly<string>;
