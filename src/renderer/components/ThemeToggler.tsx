import {
	MdLightbulbOutline as Light,
	MdLightbulb as Dark,
} from "react-icons/md";

import { selectT, useTranslator } from "@i18n";
import {
	getSettings,
	selectTheme,
	setSettings,
	useSettings,
} from "@contexts/settings";

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

export const availableThemes = ["light", "dark"] as const;

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Main function:

export function ThemeToggler(): JSX.Element {
	const theme = useSettings(selectTheme);
	const t = useTranslator(selectT);

	return (
		<button
			title={t("tooltips.toggleTheme")}
			onPointerUp={toggleTheme}
			data-toggle-theme-button
		>
			{theme === availableThemes[0] ? (
				<Dark size="20px" />
			) : (
				<Light size="20px" />
			)}
		</button>
	);
}

function toggleTheme(): void {
	const newTheme =
		getSettings().theme === availableThemes[0]
			? availableThemes[1]
			: availableThemes[0];

	document.documentElement.dataset.theme = newTheme;
	setSettings({ theme: newTheme });
}
