import { useSnapshot } from "valtio";
import {
	MdLightbulbOutline as Light,
	MdLightbulb as Dark,
} from "react-icons/md";

import { translation } from "@i18n";
import { settings } from "@contexts/settings";

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

export const availableThemes = ["light", "dark"] as const;

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Main function:

export function ThemeToggler() {
	const settingsAccessor = useSnapshot(settings);
	const translationAccessor = useSnapshot(translation);
	const t = translationAccessor.t;

	return (
		<button
			title={t("tooltips.toggleTheme")}
			onPointerUp={toggleTheme}
			data-toggle-theme-button
		>
			{settingsAccessor.theme === availableThemes[0] ? (
				<Dark size="20px" />
			) : (
				<Light size="20px" />
			)}
		</button>
	);
}

function toggleTheme() {
	const newTheme =
		settings.theme === availableThemes[0]
			? availableThemes[1]
			: availableThemes[0];

	document.documentElement.dataset.theme = newTheme;
	settings.theme = newTheme;
}
