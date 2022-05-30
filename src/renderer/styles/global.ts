import { createStitches } from "@stitches/react";
import { toast } from "react-toastify";

import { dbg, isDevelopment } from "@common/utils";
import { objectDeepKeys } from "@utils/object";
import { arraysEqual } from "@utils/array";

export const { styled, globalCss, keyframes, createTheme, css } =
	createStitches({
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
			w: (value: number | string) => ({
				width: value,
			}),
			h: (value: number | string) => ({
				height: value,
			}),

			p: (value: number | string) => ({
				padding: value,
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

			m: (value: number | string) => ({
				margin: value,
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

			dflex: (value: string) => ({
				display: "flex", // row
				alignItems: value,
				justifyContent: value,
			}),
			dcolumn: (value: string) => ({
				display: "flex",
				flexDirection: "column",
				alignItems: value,
				justifyContent: value,
			}),

			sizeMin: (value: number | string) => ({
				minWidth: value,
				minHeight: value,
				width: value,
				height: value,
			}),

			textGradient: (value: number | string) => ({
				backgroundImage: `linear-gradient(${value})`,
				WebkitTextFillColor: "transparent",
				WebkitBackgroundClip: "text",
			}),

			ff: (value: string) => ({
				fontFamily: value,
			}),
			fw: (value: string | number) => ({
				fontWeight: value,
			}),
			fs: (value: number | string) => ({
				fontSize: value,
			}),
			lh: (value: number | string) => ({
				lineHeight: value,
			}),
			ls: (value: number | string) => ({
				letterSpacing: value,
			}),
			ta: (value: string) => ({
				textAlign: value,
			}),

			d: (value: string) => ({ display: value }),
			fd: (value: string) => ({
				flexDirection: value,
			}),
			b: (value: string | number) => ({
				border: value,
			}),
			br: (value: number | string) => ({
				borderRadius: value,
			}),
			bs: (value: number | string) => ({
				boxShadow: value,
			}),
			bg: (value: string) => ({
				background: value,
			}),
			ov: (value: string) => ({ overflow: value }),
			ox: (value: string) => ({ overflowX: value }),
			oy: (value: string) => ({ overflowY: value }),
		},
	});

export const darkTheme = createTheme({
	colors: {
		"scrollbar-thumb-hover": "#565d61",
		"scrollbar-thumb": "#454a4d",
		scrollbar: "#202324",

		"lingrad-top": "#103783",
		"lingrad-bottom": "#0B3866",

		"media-player-icons": "#f3f3ee",
		"deactivated-icon": "#6272a4",
		"active-icon": "#4a00e0",
		"window-buttons": "#fff",

		"input-placeholder": "#a3a3a3",
		"alternative-text": "#ccb69b",
		"input-text": "#f5f5f5",
		"gray-text": "#828387",
		text: "#f6f6f6",

		"input-border-active": "#0072F5",
		"input-border": "#4d4d4d",
		"input-disabled": "gray",

		"bg-button-hover": "#08368D",
		"bg-selected": "#5b6b99",
		"bg-popover": "#182825",
		"bg-navbar": "#191a21",
		"bg-button": "#191a21",
		"bg-dialog": "#182825",
		"bg-media": "#191a21",
		"bg-main": "#191a21",
		"bg-ctx-menu": "#fff",
		"bg-select": "#fff",

		"media-player-icon-button-hovered": "#fff4",
		"icon-button-hovered": "#fff2",
		"button-hovered": "#dbdadc",

		"accent-light": "#F4A1A9",
		accent: "#C04569",

		"ctx-menu-item-text-disabled": "#d3d3d5",
		"ctx-menu-item-bg-focus": "#6c56d0",
		"ctx-menu-item-text-focus": "#fff",
		"ctx-menu-item-text": "#5747a6",
		"ctx-menu-separator": "#d7d3e2",
		"ctx-menu-text": "#7a797d",
	},
	shadows: {
		tooltip:
			"rgba(17, 17, 26, 0.1) 0px 1px 0px, rgba(17, 17, 26, 0.1) 0px 8px 24px, rgba(17, 17, 26, 0.1) 0px 16px 48px",

		popover: "0 0 8px rgba(255, 255, 255, 0.2)",

		dialog: `hsl(206 22% 7% / 35%) 0px 10px 38px -10px,
		hsl(206 22% 7% / 20%) 0px 10px 20px -15px`,

		"media-player-img": "rgba(0, 0, 0, 0.3) 0 0 20px",

		"row-wrapper": "rgba(255, 255, 255, 0.16) 0 0 6px",

		reflect:
			"0px 50px 70px rgba(0, 0, 0, 0.3), 0px 10px 10px rgba(0, 0, 0, 0.1)",

		"#fff-glow-around-component": "7px 7px 14px #b1b1b1, -7px -7px 14px #fff",
	},
});

export const lightTheme = createTheme({
	colors: {
		"scrollbar-thumb-hover": "#555",
		"scrollbar-thumb": "#888",
		scrollbar: "#f1f1f1",

		"lingrad-top": "#8e2de2",
		"lingrad-bottom": "#4a00e0",

		"media-player-icons": "#fff",
		"deactivated-icon": "dimgray",
		"active-icon": "#4a00e0",
		"window-buttons": "black",

		"input-placeholder": "#a3a3a3",
		"alternative-text": "#0D1F2D",
		"input-text": "#111111",
		"gray-text": "#a8a8a8",
		text: "#0C0910",

		"input-border-active": "#344880",
		"input-disabled": "lightgray",
		"input-border": "#e0e0e0",

		"bg-button-hover": "#005ec9",
		"bg-selected": "#5b6b99",
		"bg-popover": "#FAFAC6",
		"bg-button": "#0072F5",
		"bg-navbar": "#f9f6f5",
		"bg-main": "#f9f6f5",
		"bg-ctx-menu": "#fff",
		"bg-dialog": "#fff",
		"bg-select": "#fff",
		"bg-media": "#fff",

		"media-player-icon-button-hovered": "#fff4",
		"icon-button-hovered": "#88888820",
		"button-hovered": "#dbdadc", // rename these ^ to light and dark

		"accent-light": "#9381FF",
		accent: "#9882AC",

		"ctx-menu-item-text-disabled": "#d3d3d5",
		"ctx-menu-item-bg-focus": "#6c56d0",
		"ctx-menu-item-text-focus": "#fff",
		"ctx-menu-item-text": "#5747a6",
		"ctx-menu-separator": "#d7d3e2",
		"ctx-menu-text": "#7a797d",
	},
	shadows: {
		tooltip:
			"rgba(17, 17, 26, 0.1) 0px 1px 0px, rgba(17, 17, 26, 0.1) 0px 8px 24px, rgba(17, 17, 26, 0.1) 0px 16px 48px",

		popover: "0 0 8px rgba(0, 0, 0, 0.2)",

		dialog: `hsl(206 22% 7% / 35%) 0px 10px 38px -10px,
		hsl(206 22% 7% / 20%) 0px 10px 20px -15px`,

		"media-player-img": "rgba(255, 255, 255, 0.3) 0 0 20px",

		"row-wrapper": "rgba(0, 0, 0, 0.16) 0 0 6px",

		reflect:
			"0px 50px 70px rgba(0, 0, 0, 0.3), 0px 10px 10px rgba(0, 0, 0, 0.1)",

		"#fff-glow-around-component": "7px 7px 14px #b1b1b1, -7px -7px 14px #fff",
	},
});

// darkTheme and lightTheme must have the same keys
// (colors, shadows, etc) so that the theme can be
// switched between them without react rerenders!
if (isDevelopment) {
	// @ts-ignore It will work:
	const lightThemeKeys = objectDeepKeys(lightTheme);
	// @ts-ignore It will work:
	const darkThemeKeys = objectDeepKeys(darkTheme);
	const areEqual = arraysEqual(lightThemeKeys, darkThemeKeys);

	dbg(
		{
			lightThemeKeys,
			darkThemeKeys,
		},
		"Are light and dark themes keys the same?",
		areEqual,
	);
}

export const GlobalCSS = globalCss({
	"*, *:after, *:before": {
		textRendering: "geometricPrecision",
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
		overflow: "hidden !important",
		position: "fixed",
		size: "100%",
	},

	html: {
		boxSizing: "border-box",
		overflow: "hidden",

		"::selection": {
			background: "$accent",
			color: "#fff",
		},

		"::-webkit-scrollbar": {
			display: "none",
		},
	},
});

export const successToast = (info: string) =>
	toast.success(info, {
		hideProgressBar: false,
		position: "top-right",
		progress: undefined,
		closeOnClick: true,
		pauseOnHover: true,
		autoClose: 5000,
		draggable: true,
	});

export const infoToast = (info: string) =>
	toast.info(info, {
		hideProgressBar: false,
		position: "top-right",
		progress: undefined,
		closeOnClick: true,
		pauseOnHover: true,
		autoClose: 5000,
		draggable: true,
	});

export const errorToast = (info: string) =>
	toast.error(info, {
		hideProgressBar: false,
		position: "top-right",
		progress: undefined,
		closeOnClick: true,
		pauseOnHover: true,
		autoClose: 5000,
		draggable: true,
	});
