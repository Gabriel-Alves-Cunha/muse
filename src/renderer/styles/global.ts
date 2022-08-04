import { createStitches, type CSSProperties } from "@stitches/react";
import { toast } from "react-toastify";

import { areArraysEqualByValue } from "@utils/array";
import { getObjectDeepKeys } from "@utils/object";
import { isDevelopment } from "@common/utils";

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Main functions:

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
				scale: "scale .2s ease-in-out 20ms",
			},
			fonts: { primary: "Assistant", secondary: "Source Sans Pro" },
		},
		utils: {
			size: (width: CSSProperties["width"]) => ({ height: width, width }),
			pos: (position: CSSProperties["position"]) => ({ position }),
			bo: (bottom: CSSProperties["bottom"]) => ({ bottom }),
			h: (height: CSSProperties["height"]) => ({ height }),
			w: (width: CSSProperties["width"]) => ({ width }),
			r: (right: CSSProperties["right"]) => ({ right }),
			l: (left: CSSProperties["left"]) => ({ left }),
			t: (top: CSSProperties["top"]) => ({ top }),

			pb: (paddingBottom: CSSProperties["paddingBottom"]) => ({
				paddingBottom,
			}),
			pr: (paddingRight: CSSProperties["paddingRight"]) => ({ paddingRight }),
			pl: (paddingLeft: CSSProperties["paddingLeft"]) => ({ paddingLeft }),
			pt: (paddingTop: CSSProperties["paddingTop"]) => ({ paddingTop }),
			p: (padding: CSSProperties["padding"]) => ({ padding }),
			px: (value: CSSProperties["padding"]) => ({
				paddingRight: value,
				paddingLeft: value,
			}),
			py: (value: CSSProperties["padding"]) => ({
				paddingBottom: value,
				paddingTop: value,
			}),

			mb: (marginBottom: CSSProperties["marginBottom"]) => ({ marginBottom }),
			mr: (marginRight: CSSProperties["marginRight"]) => ({ marginRight }),
			ml: (marginLeft: CSSProperties["marginLeft"]) => ({ marginLeft }),
			mt: (marginTop: CSSProperties["marginTop"]) => ({ marginTop }),
			m: (margin: CSSProperties["margin"]) => ({ margin }),
			mx: (value: CSSProperties["margin"]) => ({
				marginRight: value,
				marginLeft: value,
			}),
			my: (value: CSSProperties["margin"]) => ({
				marginBottom: value,
				marginTop: value,
			}),

			dflex: (value: CSSProperties["justifyContent"]) => ({
				display: "flex", // row
				justifyContent: value,
				alignItems: value,
			}),
			dcolumn: (value: CSSProperties["justifyContent"]) => ({
				display: "flex",
				flexDirection: "column",
				justifyContent: value,
				alignItems: value,
			}),

			sizeMin: (width: CSSProperties["width"]) => ({
				minHeight: width,
				minWidth: width,
				height: width,
				width,
			}),

			textGradient: (value: CSSProperties["backgroundImage"]) => ({
				backgroundImage: `linear-gradient(${value})`,
				WebkitTextFillColor: "transparent",
				WebkitBackgroundClip: "text",
			}),

			ls: (letterSpacing: CSSProperties["letterSpacing"]) => ({
				letterSpacing,
			}),
			fw: (fontWeight: CSSProperties["fontWeight"]) => ({ fontWeight }),
			lh: (lineHeight: CSSProperties["lineHeight"]) => ({ lineHeight }),
			ff: (fontFamily: CSSProperties["fontFamily"]) => ({ fontFamily }),
			ta: (textAlign: CSSProperties["textAlign"]) => ({ textAlign }),
			fs: (fontSize: CSSProperties["fontSize"]) => ({ fontSize }),
			c: (color: CSSProperties["color"]) => ({ color }),

			jc: (justifyContent: CSSProperties["justifyContent"]) => ({
				justifyContent,
			}),
			fd: (flexDirection: CSSProperties["flexDirection"]) => ({
				flexDirection,
			}),
			br: (borderRadius: CSSProperties["borderRadius"]) => ({ borderRadius }),
			bg: (background: CSSProperties["background"]) => ({ background }),
			bs: (boxShadow: CSSProperties["boxShadow"]) => ({ boxShadow }),
			ox: (overflowX: CSSProperties["overflowX"]) => ({ overflowX }),
			oy: (overflowY: CSSProperties["overflowY"]) => ({ overflowY }),
			ov: (overflow: CSSProperties["overflow"]) => ({ overflow }),
			d: (display: CSSProperties["display"]) => ({ display }),
			b: (border: CSSProperties["border"]) => ({ border }),

			scroll: (size: CSSProperties["width"]) => ({
				/* width */
				"&::-webkit-scrollbar": { d: "block", size },

				/* Track */
				"&::-webkit-scrollbar-track": { bg: "$scrollbar" },

				/* Handle */
				"&::-webkit-scrollbar-thumb": { bg: "$scrollbar-thumb" },

				/* Handle on hover */
				"&::-webkit-scrollbar-thumb:hover": { bg: "$scrollbar-thumb-hover" },

				scrollbarGutter: "stable",
				overflowY: "auto",
			}),
		},
	});

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Themes:

export const darkTheme = createTheme({
	colors: {
		"scrollbar-thumb-hover": "#565d61",
		"scrollbar-thumb": "#454a4d",
		scrollbar: "#202324",

		"lingrad-bottom": "#0B3866",
		"lingrad-top": "#103783",

		"media-player-icons-disabled": "#e0e6ee7a",
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
		"selected-border": "#4d4d4d",
		"input-border": "#4d4d4d",
		"input-disabled": "gray",

		"bg-button-hover": "#08368D",
		"bg-highlight": "#C04569",
		"bg-selected": "#252121",
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
		popover: "0 0 8px rgba(0, 0, 0, 0.3)",

		dialog: `hsl(206 22% 7% / 35%) 0px 10px 38px -10px,
		hsl(206 22% 7% / 20%) 0px 10px 20px -15px`,

		"media-player-img": "rgba(0, 0, 0, 0.3) 0 0 20px",

		"row-wrapper": "rgba(255, 255, 255, 0.16) 0 0 6px",

		reflect:
			"0px 50px 70px rgba(0, 0, 0, 0.3), 0px 10px 10px rgba(0, 0, 0, 0.1)",

		"glow-around-component": "7px 7px 14px #b1b1b1, -7px -7px 14px #fff",
	},
});

////////////////////////////////////////////////

export const lightTheme = createTheme({
	colors: {
		"scrollbar-thumb-hover": "#555",
		"scrollbar-thumb": "#888",
		scrollbar: "#f1f1f1",

		"lingrad-bottom": "#4a00e0",
		"lingrad-top": "#8e2de2",

		"media-player-icons-disabled": "#e0e6ee7a",
		"deactivated-icon": "dimgray",
		"media-player-icons": "#fff",
		"active-icon": "#4a00e0",
		"window-buttons": "black",

		"input-placeholder": "#a3a3a3",
		"alternative-text": "#113047",
		"input-text": "#111111",
		"gray-text": "#a8a8a8",
		text: "#0C0910",

		"input-border-active": "#344880",
		"selected-border": "#4b00e038",
		"input-disabled": "lightgray",
		"input-border": "#e0e0e0",

		"bg-button-hover": "#8e2de2",
		"bg-highlight": "#9882AC",
		"bg-selected": "#aac1ff70",
		"bg-popover": "#f9f6f5",
		"bg-button": "#f9f6f5",
		"bg-navbar": "#f9f6f5",
		"bg-media": "#f9f6f5",
		"bg-main": "#f9f6f5",
		"bg-ctx-menu": "#fff",
		"bg-dialog": "#fff",
		"bg-select": "#fff",

		"media-player-icon-button-hovered": "#fff4",
		"icon-button-hovered": "#88888857",

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
		popover: "0 0 8px rgba(0, 0, 0, 0.2)",

		dialog: `hsl(206 22% 7% / 35%) 0px 10px 38px -10px,
		hsl(206 22% 7% / 20%) 0px 10px 20px -15px`,

		"media-player-img": "rgba(255, 255, 255, 0.3) 0 0 20px",

		"row-wrapper": "rgba(0, 0, 0, 0.16) 0 0 6px",

		reflect:
			"0px 50px 70px rgba(0, 0, 0, 0.3), 0px 10px 10px rgba(0, 0, 0, 0.1)",

		"glow-around-component": "7px 7px 14px #b1b1b1, -7px -7px 14px #fff",
	},
});

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////

// darkTheme and lightTheme must have the same keys
// (colors, shadows, etc) so that the theme can be
// switched between them without react rerenders!
if (isDevelopment) {
	// @ts-ignore It will work:
	const lightThemeKeys = getObjectDeepKeys(lightTheme);
	// @ts-ignore It will work:
	const darkThemeKeys = getObjectDeepKeys(darkTheme);
	const areEqual = areArraysEqualByValue(lightThemeKeys, darkThemeKeys);

	if (!areEqual)
		console.error(
			{ lightThemeKeys, darkThemeKeys },
			"Are light and dark themes keys the same?",
			areEqual,
		);
}

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////

export const GlobalCSS = globalCss({
	"*, *::after, *::before": {
		textRendering: "geometricPrecision",
		boxSizing: "inherit",
		padding: 0,
		margin: 0,

		overscrollBehavior: "none",
	},

	"*": {
		transitionProperty:
			"color, background-color, border-color, box-shadow, -webkit-scrollbar-track, -webkit-scrollbar-thumb, caret-color",
		transitionTimingFunction: "ease",
		transitionDuration: "0.25s",
	},

	"@font-face": [
		/* assistant-300 - latin */
		{
			fontFamily: "Assistant",
			fontStyle: "normal",
			fontWeight: 300,
			// This shit is the hacky way I found to get the fonts to load
			// both on development and production with Vite!
			src: `url('./assets/${
				isDevelopment ? "fonts/" : ""
			}assistant-v16-latin-300.woff2') format('woff2')`,
		},
		/* assistant-regular-400 - latin */
		{
			fontFamily: "Assistant",
			fontStyle: "normal",
			fontWeight: 400,
			src: `url('./assets/${
				isDevelopment ? "fonts/" : ""
			}assistant-v16-latin-regular.woff2') format('woff2')`,
		},
		/* assistant-500 - latin */
		{
			fontFamily: "Assistant",
			fontStyle: "normal",
			fontWeight: 500,
			src: `url('./assets/${
				isDevelopment ? "fonts/" : ""
			}assistant-v16-latin-500.woff2') format('woff2')`,
		},

		/* source-sans-pro-regular-400 - latin */
		{
			fontFamily: "Source Sans Pro",
			fontStyle: "normal",
			fontWeight: 400,
			src: `url('./assets/${
				isDevelopment ? "fonts/" : ""
			}source-sans-pro-v21-latin-regular.woff2') format('woff2')`,
		},
	],

	button: { "-webkit-app-region": "no-drag" },

	body: {
		position: "fixed",
		lineHeight: 1.5,
		size: "100%",

		containIntrinsicSize: "1px 5000px",
		contentVisibility: "auto",

		"& .notransition *": { transition: "none !important" },
	},

	html: {
		boxSizing: "border-box",
		caretColor: "$accent",
		overflow: "hidden",

		"::selection": { background: "$accent", color: "#fff" },

		"::-webkit-scrollbar": { display: "none" },

		".tooltip": {
			size: "auto",

			opacity: "1 !important",
			p: "3px 8px",
			br: 0,

			whiteSpace: "nowrap",
			ff: "$primary",
			lh: "normal",
			ta: "center",
			fs: "1rem",
			c: "#fff",
			fw: 500,

			pointerEvents: "none",
			transition: "none",

			"&::before, &::after": { content: "none" },
		},
	},
});

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////

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

////////////////////////////////////////////////

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

////////////////////////////////////////////////

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
