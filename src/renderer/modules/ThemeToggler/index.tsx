import { useEffect, useState } from "react";
import styled from "@emotion/styled";

import { useLocalStorage } from "@hooks";
import { keyPrefix } from "@utils/app";

const themeKey = keyPrefix + "theme";

export function ThemeToggler() {
	const [presetTheme, setLocalStoragedTheme] = useLocalStorage<
		"light" | "dark"
	>(themeKey, "light");

	const [theme, setTheme] = useState(presetTheme);

	const nextTheme = theme === "light" ? "dark" : "light";

	useEffect(() => {
		document.body.dataset.theme = theme;
		setLocalStoragedTheme(theme);
	}, [setLocalStoragedTheme, theme]);

	return (
		<Button onClick={() => setTheme(nextTheme)}>
			Change to {nextTheme} mode
		</Button>
	);
}

const Button = styled.button``;
