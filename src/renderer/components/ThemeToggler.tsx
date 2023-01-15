import { useState } from "react";
import {
	MdLightbulbOutline as Light,
	MdLightbulb as Dark,
} from "react-icons/md";

import { useTranslation } from "@i18n";
import { setSettings } from "@contexts/settings";

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

const htmlDataset = document.documentElement.dataset;

export const availableThemes = ["light", "dark"] as const;

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Main function:

export function ThemeToggler() {
	const [theme, setTheme] = useState(htmlDataset.theme as Theme);
	const { t } = useTranslation();

	const newTheme =
		theme === availableThemes[0] ? availableThemes[1] : availableThemes[0];

	const toggleTheme = () => {
		setSettings((prev) => ({ ...prev, theme: newTheme }));
		htmlDataset.theme = newTheme;
		setTheme(newTheme);
	};

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

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Types:

type Theme = typeof availableThemes[number];
