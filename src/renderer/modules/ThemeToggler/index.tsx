import { useEffect } from "react";
import {
	MdLightbulbOutline as Light,
	MdLightbulb as Dark,
} from "react-icons/md";

import { styled, darkTheme, lightTheme } from "@styles/global";
import { useLocalStorage } from "@hooks/useLocalStorage";
import { TooltipButton } from "@components/TooltipButton";
import { keyPrefix } from "@utils/localStorage";

const themeKey = `${keyPrefix}theme` as const;
const html = document.documentElement;
// Themes:
const light = "light";
const dark = "dark";

const availableThemes: Readonly<Record<Themes, string>> = Object.freeze(
	{ light: lightTheme.className, dark: darkTheme.className } as const,
);

export function ThemeToggler() {
	const [theme, setTheme] = useLocalStorage<Themes>(themeKey, light);
	const nextTheme: Themes = theme === light ? dark : light;

	function toggleTheme() {
		html.classList.remove(availableThemes[theme]);
		html.classList.add(availableThemes[nextTheme]);

		setTheme(nextTheme);
	}

	// Only run on firt render
	useEffect(() => {
		html.classList.add(availableThemes[theme]);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<Box>
			<TooltipButton
				tooltip="Toggle theme"
				onClick={toggleTheme}
				tooltip-side="right"
			>
				{theme === light ? <Dark size="20px" /> : <Light size="20px" />}
			</TooltipButton>
		</Box>
	);
}

const Box = styled("div", {
	pos: "relative",
	dflex: "center",
	size: 50,

	cursor: "pointer",
	bg: "none",
	b: "none",

	button: {
		c: "$deactivated-icon",
		size: "100%",

		"&:hover": { c: "$active-icon" },
	},
});

type Themes = "light" | "dark";
