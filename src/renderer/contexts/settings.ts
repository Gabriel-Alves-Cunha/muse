import type { Path } from "@common/@types/generalTypes";

import { persistObservable } from "@legendapp/state/persist";
import { observable } from "@legendapp/state";

import { emptySet } from "@common/empty";

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Pre work:

const settingsKey = "muse:settings";
const defaultValues: Settings = Object.freeze({
	assureMediaSizeIsGreaterThan60KB: true,
	ignoreMediaWithLessThan60Seconds: true,
	filesToShare: emptySet,
	maxSizeOfHistory: 100,
});

function getSettingsFromLocalStorage(): Settings {
	const savedSettings = localStorage.getItem(settingsKey);
	const settingsToApply =
		savedSettings === null
			? { ...defaultValues }
			: (JSON.parse(savedSettings) as Settings);

	return settingsToApply;
}

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Main function:

export const settings = observable<Settings>(getSettingsFromLocalStorage());

// Persist this observable
persistObservable(settings, {
	local: settingsKey, // Unique name
});

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Types:

export type Settings = {
	assureMediaSizeIsGreaterThan60KB: boolean;
	ignoreMediaWithLessThan60Seconds: boolean;
	filesToShare: ReadonlySet<Path>;
	maxSizeOfHistory: number;
};
