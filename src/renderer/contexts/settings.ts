import type { Json } from "@common/@types/utils";

import { subscribeWithSelector } from "zustand/middleware";
import create from "zustand";

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Pre work:

const settingsKey = "muse:settings";
const defaultValues: Settings = {
	assureMediaSizeIsGreaterThan60KB: true,
	ignoreMediaWithLessThan60Seconds: true,
	maxSizeOfHistory: 100,
};
const savedSettings = localStorage.getItem(settingsKey);
const settingsToApply = savedSettings
	? (JSON.parse(savedSettings) as Settings)
	: defaultValues;

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
	(newSettings): void =>
		// Write to LocalStorage:
		localStorage.setItem(settingsKey, JSON.stringify(newSettings)),
);

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Types:

export type Settings = Json &
	Readonly<{
		assureMediaSizeIsGreaterThan60KB: boolean;
		ignoreMediaWithLessThan60Seconds: boolean;
		maxSizeOfHistory: number;
	}>;
