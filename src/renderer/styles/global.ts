import { createStitches } from "@stitches/react";
import { toast } from "react-toastify";

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
		"scrollbar-thumb-hover": "#565d61",
		"scrollbar-thumb": "#454a4d",
		scrollbar: "#202324",

		"lingrad-1": "#103783",
		"lingrad-2": "#0B3866",

		"media-player-icons": "#f3f3ee",
		"deactivated-icon": "#6272a4",
		"active-icon": "#4a00e0",

		"alternative-text": "#ccb69b",
		"gray-text": "#828387",
		text: "#f6f6f6",

		"bg-selected": "#5b6b99",
		"bg-tooltip": "#343746",
		"bg-popover": "#182825",
		"bg-navbar": "#191a21",
		"bg-main": "#191a21",
		"bg-dialog": "#182825",
		"bg-media": "#191a21",

		"icon-button-hovered": "#5b6b99",
		"icon-button-2": "#88888880",
		"button-hovered": "#dbdadc",

		"accent-light": "#D4CDC4",
		accent: "#6B6D76",

		"ctx-menu-item-text-disabled": "#d3d3d5",
		"ctx-menu-item-bg-focus": "#6c56d0",
		"ctx-menu-item-text-focus": "white",
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

		"white-glow-around-component": "7px 7px 14px #b1b1b1, -7px -7px 14px white",
	},
});

export const lightTheme = createTheme({
	colors: {
		"scrollbar-thumb-hover": "#555",
		"scrollbar-thumb": "#888",
		scrollbar: "#f1f1f1",

		"lingrad-1": "#8e2de2",
		"lingrad-2": "#4a00e0",

		"media-player-icons": "white",
		"deactivated-icon": "dimgray",
		"active-icon": "#4a00e0",

		"alternative-text": "#0D1F2D",
		"gray-text": "#a8a8a8",
		text: "#0C0910",

		"bg-selected": "#5b6b99",
		"bg-tooltip": "#f7f7f7",
		"bg-popover": "#FAFAC6",
		"bg-navbar": "#f9f6f5",
		"bg-main": "#f9f6f5",
		"bg-dialog": "white",
		"bg-media": "white",

		"icon-button-hovered": "#E5E8EC40",
		"icon-button-2": "#88888830",
		"button-hovered": "#dbdadc",

		"accent-light": "#9381FF",
		accent: "#9882AC",

		"ctx-menu-item-text-disabled": "#d3d3d5",
		"ctx-menu-item-bg-focus": "#6c56d0",
		"ctx-menu-item-text-focus": "white",
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

		"white-glow-around-component": "7px 7px 14px #b1b1b1, -7px -7px 14px white",
	},
});

export const GlobalCSS = globalCss({
	"*, *:after, *:before": {
		boxSizing: "inherit",
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
			color: "white",
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
