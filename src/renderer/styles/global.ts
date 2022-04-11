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
			bgc: "background-color .2s ease-in-out 20ms",
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

		"deactivated-icon": "dimgray",
		"active-icon": "#f1f0ea",

		"alternative-text": "#ccb69b",
		"gray-text": "#a8a8a8",
		text: "#e0ddcf",

		"bg-media-player": "#a5907e",
		"bg-main": "#191716",

		"button-hovered": "#dbdadc",

		"bg-popover": "white",

		"accent-light": "#574f82",
		accent: "#550c18",
	},
	shadows: {
		insetSmall:
			"inset -3px -3px 4px 0 rgba(255, 255, 255, 0.9), inset 3px 3px 4px 0 rgba(0, 0, 0, 0.07)",
		medium:
			"-6px -6px 8px rgba(255, 255, 255, 0.9), 5px 5px 8px rgba(0, 0, 0, 0.07)",
		small: `
			0.1px 0.1px 0.3px rgba(0, 0, 0, 0.02),
			0.3px 0.3px 0.7px rgba(0, 0, 0, 0.028),
			0.5px 0.5px 1.4px rgba(0, 0, 0, 0.035),
			0.9px 0.9px 2.5px rgba(0, 0, 0, 0.042),
			1.7px 1.7px 4.6px rgba(0, 0, 0, 0.05),
			4px 4px 11px rgba(0, 0, 0, 0.07)

			-0.1px -0.1px 0.3px rgba(255, 255, 255, 0.02),
			-0.3px -0.3px 0.7px rgba(255, 255, 255, 0.028),
			-0.5px -0.5px 1.4px rgba(255, 255, 255, 0.035),
			-0.9px -0.9px 2.5px rgba(255, 255, 255, 0.042),
			-1.7px -1.7px 4.6px rgba(255, 255, 255, 0.05),
			-4px -4px 11px rgba(255, 255, 255, 0.07)`,
		// "-3px -3px 4px rgba(255, 255, 255, 0.9), 3px 3px 4px rgba(0, 0, 0, 0.07)",
		"small-black": "0 0 4px 25px rgba(0, 0, 0, 0.07)",
		"medium-black": `
			0.7px 0.7px 2.4px -28px rgba(255, 255, 255, 0.059),
			1.7px 1.7px 5.6px -28px rgba(255, 255, 255, 0.084),
			3.5px 3.5px 12.6px -28px rgba(255, 255, 255, 0.106),
			7.3px 7.3px 35.2px -28px rgba(255, 255, 255, 0.131),
			20px 20px 80px -28px rgba(255, 255, 255, 0.19),

			-0.7px -0.7px 2.4px -28px rgba(255, 255, 255, 0.059),
			-1.7px -1.7px 5.6px -28px rgba(255, 255, 255, 0.084),
			-3.5px -3.5px 12.6px -28px rgba(255, 255, 255, 0.106),
			-7.3px -7.3px 35.2px -28px rgba(255, 255, 255, 0.131),
			-20px -20px 80px -28px rgba(255, 255, 255, 0.19)`,
		glow: "0 0 3px 1px",
		reflect:
			"0px 50px 70px rgba(0, 0, 0, 0.3), 0px 10px 10px rgba(0, 0, 0, 0.1)",
		"white-glow-around-component": "7px 7px 14px #b1b1b1, -7px -7px 14px white",
	},
});

export const lightTheme = createTheme({
	colors: {
		"scrollbar-thumb-hover": "#555",
		"scrollbar-thumb": "#888",
		scrollbar: "#f1f1f1",

		"deactivated-icon": "dimgray",
		"active-icon": "#191716",

		"alternative-text": "#7a2d12",
		"gray-text": "#a8a8a8",
		text: "#191716",

		"bg-media-player": "#efc69b",
		"bg-main": "#f9f6f5",

		"button-hovered": "#dbdadc",

		"bg-popover": "white",

		"accent-light": "#574f82",
		accent: "#af1b3f",
	},
	shadows: {
		insetSmall:
			"inset -3px -3px 4px 0 rgba(255, 255, 255, 0.9), inset 3px 3px 4px 0 rgba(0, 0, 0, 0.07)",
		medium:
			"-6px -6px 8px rgba(255, 255, 255, 0.9), 5px 5px 8px rgba(0, 0, 0, 0.07)",
		small: `
			0.1px 0.1px 0.3px rgba(0, 0, 0, 0.02),
			0.3px 0.3px 0.7px rgba(0, 0, 0, 0.028),
			0.5px 0.5px 1.4px rgba(0, 0, 0, 0.035),
			0.9px 0.9px 2.5px rgba(0, 0, 0, 0.042),
			1.7px 1.7px 4.6px rgba(0, 0, 0, 0.05),
			4px 4px 11px rgba(0, 0, 0, 0.07)

			-0.1px -0.1px 0.3px rgba(255, 255, 255, 0.02),
			-0.3px -0.3px 0.7px rgba(255, 255, 255, 0.028),
			-0.5px -0.5px 1.4px rgba(255, 255, 255, 0.035),
			-0.9px -0.9px 2.5px rgba(255, 255, 255, 0.042),
			-1.7px -1.7px 4.6px rgba(255, 255, 255, 0.05),
			-4px -4px 11px rgba(255, 255, 255, 0.07)`,
		// "-3px -3px 4px rgba(255, 255, 255, 0.9), 3px 3px 4px rgba(0, 0, 0, 0.07)",
		"small-black": "3px 3px 4px rgba(0, 0, 0, 0.07)",
		"medium-black": `
			0.7px 0.7px 2.4px -28px rgba(0, 0, 0, 0.059),
			1.7px 1.7px 5.6px -28px rgba(0, 0, 0, 0.084),
			3.5px 3.5px 12.6px -28px rgba(0, 0, 0, 0.106),
			7.3px 7.3px 35.2px -28px rgba(0, 0, 0, 0.131),
			20px 20px 80px -28px rgba(0, 0, 0, 0.19),

			-0.7px -0.7px 2.4px -28px rgba(0, 0, 0, 0.059),
			-1.7px -1.7px 5.6px -28px rgba(0, 0, 0, 0.084),
			-3.5px -3.5px 12.6px -28px rgba(0, 0, 0, 0.106),
			-7.3px -7.3px 35.2px -28px rgba(0, 0, 0, 0.131),
			-20px -20px 80px -28px rgba(0, 0, 0, 0.19)`,
		glow: "0px 0px 3px 1px",
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
