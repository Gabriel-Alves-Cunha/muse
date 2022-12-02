import type { MediaBeingConverted } from "@components/Converting/helper";
import type { ValuesOf } from "@common/@types/utils";
import type { Path } from "@common/@types/generalTypes";

import create from "solid-zustand";

import { error } from "@utils/log";

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////

// For in-hand testing porpuses:
import { progressStatus } from "@common/enums";
import { getRandomInt } from "@utils/utils";

const { port1: testPort } = new MessageChannel();
const testConvertingMedia: [Path, MediaBeingConverted][] = Array.from(
	{
		length: 10,
	},
	(_, index) => {
		let status: ValuesOf<typeof progressStatus> = progressStatus.ACTIVE;

		const random1_5 = getRandomInt(0, 5);
		switch (random1_5) {
			case 0: {
				status = progressStatus.ACTIVE;
				break;
			}

			case 1: {
				status = progressStatus.CANCEL;
				break;
			}

			case 2: {
				status = progressStatus.FAILED;
				break;
			}

			case 3: {
				status = progressStatus.SUCCESS;
				break;
			}

			case 4: {
				status = progressStatus.WAITING_FOR_CONFIRMATION_FROM_ELECTRON;
				break;
			}

			default:
				error("Error: random1_5 is not in range [0, 5]", random1_5);
				status = progressStatus.SUCCESS;
				break;
		}

		const path: Path = `/home/path/convert-test-${index}.mp4`;
		const media: MediaBeingConverted = {
			timeConverted: 50 + index * 2,
			sizeConverted: 1000,
			toExtension: "mp3",
			port: testPort,
			status,
		};

		return [path, media];
	},
);

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Main functions:

export const useConvertingList = create<ConvertingList>(() => ({
	convertingList: new Map(testConvertingMedia),
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

export type ConvertingList = Readonly<{
	convertingList: ReadonlyMap<Path, MediaBeingConverted>;
}>;
