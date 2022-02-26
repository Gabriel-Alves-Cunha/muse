import { createStitches } from "@stitches/react";

import { theme } from "./theme";

// You can use the returned theme objects to read the tokens, like so:
// default theme:
//  theme.colors.foreground.value; // black
//  theme.colors.foreground.token; // foreground
//  theme.colors.foreground.scale; // colors
//  theme.colors.foreground.variable; // --colors-foreground
//  theme.colors.foreground.computedValue; // var(--colors-foreground)
export const { styled, globalCss, keyframes } = createStitches({
	media: {
		medium: "(min-width: 768px)",
		large: "(min-width: 1024px)",
		small: "(min-width: 640px)", // Maybe change to max- ?
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
		},
		fonts: {
			fontFamily: "'Assistant', sans-serif",
			color: theme.colors.text,
			letterSpacing: "0.03em",
			fontSize: "1rem",
		},
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

	"&::selection": {
		background: theme.colors.accent,
		color: "white",
	},

	body: {
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
			"--bg-central": "#f2f3f7",
			"--black-text": "black",
			"--secondary": "#edecf8",
			"--gray-text": "#8e8e8e",
			"--primary": "",
			"--accent": "#aa00ff",
			"--bg-nav": "#edecf8",
			"--text": "#00525e",
		},

		"[data-theme='dark']": {
			"--nav-button-hovered-color": "",
			"--nav-button-active-color": "",
			"--nav-button-hovered-bg": "",
			"--nav-button-active-bg": "",
			"--accent-alpha": "#aa00ff99",
			"--bg-central": "",
			"--black-text": "",
			"--secondary": "",
			"--gray-text": "",
			"--primary": "",
			"--accent": "",
			"--bg-nav": "",
			"--text": "",
		},

		/* width */
		"&::-webkit-scrollbar": {
			width: 5,
		},

		/* Track */
		"&::-webkit-scrollbar-track": {
			background: "#f1f1f1",
		},

		/* Handle */
		"&::-webkit-scrollbar-thumb": {
			background: "#888",
		},

		/* Handle on hover */
		"&::-webkit-scrollbar-thumb:hover": {
			background: "#555",
		},
	},
});
