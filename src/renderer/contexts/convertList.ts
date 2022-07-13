import type { MediaBeingConverted } from "@components/Converting/helper";
import type { Path } from "@common/@types/generalTypes";

import create from "zustand";

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////

// For in-hand testing porpuses:
// import { ProgressStatus } from "@common/enums";
// import { getRandomInt } from "@utils/utils";
//
// const { port1: testPort } = new MessageChannel();
// const testConvertingMedia: [Path, MediaBeingConverted][] = Array.from({
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
// 			case 4:
// 				status = ProgressStatus.WAITING_FOR_CONFIRMATION_FROM_ELECTRON;
// 				break;
//
// 			default:
// 				console.error("Error: random1_5 is not in range [0, 5]", random1_5);
//
// 				break;
// 		}
// 	}
// 	const path: Path = `/home/path/convert-test-${index}.mp4`;
// 	const media: MediaBeingConverted = {
// 		timeConverted: 50 + index * 2,
// 		isConverting: random,
// 		sizeConverted: 1000,
// 		toExtension: "mp3",
// 		port: testPort,
// 		status,
// 	};
//
// 	return [path, media];
// });

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Main functions:

export const useConvertingList = create<ConvertingList>(() => ({
	convertingList: new Map(),
}));

////////////////////////////////////////////////

export const getConvertingList = () =>
	useConvertingList.getState().convertingList;

////////////////////////////////////////////////

export const setConvertingList = (
	convertingList: ConvertingList["convertingList"],
) => useConvertingList.setState({ convertingList });

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Types:

export type ConvertingList = Readonly<
	{ convertingList: ReadonlyMap<Path, MediaBeingConverted>; }
>;
