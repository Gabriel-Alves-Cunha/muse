import { styled, keyframes } from "@styles/global";

export const Wrapper = styled("div", {
	display: "inline-flex",
	height: "min-content",

	background: "transparent",
});

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

export const Button = styled("button", {
	position: "relative",
	dflex: "center",

	minWidth: "min-content",
	height: "2.5rem",
	width: "auto",

	background: "$bg-button",
	cursor: "pointer",
	border: "none",

	whiteSpace: "nowrap",
	lineHeight: "2.5rem",
	ff: "$primary",
	color: "$text",
	ta: "center",
	fw: 500,

	// willChange: "background, color, border-color, transform",
	transitionProperty: "background, color, border-color, transform",
	transitionTimingFunction: "ease",
	transitionDuration: 0.25,
	transitionDelay: 0,

	"& svg": {
		color: "$gray-text",
	},

	"&.single-button": {
		borderRadius: "50%",
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
		background: "$bg-button-hover",

		"& svg": {
			color: "white",
		},

		"&.reload svg": {
			animation: `${spin} 0.7s linear`,
		},
	},

	//////////////////////////////////////////
	// Tooltip:
	"&:active": {
		"&::before, ::after": {
			visibility: "hidden",
		},

		// This is for the button in general:
		// Let the element get the style values set by the first keyframe before the animation starts (during the animation-delay period):
		animation: `${scale} 0.25s ease 0s`,
		animationIterationCount: 1,
		animationDelay: 0,
	},

	"&:hover::before": {
		visibility: "visible",

		transition: "all 0.4s 2s ease ",
	},

	"&::before, ::after": {
		visibility: "hidden",

		content: "attr(data-tooltip)",
		position: "absolute",
		height: "auto",
		width: "auto",

		border: "1px solid white",
		background: "#181818",
		padding: "3px 8px",
		zIndex: 100,

		whiteSpace: "nowrap",
		lineHeight: "normal",
		ff: "$primary",
		color: "#fff",
		ta: "center",
		fs: "1rem",
		fw: 500,

		pointerEvents: "none",
	},

	variants: {
		"tooltip-side": {
			"left-bottom": {
				"&::before, ::after": {
					bottom: "110%",
					right: "110%",
				},
			},
			bottom: {
				"&::before, ::after": {
					top: "110%",
				},
			},
			right: {
				"&::before, ::after": {
					left: "110%",
				},
			},
			left: {
				"&::before, ::after": {
					right: "110%",
				},
			},
			top: {
				"&::before, ::after": {
					bottom: "110%",
				},
			},
		},
	},

	//////////////////////////////////////////
	// styles for possible buttons:

	"&.reloading": {
		// willChange: "transform",
		animation: `${spin} 1s infinite linear`,
	},
});
