import { MoonIcon as Dark } from "@icons/MoonIcon";
import { SunIcon as Light } from "@icons/SunIcon";

import { createSignal } from "solid-js";
import { useI18n } from "@solid-primitives/i18n";

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
	const [theme, setTheme] = createSignal(htmlDataset.theme as Theme);
	const [t] = useI18n();

	const newTheme = () =>
		theme() === availableThemes[0] ? availableThemes[1] : availableThemes[0];

	function toggleTheme() {
		htmlDataset.theme = newTheme();
		setTheme(newTheme());
	}

	return (
		<button
			title={t("tooltips.toggleTheme")}
			class="toggle-theme-button"
			onPointerUp={toggleTheme}
		>
			{theme() === availableThemes[0] ? (
				<Dark class="w-5 h-5" />
			) : (
				<Light class="w-5 h-5" />
			)}
		</button>
	);
}

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Types:

type Theme = typeof availableThemes[number];
