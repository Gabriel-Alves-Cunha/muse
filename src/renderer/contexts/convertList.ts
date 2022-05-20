import type { MediaBeingConverted } from "@modules/Converting/helper";
import type { Path } from "@common/@types/generalTypes";

import create from "zustand";

/** For in-hand testing porpuses: */
// const { port1: testPort } = new MessageChannel();
// const testConvertingMedia: MediaBeingConverted = Object.freeze({
// 	status: ProgressStatus.ACTIVE,
// 	path: "/test/fake/path",
// 	timeConverted: "01:20",
// 	sizeConverted: 1000,
// 	isConverting: true,
// 	toExtension: "mp3",
// 	percentage: 50,
// 	port: testPort,
// } as const);

export const useConvertingList = create<ConvertingList>(() => new Map());
export const { getState: convertingList, setState: setConvertingList } =
	useConvertingList;

type ConvertingList = Map<Path, MediaBeingConverted>;
