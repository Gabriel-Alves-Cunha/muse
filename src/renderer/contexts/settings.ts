import type { Path } from "@common/@types/generalTypes";

import { subscribeWithSelector } from "zustand/middleware";
import create from "zustand";

import { emptySet } from "@common/empty";

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Pre work:

const settingsKey = "muse:settings";
const defaultValues: Settings = {
	assureMediaSizeIsGreaterThan60KB: true,
	ignoreMediaWithLessThan60Seconds: true,
	filesToShare: emptySet,
	maxSizeOfHistory: 100,
};
const savedSettings = localStorage.getItem(settingsKey);
const settingsToApply =
	savedSettings === null
		? defaultValues
		: (JSON.parse(savedSettings) as Settings);

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Main function:

export const useSettings = create<Settings>()(
	subscribeWithSelector((_set, _get, _api) => settingsToApply),
);

export const { getState: getSettings, setState: setSettings } = useSettings;

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Helper function:

useSettings.subscribe(
	(state) => state,
	function writeToLocalStorage(newSettings): void {
		localStorage.setItem(settingsKey, JSON.stringify(newSettings));
	},
);

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Types:

export type Settings = Readonly<{
	assureMediaSizeIsGreaterThan60KB: boolean;
	ignoreMediaWithLessThan60Seconds: boolean;
	filesToShare: ReadonlySet<Path>;
	maxSizeOfHistory: number;
}>;
