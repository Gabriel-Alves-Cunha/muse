import type { UserAvailableLanguages } from "@i18n";
import type { availableThemes } from "@components/ThemeToggler";

import { proxy, subscribe } from "valtio";

import { localStorageKeys } from "@utils/localStorage";
import { error } from "@common/log";

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Pre work:

const storagedSettingsString = localStorage.getItem(localStorageKeys.settings);
const defaultSettings: Settings = {
	assureMediaSizeIsGreaterThan60KB: true,
	ignoreMediaWithLessThan60Seconds: true,
	maxSizeOfHistory: 100,
	language: "en-US",
	theme: "light",
} as const;

let settingsToApply: Settings | undefined;

try {
	if (storagedSettingsString)
		settingsToApply = JSON.parse(storagedSettingsString);
} catch (err) {
	error(
		"Error parsing JSON.parse(storagedSettingsString). Applying default settings.",
		err,
	);

	settingsToApply = { ...defaultSettings };
}

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Main function:

export const settings = proxy<Settings>(settingsToApply);

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Listeners:

let setToLocalStorageTimer: NodeJS.Timer | undefined;

subscribe(settings, () => {
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

export function setDefaultSettings() {
	Object.assign(settings, defaultSettings);
}

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Types:

export type Settings = {
	assureMediaSizeIsGreaterThan60KB: boolean;
	ignoreMediaWithLessThan60Seconds: boolean;
	theme: typeof availableThemes[number];
	language: UserAvailableLanguages;
	maxSizeOfHistory: number;
};
