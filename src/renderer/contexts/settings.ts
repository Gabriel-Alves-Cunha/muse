import { createEffect } from "solid-js";
import { createStore } from "solid-js/store";

import { dbg } from "@common/debug";

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Pre work:

const settingsKey = "@muse:settings";
const defaultValues: Settings = Object.freeze({
	assureMediaSizeIsGreaterThan60KB: true,
	ignoreMediaWithLessThan60Seconds: true,
	maxSizeOfHistory: 100,
});

const savedSettings = localStorage.getItem(settingsKey);

const settingsToApply = savedSettings
	? (JSON.parse(savedSettings) as Settings)
	: defaultValues;

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Main function:

export const [settings, setSettings] = createStore<Settings>(settingsToApply);

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Helper function:

createEffect(
	() => {
		dbg("Saving new settings on LocalStorage:", settings);

		localStorage.setItem(settingsKey, JSON.stringify(settings));
	},
	{ defer: true },
);

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Types:

export type Settings = {
	assureMediaSizeIsGreaterThan60KB: boolean;
	ignoreMediaWithLessThan60Seconds: boolean;
	maxSizeOfHistory: number;
};
