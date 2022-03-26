import { createStitches } from "@stitches/react";

import { theme } from "./theme";

export const { styled, globalCss, keyframes } = createStitches({
	media: {
		sm: "(max-width: 500px)",
		md: "(max-width: 768px)",
		lg: "(max-width: 1024px)",
	},
	theme: {
		shadows: {
			insetSmall:
				"inset -3px -3px 4px 0 rgba(255, 255, 255, 0.9), inset 3px 3px 4px 0 rgba(0, 0, 0, 0.07)",
			medium:
				"-6px -6px 8px rgba(255, 255, 255, 0.9), 5px 5px 8px rgba(0, 0, 0, 0.07)",
			small:
				"-3px -3px 4px rgba(255, 255, 255, 0.9), 3px 3px 4px rgba(0, 0, 0, 0.07)",
			glow: "0px 0px 3px 1px",
			whiteGlowAroundComponent: "7px 7px 14px #b1b1b1, -7px -7px 14px white",
		},
		fonts: {
			fontFamily: "'Assistant', sans-serif",
			color: theme.colors.text,
			letterSpacing: "0.03em",
			fontSize: "1rem",
		},
	},
	utils: {
		size: (value: number | string) => ({
			height: value,
			width: value,
		}),
	},
});

export const GlobalCSS = globalCss({
	"*": {
		"-webkit-font-smoothing": "antialiased",
		padding: 0,
		margin: 0,

		"&:focus": {
			outline: "none !important",
		},
	},

	button: {
		"-webkit-app-region": "no-drag",
	},

	body: {
		height: "100%",
		overflow: "hidden",

		/* Make a vertical red line at the middle */
		/* height: 100vh,
		background: linear-gradient(red, red) no-repeat center/1px 100%, */
	},

	html: {
		overflow: "hidden",

		"[data-theme='light']": {
			"--nav-button-hovered-color": "#25306c",
			"--nav-button-active-color": "white",
			"--nav-button-hovered-bg": "#c9c2f9",
			"--nav-button-active-bg": "#c1bbec",
			"--accent-alpha": "#aa00ff26",
			"--accent-light": "#f1d4ff",
			"--bg-central": "#f2f3f7",
			"--secondary": "#edecf8",
			"--gray-text": "#8e8e8e",
			"--black-text": "black",
			"--accent": "#aa00ff",
			"--bg-nav": "#edecf8",
			"--text": "#00525e",
			"--primary": "",
		},

		"[data-theme='dark']": {
			"--nav-button-hovered-color": "",
			"--nav-button-active-color": "",
			"--nav-button-hovered-bg": "",
			"--accent-alpha": "#aa00ff99",
			"--nav-button-active-bg": "",
			"--accent-light": "#dd99ff",
			"--bg-central": "",
			"--black-text": "",
			"--secondary": "",
			"--gray-text": "",
			"--primary": "",
			"--accent": "",
			"--bg-nav": "",
			"--text": "",
		},

		"::selection": {
			background: theme.colors.accent,
			color: "white",
		},

		"::-webkit-scrollbar": {
			display: "none",
		},
	},
});
