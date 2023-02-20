import type { UserAvailableLanguages } from "@i18n";
import type { availableThemes } from "@components/ThemeToggler";

import { proxy, subscribe } from "valtio";

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Pre work:

const settingsKey = "@muse:settings";
const savedSettings = localStorage.getItem(settingsKey);
const settingsToApply = savedSettings
	? (JSON.parse(savedSettings) as Settings)
	: ({
			assureMediaSizeIsGreaterThan60KB: true,
			ignoreMediaWithLessThan60Seconds: true,
			maxSizeOfHistory: 100,
			language: "en-US",
			theme: "light",
	  } satisfies Settings);

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Main function:

export const settings = proxy<Settings>(settingsToApply);

export function setDefaultSettings() {
	settings.assureMediaSizeIsGreaterThan60KB = true;
	settings.ignoreMediaWithLessThan60Seconds = true;
	settings.maxSizeOfHistory = 100;
	settings.language = "en-US";
	settings.theme = "light";
}

let setToLocalStorageTimer: NodeJS.Timer | undefined;

subscribe(settings, (newSettings) => {
	clearTimeout(setToLocalStorageTimer);

	// Write to LocalStorage:
	setToLocalStorageTimer = setTimeout(
		() => localStorage.setItem(settingsKey, JSON.stringify(newSettings)),
		1_000,
	);
});

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
