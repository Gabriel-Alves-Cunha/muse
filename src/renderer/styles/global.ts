import { createStitches, globalCss } from "@stitches/react";

import { theme } from "./theme";

// Set up reusable breakpoints.
export const { styled } = createStitches({
	media: {
		medium: "(min-width: 768px)",
		large: "(min-width: 1024px)",
		small: "(min-width: 640px)", // Maybe change to max- ?
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
		/* Make a vertical red line at the middle */
		/* height: 100vh,
		background: linear-gradient(red, red) no-repeat center/1px 100%, */
	},

	html: {
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

		overflow: "hidden",

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

	"&::selection": {
		background: theme.colors.accent,
		color: "white",
	},
});
