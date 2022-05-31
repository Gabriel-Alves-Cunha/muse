import { Trigger } from "@radix-ui/react-popover";

import { styled } from "@styles/global";

export const Wrapper = styled("div", {
	position: "relative",
	display: "flex", // row,
	justifyContent: "center",
	width: "100%",
});

export const StyledPopoverTrigger = styled(Trigger, {
	display: "flex", // row
	justifyContent: "center",
	alignItems: "center",
	size: 40,

	background: "transparent",
	cursor: "pointer",
	border: "none",

	color: "$deactivated-icon",
	fontSize: "1rem",

	willChange: "transform",
	transition: "$scale",

	"&:hover": {
		transition: "$scale",
		transform: "scale(1.4)",
		color: "$active-icon",
	},

	"&.active": {
		transform: "scale(1.4)",
		color: "$active-icon",
	},

	"&.has-items": {
		position: "relative",
		display: "inline-block",

		i: {
			position: "absolute",
			boxSizing: "content-box",
			width: "100%",
			right: -5,
			size: 16,
			top: 0,

			background: "#5cb85c",
			border: "1px solid #fff",
			borderRadius: "50%",
			px: "auto",

			letterSpacing: "0.03rem",
			fontFamily: "$primary",
			fontStyle: "normal",
			textAlign: "center",
			fontWeight: 500,
			color: "black",
			fontSize: 10,

			"&:before": {
				content: "attr(data-length)",
				position: "absolute",
				right: 2,
				top: 1,
			},
		},
	},

	////////////////////////////////////////////////
	// Tooltip:
	"&:active": {
		"&::before, ::after": {
			visibility: "hidden",
		},
	},

	"&:hover::before": {
		visibility: "visible",

		transition: "all 0.4s 1s ease ",
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
					right: "50%",
					top: "110%",
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

	defaultVariants: {
		"tooltip-side": "bottom",
	},
});

export const Content = styled("div", {
	display: "flex",
	flexDirection: "column",

	border: "1px solid lightgray",
	borderRadius: 5,
	padding: 10,
});

export const TitleAndCancelWrapper = styled("div", {
	position: "relative",
	display: "flex", // row
	justifyContent: "flex-start",
	alignItems: "center",
	marginBottom: 10,
	width: "90%",
	height: 16,

	"& p": {
		color: "$alternative-text",
		ff: "$primary",
		whiteSpace: "nowrap", // keep it one line
		fontSize: "0.9rem",
		ta: "left",

		overflow: "hidden",
		width: "90%",
	},

	button: {
		position: "absolute",
		display: "flex", // row
		justifyContent: "center",
		alignItems: "center",
		right: -21,
		size: 20,

		background: "transparent",
		borderRadius: "50%",
		cursor: "pointer",
		border: "none",

		"&:focus, &:hover": {
			background: "$button-hovered",

			"& svg": {
				fill: "red",
			},
		},
	},
});
