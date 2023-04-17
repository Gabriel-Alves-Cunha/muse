import type { UserAvailableLanguages } from "@i18n";
import type { availableThemes } from "@components/ThemeToggler";

import { create } from "zustand";

import { localStorageKeys } from "@utils/localStorage";
import { error } from "@common/log";

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Constants:

const defaultSettings: Settings = {
	assureMediaSizeIsGreaterThan60KB: true,
	ignoreMediaWithLessThan60Seconds: true,
	maxSizeOfHistory: 100,
	language: "en-US",
	theme: "light",
} as const;

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Main function:

export const useSettings = create<Settings>(() => {
	const storagedSettingsString = localStorage.getItem(
		localStorageKeys.settings,
	);

	let settingsToApply = defaultSettings;

	try {
		if (storagedSettingsString)
			settingsToApply = JSON.parse(storagedSettingsString);
	} catch (err) {
		error(
			"Error parsing JSON.parse(storagedSettingsString). Applying default settings.",
			err,
		);
	}

	return settingsToApply;
});

export const { getState: getSettings, setState: setSettings } = useSettings;

export const selectTheme = (state: Settings): Settings["theme"] => state.theme;

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Listeners:

let setToLocalStorageTimer: NodeJS.Timer | undefined;

useSettings.subscribe((settings) => {
	clearTimeout(setToLocalStorageTimer);

	setToLocalStorageTimer = setTimeout(
		() =>
			localStorage.setItem(localStorageKeys.settings, JSON.stringify(settings)),
		1_000,
	);
});

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Helper functions:

export const setDefaultSettings = (): void => setSettings(defaultSettings);

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
