import { createStitches } from "@stitches/react";

export const { styled, globalCss, keyframes, createTheme } = createStitches({
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
			reflect:
				"0px 50px 70px rgba(0, 0, 0, 0.3), 0px 10px 10px rgba(0, 0, 0, 0.1)",
			"white-glow-around-component":
				"7px 7px 14px #b1b1b1, -7px -7px 14px white",
		},
		transitions: {
			boxShadow: "box-shadow .2s ease-in-out 20ms",
			bgc: "background-color .2s ease-in-out 20ms",
			scale: "transform .2s ease-in-out 20ms",
			opacity: "opacity .1s ease-in-out 20ms",
			filter: "filter .2s ease 20ms",
		},
		fonts: {
			primary: "'Assistant', sans-serif",
		},
	},
	utils: {
		size: (value: number | string) => ({
			height: value,
			width: value,
		}),

		pt: (value: number | string) => ({
			paddingTop: value,
		}),
		pr: (value: number | string) => ({
			paddingRight: value,
		}),
		pb: (value: number | string) => ({
			paddingBottom: value,
		}),
		pl: (value: number | string) => ({
			paddingLeft: value,
		}),
		px: (value: number | string) => ({
			paddingRight: value,
			paddingLeft: value,
		}),
		py: (value: number | string) => ({
			paddingBottom: value,
			paddingTop: value,
		}),

		mt: (value: number | string) => ({
			marginTop: value,
		}),
		mr: (value: number | string) => ({
			marginRight: value,
		}),
		mb: (value: number | string) => ({
			marginBottom: value,
		}),
		ml: (value: number | string) => ({
			marginLeft: value,
		}),
		mx: (value: number | string) => ({
			marginRight: value,
			marginLeft: value,
		}),
		my: (value: number | string) => ({
			marginBottom: value,
			marginTop: value,
		}),
	},
});

export const darkTheme = createTheme({
	colors: {
		"scrollbar-thumb-hover": "#555",
		"scrollbar-thumb": "#888",
		scrollbar: "#f1f1f1",

		"deactivated-icon": "#a8a8a8",
		"active-icon": "#f1f0ea",

		"alternative-text": "#ccb69b",
		"gray-text": "#a8a8a8",
		text: "#e0ddcf",

		"bg-media-player": "#a5907e",
		"bg-main": "#191716",

		"button-hovered": "#dbdadc",

		accent: "#550c18",
	},
});

export const lightTheme = createTheme({
	colors: {
		"scrollbar-thumb-hover": "#555",
		"scrollbar-thumb": "#888",
		scrollbar: "#f1f1f1",

		"deactivated-icon": "#a8a8a8",
		"active-icon": "#191716",

		"alternative-text": "#ccb69b",
		"gray-text": "#a8a8a8",
		text: "#191716",

		"bg-media-player": "#efc69b",
		"bg-main": "#ECEBF3",

		"button-hovered": "#dbdadc",

		accent: "#af1b3f",
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
		overflow: "hidden",
		size: "100%",
	},

	html: {
		overflow: "hidden",

		"::selection": {
			background: "$accent",
			color: "white",
		},

		"::-webkit-scrollbar": {
			display: "none",
		},
	},
});
