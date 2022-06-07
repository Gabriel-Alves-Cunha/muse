import type { MediaBeingConverted } from "@modules/Converting/helper";
import type { Path } from "@common/@types/generalTypes";

import create from "zustand";

import { ProgressStatus } from "@common/enums";

/** For in-hand testing porpuses: */
const { port1: testPort } = new MessageChannel();
const testConvertingMedia: [Path, MediaBeingConverted][] = Array(10)
	.fill(null)
	.map((_, index) => {
		const path: Path = `/home/path/convert-test-${index}.mp4`;
		const media: MediaBeingConverted = {
			status: ProgressStatus.ACTIVE,
			timeConverted: "01:20",
			sizeConverted: 1000,
			isConverting: true,
			toExtension: "mp3",
			port: testPort,
		};

		return [path, media];
	});

export const useConvertingList = create<ConvertingList>(() => ({
	convertingList: new Map(testConvertingMedia),
}));
export const { getState: getConvertingList, setState: setConvertingList } =
	useConvertingList;

type ConvertingList = { convertingList: Map<Path, MediaBeingConverted> };
