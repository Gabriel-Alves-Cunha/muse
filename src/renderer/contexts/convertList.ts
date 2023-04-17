import type { MediaBeingConverted } from "@components/Converting/helper";
import type { Path } from "@common/@types/GeneralTypes";

import { create } from "zustand";

import { emptyMap } from "@utils/empty";

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////

// For in-hand testing porpuses:
// import type { ValuesOf } from "@common/@types/utils";
// import { ProgressStatus } from "@common/enums";
// import { getRandomInt } from "@utils/utils";
// import { error } from "@common/log";
//
// const { port1: testPort } = new MessageChannel();
// const testConvertingMedia: [Path, MediaBeingConverted][] = Array.from(
// 	{
// 		length: 10,
// 	},
// 	(_, index) => {
// 		let status: ValuesOf<typeof ProgressStatus> = ProgressStatus.ACTIVE;
//
// 		const random1_5 = getRandomInt(0, 5);
// 		switch (random1_5) {
// 			case 0: {
// 				status = ProgressStatus.ACTIVE;
// 				break;
// 			}
//
// 			case 1: {
// 				status = ProgressStatus.CANCEL;
// 				break;
// 			}
//
// 			case 2: {
// 				status = ProgressStatus.FAILED;
// 				break;
// 			}
//
// 			case 3: {
// 				status = ProgressStatus.SUCCESS;
// 				break;
// 			}
//
// 			case 4: {
// 				status = ProgressStatus.WAITING_FOR_CONFIRMATION_FROM_ELECTRON;
// 				break;
// 			}
//
// 			default:
// 				error("Error: random1_5 is not in range [0, 5]", random1_5);
// 				status = ProgressStatus.SUCCESS;
// 				break;
// 		}
//
// 		const path: Path = `/home/path/convert-test-${index}.mp4`;
// 		const media: MediaBeingConverted = {
// 			timeConverted: 50 + index * 2,
// 			sizeConverted: 1000,
// 			toExtension: "mp3",
// 			port: testPort,
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

export const convertingListRef = create<ConvertingList>(() => ({
	current: emptyMap,
}));

export const getConvertingList = (): ConvertingList["current"] =>
	convertingListRef.getState().current;

export const setConvertingList = (
	convertingList: ConvertingList["current"],
): void => convertingListRef.setState({ current: convertingList });

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Types:

export type ConvertingList = Readonly<{
	current: ReadonlyMap<Path, MediaBeingConverted>;
}>;
