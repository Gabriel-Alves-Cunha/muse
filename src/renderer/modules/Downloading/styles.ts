import { styled } from "@styles/global";

export const Wrapper = styled("div", {
	position: "relative",
	display: "flex", // row,
	justifyContent: "center",
	width: "100%",
});

export const Trigger = styled("button", {
	display: "flex", // row
	justifyContent: "center",
	alignItems: "center",

	backgroundColor: "transparent",
	cursor: "pointer",
	border: "none",
	size: 40,

	color: "$deactivated-icon",
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

	"&.has-downloads": {
		position: "relative",
		display: "inline-block",

		i: {
			position: "absolute",
			boxSizing: "content-box",
			right: -5,
			size: 16,
			top: 0,

			backgroundColor: "#5cb85c",
			border: "1px solid #fff",
			borderRadius: "50%",

			letterSpacing: "0.03rem",
			fontFamily: "$primary",
			fontStyle: "normal",
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
});

export const Popup = styled("div", {
	position: "absolute",
	display: "flex",
	flexDirection: "column",

	transform: "translate(60%, -80%)",

	maxHeight: 300,
	minHeight: 100,
	width: 260,
	gap: 16,
	top: 0,

	overflowY: "scroll",
	borderRadius: 5,
	padding: 10,
	zIndex: 500,

	background: "$bg-popover",
	boxShadow: "$popup",

	p: {
		position: "absolute",
		top: "50%", // position the top  edge of the element at the middle of the parent
		left: "50%", // position the left edge of the element at the middle of the parent
		transform: "translate(-50%, -50%)",

		color: "$deactivated-icon",
		letterSpacing: "0.03rem",
		fontFamily: "$secondary",
		textAlign: "center",
		fontSize: "1.05rem",
		fontWeight: 500,
	},

	/* width */
	"&::-webkit-scrollbar": {
		display: "block",
		size: 2,
	},

	/* Track */
	"&::-webkit-scrollbar-track": {
		background: "$scrollbar",
	},

	/* Handle */
	"&::-webkit-scrollbar-thumb": {
		background: "$scrollbar-thumb",
	},

	/* Handle on hover */
	"&::-webkit-scrollbar-thumb:hover": {
		background: "$scrollbar-thumb-hover",
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

	p: {
		color: "$alternative-text",
		fontFamily: "$primary",
		whiteSpace: "nowrap", // keep it one line
		fontSize: "0.9rem",
		textAlign: "left",

		overflow: "hidden",
		width: "100%",
	},

	button: {
		position: "absolute",
		display: "flex", // row
		justifyContent: "center",
		alignItems: "center",
		right: -21,
		size: 20,

		backgroundColor: "transparent",
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
