import { useEffect } from "react";
import {
	MdLightbulbOutline as Light,
	MdLightbulb as Dark,
} from "react-icons/md";

import { styled, darkTheme, lightTheme } from "@styles/global";
import { useLocalStorage } from "@hooks/useLocalStorage";
import { keyPrefix } from "@utils/localStorage";
import { t } from "@components/I18n";

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

const themeKey = `${keyPrefix}theme` as const;
const html = document.documentElement;
// Themes:
const light = "light";
const dark = "dark";

const availableThemes: Readonly<Record<Themes, string>> = Object.freeze({
	light: lightTheme.className,
	dark: darkTheme.className,
});

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Main function:

export function ThemeToggler() {
	const [theme, setTheme] = useLocalStorage<Themes>(themeKey, light);
	const nextTheme: Themes = theme === light ? dark : light;

	function toggleTheme() {
		html.classList.remove(availableThemes[theme]);
		html.classList.add(availableThemes[nextTheme]);

		setTheme(nextTheme);
	}

	// (Only on firt render) set the theme to initialValue (light):
	useEffect(() => {
		html.classList.add(availableThemes[theme]);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<ThemeButton data-tip={t("tooltips.toggleTheme")} onClick={toggleTheme}>
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

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Types:

type Themes = "light" | "dark";
