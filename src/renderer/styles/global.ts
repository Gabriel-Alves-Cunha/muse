import { createStitches } from "@stitches/react";

export const { styled, globalCss, keyframes, createTheme } = createStitches({
	media: {
		sm: "(max-width: 500px)",
		md: "(max-width: 768px)",
		lg: "(max-width: 1024px)",

		"media-player": "(max-width: 177px)",
	},
	theme: {
		transitions: {
			boxShadow: "box-shadow .2s ease-in-out 20ms",
			bgc: "background-color .1s ease-in-out 20ms",
			scale: "transform .2s ease-in-out 20ms",
			opacity: "opacity .1s ease-in-out 20ms",
			color: "color .1s ease-in-out 20ms",
			filter: "filter .2s ease 20ms",
		},
		fonts: {
			primary: "'Assistant', sans-serif",
			secondary: "Source Sans Pro",
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

		"media-player-icons": "#0C0910",
		"deactivated-icon": "dimgray",
		"active-icon": "#f1f0ea",

		"alternative-text": "#ccb69b",
		"gray-text": "#a8a8a8",
		text: "#e0ddcf",

		"bg-popover": "white",
		"bg-main": "#191716",

		"icon-button-2": "#88888880",
		"button-hovered": "#dbdadc",
		"icon-button": "#dbdadc80",

		"accent-light": "#574f82",
		accent: "#550c18",
	},
	shadows: {
		popup: "0 0 8px rgba(255, 255, 255, 0.2)",
		"media-player-img": "rgba(0, 0, 0, 0.3) 0 0 20px",
		"row-wrapper": "rgba(0, 0, 0, 0.16) 0 0 4px",
		reflect:
			"0px 50px 70px rgba(0, 0, 0, 0.3), 0px 10px 10px rgba(0, 0, 0, 0.1)",
		"white-glow-around-component": "7px 7px 14px #b1b1b1, -7px -7px 14px white",
	},
});
//2px 2px 50px rgba(0, 0, 0, 0.2)
export const lightTheme = createTheme({
	colors: {
		"scrollbar-thumb-hover": "#555",
		"scrollbar-thumb": "#888",
		scrollbar: "#f1f1f1",

		"media-player-icons": "white",
		"deactivated-icon": "dimgray",
		"active-icon": "#0C0910",

		"alternative-text": "#0D1F2D",
		"gray-text": "#a8a8a8",
		text: "#0C0910",

		"bg-popover": "white",
		"bg-main": "#f9f6f5",

		"icon-button-2": "#88888830",
		"button-hovered": "#dbdadc",
		"icon-button": "#E5E8EC40",

		"accent-light": "#9381FF",
		accent: "#9882AC",
	},
	shadows: {
		popup: "0 0 8px rgba(0, 0, 0, 0.2)",
		"media-player-img": "rgba(255, 255, 255, 0.3) 0 0 20px",
		"row-wrapper": "rgba(0, 0, 0, 0.16) 0 0 4px",
		reflect:
			"0px 50px 70px rgba(0, 0, 0, 0.3), 0px 10px 10px rgba(0, 0, 0, 0.1)",
		"white-glow-around-component": "7px 7px 14px #b1b1b1, -7px -7px 14px white",
	},
});

export const GlobalCSS = globalCss({
	"*, *:after, *:before": {
		"-webkit-font-smoothing": "antialiased",
		boxSizing: "border-box",
		padding: 0,
		margin: 0,

		"&:focus": {
			outline: "none !important",
		},
	},

	input: {
		"&:focus-visible": {
			outline: "none",
		},
	},

	button: {
		"-webkit-app-region": "no-drag",
	},

	body: {
		position: "fixed",
		overflow: "hidden !important",
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
