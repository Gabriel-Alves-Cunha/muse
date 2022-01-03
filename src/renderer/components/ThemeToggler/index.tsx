import { useEffect, useState } from "react";
import styled from "@emotion/styled";

import { useLocalStorage } from "../../hooks/useLocalStorage";

export function ThemeToggler() {
	const [presetTheme, setLocalStoragedTheme] = useLocalStorage<
		"light" | "dark"
	>("@muse:theme", "light");

	const [theme, setTheme] = useState(presetTheme);
	const nextTheme = theme === "light" ? "dark" : "light";

	useEffect(() => {
		document.body.dataset.theme = theme;
		setLocalStoragedTheme(theme);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [theme]);

	return (
		<Button onClick={() => setTheme(nextTheme)}>
			Change to {nextTheme} mode
		</Button>
	);
}

const Button = styled.button``;
