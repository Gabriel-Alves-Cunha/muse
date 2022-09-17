import { useEffect } from "react";
import {
	MdLightbulbOutline as Light,
	MdLightbulb as Dark,
} from "react-icons/md";

import { type Settings, setSettings, useSettings } from "@contexts/settings";
import { styled, darkTheme, lightTheme } from "@styles/global";
import { t } from "@components/I18n";

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

// Themes:
const light = "light";
const dark = "dark";

const availableThemes = {
	light: lightTheme.className,
	dark: darkTheme.className,
} as const;

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Main function:

const themeSelector = (state: ReturnType<typeof useSettings.getState>) =>
	state.theme;

export function ThemeToggler() {
	const theme = useSettings(themeSelector);
	const nextTheme: Settings["theme"] = theme === light ? dark : light;

	function toggleTheme() {
		document.documentElement.classList.remove(availableThemes[theme]);
		document.documentElement.classList.add(availableThemes[nextTheme]);

		setSettings({ theme: nextTheme });
	}

	// (Only on firt render) set the theme to initialValue (light):
	useEffect(() => {
		document.documentElement.classList.add(availableThemes[theme]);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<ThemeButton
			aria-label={t("tooltips.toggleTheme")}
			title={t("tooltips.toggleTheme")}
			onPointerUp={toggleTheme}
		>
			{theme === light ? <Dark size="20px" /> : <Light size="20px" />}
		</ThemeButton>
	);
}

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Styles:

const ThemeButton = styled("button", {
	pos: "relative",
	dflex: "center",
	size: 50,

	cursor: "pointer",
	bg: "none",
	b: "none",

	c: "$deactivated-icon",

	"&:hover, &:focus": { c: "$active-icon" },
});
