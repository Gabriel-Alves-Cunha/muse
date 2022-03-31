/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { useEffect } from "react";
import { styled } from "@styles/global";
import {
	MdLightbulbOutline as Light,
	MdLightbulb as Dark,
} from "react-icons/md";

import { useLocalStorage } from "@hooks";
import { keyPrefix } from "@utils/app";
import { color } from "@styles/theme";

const themeKey = `${keyPrefix}theme` as const;

export function ThemeToggler() {
	const [theme, setTheme] = useLocalStorage<"light" | "dark">(
		themeKey,
		"light",
	);
	const nextTheme = theme === "light" ? "dark" : "light";

	useEffect(() => {
		document.getElementById("root")!.dataset.theme = theme;

		setTheme(theme);
	}, [setTheme, theme]);

	const handleClick = () => {
		document.getElementById("wave")!.classList.toggle("active");

		setTheme(nextTheme);
	};

	return (
		<Button onClick={handleClick}>
			{theme === "light" ? <Light size="20px" /> : <Dark size="20px" />}
		</Button>
	);
}

const Button = styled("button", {
	position: "absolute",
	display: "flex",
	alignItems: "center",
	justifyContent: "center",

	borderRadius: "60% 40% 40% 20% / 70% 50% 30% 25%",
	backgroundColor: color("accent"),
	border: "none",
	color: "white",
	zIndex: 10,
	size: 40,

	marginBottom: "2.5rem",
	marginTop: "2rem",
	marginLeft: 12,

	transition: "transform .2s ease-in-out",

	"&:hover": {
		transition: "transform .2s ease-in-out",
		transform: "scale(1.2)",
	},
});
