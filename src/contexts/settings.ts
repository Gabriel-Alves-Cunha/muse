import type { UserAvailableLanguages } from "@i18n";
import type { availableThemes } from "@components/ThemeToggler";

import { subscribeWithSelector } from "zustand/middleware";
import { create } from "zustand";

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Pre work:

const settingsKey = "@muse:settings";
const defaultValues: Settings = {
	assureMediaSizeIsGreaterThan60KB: true,
	ignoreMediaWithLessThan60Seconds: true,
	maxSizeOfHistory: 100,
	language: "en-US",
	theme: "light",
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

let setToLocalStorageTimer: NodeJS.Timer | undefined;

useSettings.subscribe(
	(state) => state,
	(newSettings) => {
		clearTimeout(setToLocalStorageTimer);

		// Write to LocalStorage:
		setToLocalStorageTimer = setTimeout(
			() => localStorage.setItem(settingsKey, JSON.stringify(newSettings)),
			1_000,
		);
	},
);

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Types:

export type Settings = Readonly<{
	assureMediaSizeIsGreaterThan60KB: boolean;
	ignoreMediaWithLessThan60Seconds: boolean;
	theme: typeof availableThemes[number];
	language: UserAvailableLanguages;
	maxSizeOfHistory: number;
}>;
