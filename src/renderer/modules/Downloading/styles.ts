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
});

export const Popup = styled("div", {
	position: "absolute",
	display: "flex",
	flexDirection: "column",

	transform: "translate(60%, -80%)",

	minHeight: 100,
	gap: "1rem",
	width: 260,
	top: 0,

	overflowY: "1auto",
	borderRadius: 5,
	padding: 20,
	zIndex: 500,

	backgroundColor: "$bg-popover",
	boxShadow: "$small-black",

	/* width */
	"::-webkit-scrollbar": {
		size: 5,
	},

	/* Track */
	"::-webkit-scrollbar-track": {
		background: "$scrollbar",
	},

	/* Handle */
	"::-webkit-scrollbar-thumb": {
		background: "$scrollbar-thumb",
	},

	/* Handle on hover */
	"::-webkit-scrollbar-thumb:hover": {
		background: "$scrollbar-thumb-hover",
	},
});

export const Title = styled("div", {
	display: "flex", // row
	justifyContent: "center",
	alignItems: "center",
	marginBottom: 10,
	height: "1rem",
	width: "100%",

	p: {
		fontFamily: "$primary",
		whiteSpace: "nowrap",
		fontSize: "0.8rem",
		textAlign: "left",
		color: "$text",

		overflow: "hidden",
		width: "90%",
	},

	span: {
		display: "flex", // row
		justifyContent: "center",
		alignItems: "center",
		size: 20,

		backgroundColor: "transparent",
		borderRadius: "50%",
		marginLeft: 10,

		"&:hover": {
			backgroundColor: "rgba(125, 125, 125, 0.3)",
			color: "red",

			"& svg": {
				fill: "red",
			},
		},
	},
});
