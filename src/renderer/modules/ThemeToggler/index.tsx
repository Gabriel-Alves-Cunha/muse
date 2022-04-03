import {
	MdLightbulbOutline as Light,
	MdLightbulb as Dark,
} from "react-icons/md";

import { styled, darkTheme, lightTheme } from "@styles/global";
import { useLocalStorage } from "@hooks";
import { keyPrefix } from "@utils/app";
import { useEffect } from "react";

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

	const handleClick = () => {
		html.classList.remove(availableThemes[theme]);
		html.classList.add(availableThemes[nextTheme]);

		setTheme(nextTheme);
	};

	return (
		<Button onClick={handleClick}>
			{theme === "light" ? <Light size="20px" /> : <Dark size="20px" />}
		</Button>
	);
}

const Button = styled("button", {
	display: "flex", // row
	justifyContent: "center",
	alignItems: "center",

	borderRadius: "60% 40% 40% 20% / 70% 50% 30% 25%",
	backgroundColor: "$accent",
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
