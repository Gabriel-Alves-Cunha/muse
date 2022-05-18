import { useEffect } from "react";
import {
	MdLightbulbOutline as Light,
	MdLightbulb as Dark,
} from "react-icons/md";

import { useLocalStorage } from "@hooks/useLocalStorage";
import { keyPrefix } from "@utils/app";
import { Tooltip } from "@components/Tooltip";

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
		<Tooltip text="Toggle theme" side="right">
			<Button onClick={toggleTheme}>
				{theme === "light" ? <Dark size="20px" /> : <Light size="20px" />}
			</Button>
		</Tooltip>
	);
}

const Button = styled("button", {
	display: "flex", // row
	justifyContent: "center",
	alignItems: "center",

	filter: "drop-shadow(0 0px 5px $lingrad-top)",

	borderRadius: "60% 40% 40% 20% / 70% 50% 30% 25%",
	background: "$lingrad-bottom",
	cursor: "pointer",
	border: "none",
	color: "white",
	size: 40,

	transition: "$scale",

	"&:hover": {
		transition: "$scale",
		transform: "scale(1.2)",
	},
});
