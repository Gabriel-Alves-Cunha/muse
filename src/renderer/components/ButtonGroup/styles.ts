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

	transition:
		"background 0.25s ease 0s, color 0.25s ease 0s, border-color 0.25s ease 0s, box-shadow 0.25s ease 0s, transform 0.25s ease 0s, opacity 0.25s ease 0s;",

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

	"&:active": {
		scale: "0.97",
	},

	"&:hover :focus": {
		background: "$bg-button-hover",
	},

	"&:hover": {
		// transitionDelay: "3s",

		"&::before": {
			position: "absolute",
			display: "inline-block",
			height: "auto",
			width: "auto",
			left: "90%",
			top: "50%",

			background: "black",
			padding: "3px 8px",
			border: 0,

			clip: "rect(0, 0, 0, 0)",
			transform: "translateY(-50%)",
			transitionDelay: "3s",

			whiteSpace: "nowrap",
			color: "white",
			lh: "normal",
			fs: 16,

			visibility: "visible",
			opacity: 1,
		},
	},

	//////////////////////////////////////////
	// styles for possible buttons:

	"&.reloading": {
		"&:hover": {
			animation: `${spin} 0.5s linear`,
		},

		"& svg": {
			animation: `${spin} infinity linear`,
		},
	},
});
