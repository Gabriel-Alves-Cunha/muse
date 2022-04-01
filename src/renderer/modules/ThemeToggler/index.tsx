import {
	MdLightbulbOutline as Light,
	MdLightbulb as Dark,
} from "react-icons/md";

import { useLocalStorage } from "@hooks";
import { keyPrefix } from "@utils/app";
import { styled } from "@styles/global";
import { color } from "@styles/theme";
import { useEffect } from "react";

const themeKey = `${keyPrefix}theme` as const;

export function ThemeToggler() {
	const [theme, setTheme] = useLocalStorage<"light" | "dark">(
		themeKey,
		"light",
	);
	const nextTheme = theme === "light" ? "dark" : "light";

	useEffect(() => {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		document.getElementById("root")!.dataset.theme = theme;
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const handleClick = () => {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		document.getElementById("root")!.dataset.theme = nextTheme;

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
	backgroundColor: color("accent"),
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
