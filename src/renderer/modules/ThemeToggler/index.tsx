import { useEffect } from "react";
import {
	MdLightbulbOutline as Light,
	MdLightbulb as Dark,
} from "react-icons/md";

import { useLocalStorage } from "@hooks/useLocalStorage";
import { TooltipButton } from "@components/TooltipButton";
import { keyPrefix } from "@utils/localStorage";

import { styled, darkTheme, lightTheme } from "@styles/global";

const themeKey = `${keyPrefix}theme` as const;

type Themes = "light" | "dark";

const availableThemes: Record<Themes, string> = Object.freeze({
	light: lightTheme.className,
	dark: darkTheme.className,
} as const);

export function ThemeToggler() {
	const [theme, setTheme] = useLocalStorage<Themes>(themeKey, "light");
	const nextTheme: Themes = theme === "light" ? "dark" : "light";
	const html = document.documentElement;

	// Only run on firt render
	useEffect(() => {
		html.classList.add(availableThemes[theme]);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const toggleTheme = () => {
		html.classList.remove(availableThemes[theme]);
		html.classList.add(availableThemes[nextTheme]);

		setTheme(nextTheme);
	};

	return (
		<Box>
			<TooltipButton
				tooltip="Toggle theme"
				onClick={toggleTheme}
				tooltip-side="right"
			>
				{theme === "light" ? <Dark size="20px" /> : <Light size="20px" />}
			</TooltipButton>
		</Box>
	);
}

const Box = styled("button", {
	dflex: "center",

	filter: "drop-shadow(0 0px 5px $lingrad-top)",

	borderRadius: "60% 40% 40% 20% / 70% 50% 30% 25%",
	background: "$lingrad-bottom",
	cursor: "pointer",
	border: "none",
	size: 40,

	transition: "$scale",

	"&:hover": {
		transition: "$scale",
		transform: "scale(1.2)",
	},

	button: {
		background: "none",
		border: "none",
		color: "white",
	},
});
