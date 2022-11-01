import {
	MdLightbulbOutline as Light,
	MdLightbulb as Dark,
} from "react-icons/md";

import { t } from "@components/I18n";
import { useState } from "react";

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

const htmlDataset = document.documentElement.dataset;

export const availableThemes = [
	"light",
	"dark",
] as const;

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Main function:

export function ThemeToggler() {
	const [currTheme, setCurrTheme] = useState(htmlDataset.theme as Theme);
	const newTheme = currTheme === availableThemes[0] ?
		availableThemes[1] :
		availableThemes[0];

	function toggleTheme() {
		htmlDataset.theme = newTheme;
		setCurrTheme(newTheme);
	}

	return (
		<button
			title={t("tooltips.toggleTheme")}
			className="toggle-theme-button"
			onPointerUp={toggleTheme}
		>
			{currTheme === availableThemes[0] ?
				<Dark size="20px" /> :
				<Light size="20px" />}
		</button>
	);
}

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Types:

type Theme = typeof availableThemes[number];
