import { MoonIcon as Dark } from "@icons/MoonIcon";
import { SunIcon as Light } from "@icons/SunIcon";

import { createSignal, Show } from "solid-js";
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

	const toggleTheme = () => {
		htmlDataset.theme = newTheme();
		setTheme(newTheme());
	};

	return (
		<button
			title={t("tooltips.toggleTheme")}
			class="toggle-theme-button"
			onPointerUp={toggleTheme}
			type="button"
		>
			<Show
				when={theme() === availableThemes[0]}
				fallback={<Light class="w-5 h-5" />}
			>
				<Dark class="w-5 h-5" />
			</Show>
		</button>
	);
}

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Types:

type Theme = typeof availableThemes[number];
