import type { Path } from "@common/@types/generalTypes";

import { subscribeWithSelector } from "zustand/middleware";
import create from "zustand";

import { availableThemes } from "@components/ThemeToggler";
import { emptySet } from "@common/empty";

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Pre work:

const settingsKey = "muse:settings";
const defaultValues: Settings = {
	assureMediaSizeIsGreaterThan60KB: true,
	ignoreMediaWithLessThan60Seconds: true,
	theme: availableThemes[0],
	filesToShare: emptySet,
	maxSizeOfHistory: 100,
};
const savedSettings = window.localStorage.getItem(settingsKey);
const settingsToApply = savedSettings === null ?
	defaultValues :
	(JSON.parse(savedSettings) as Settings);

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Main function:

export const useSettings = create<Settings>()(
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	subscribeWithSelector((_set, _get, _api) => (settingsToApply)),
);

export const { getState: getSettings, setState: setSettings } = useSettings;

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Helper function:

useSettings.subscribe(
	state => state,
	function writeToLocalStorage(newSettings): void {
		window.localStorage.setItem(settingsKey, JSON.stringify(newSettings));
	},
);

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Types:

export type Settings = Readonly<
	{
		assureMediaSizeIsGreaterThan60KB: boolean;
		ignoreMediaWithLessThan60Seconds: boolean;
		theme: typeof availableThemes[number];
		filesToShare: ReadonlySet<Path>;
		maxSizeOfHistory: number;
	}
>;
