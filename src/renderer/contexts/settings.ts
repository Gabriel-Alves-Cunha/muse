import type { Path } from "@common/@types/generalTypes";

import create from "zustand";

import { emptySet } from "@utils/map-set";

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Main functions:

export const useSettings = create<Settings>(() => ({
	assureMediaSizeIsGreaterThan60KB: true,
	ignoreMediaWithLessThan60Seconds: true,
	filesToShare: emptySet,
	maxSizeOfHistory: 100,
}));

export const { getState: getSettings, setState: setSettings } = useSettings;

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Types:

type Settings = Readonly<
	{
		assureMediaSizeIsGreaterThan60KB: boolean;
		ignoreMediaWithLessThan60Seconds: boolean;
		filesToShare: ReadonlySet<Path>;
		maxSizeOfHistory: number;
	}
>;
