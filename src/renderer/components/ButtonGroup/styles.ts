import { styled, keyframes } from "@styles/global";

const spin = keyframes({
	from: {
		transform: "rotate(0deg)",
	},
	to: {
		transform: "rotate(360deg)",
	},
});

const scale = keyframes({
	"0%, 100%": {
		transform: "scale(1.0)",
	},
	"50%": {
		transform: "scale(0.95)",
	},
});

export const Wrapper = styled("div", {
	d: "inline-flex",
	h: "min-content",

	bg: "transparent",

	button: {
		pos: "relative",
		dflex: "center",

		h: "2.5rem",
		px: 20,

		bg: "$bg-button",
		cursor: "pointer",
		b: "none",

		whiteSpace: "nowrap",
		lh: "2.5rem",
		ff: "$primary",
		c: "$text",
		ta: "center",
		fw: 500,

		// willChange: "background, color, border-color, transform",
		transitionProperty: "background, color, border-color, transform",
		transitionTimingFunction: "ease",
		transitionDuration: 0.25,
		transitionDelay: 0,

		"& svg": {
			// all: "unset",
			c: "$gray-text",
		},

		"&.single-button": {
			br: "50%",
			size: "2.5rem",
		},

		"&.first": {
			borderBottomLeftRadius: 12,
			borderTopLeftRadius: 12,
		},

		"&.last": {
			borderBottomRightRadius: 12,
			borderTopRightRadius: 12,
		},

		"&:hover, :focus": {
			bg: "$bg-button-hover",

			"& svg": {
				c: "white",
			},

			"&.reload svg": {
				animation: `${spin} 0.7s linear`,
			},
		},

		"&:active": {
			// This is for the button in general:
			// Let the element get the style values set by the first keyframe before the animation starts (during the animation-delay period):
			animation: `${scale} 0.25s ease 0s`,
		},

		//////////////////////////////////////////
		"&.reloading": {
			// willChange: "transform",
			animation: `${spin} 1s infinite linear`,
		},
	},
});
