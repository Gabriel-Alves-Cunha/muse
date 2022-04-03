import { styled } from "@styles/global";

export const Circle = styled("div", {
	// position: "absolute",
	display: "flex", // row
	justifyContent: "center",
	alignItems: "center",

	cursor: "pointer",
	bottom: "27vh",
	zIndex: 50,
	left: 10,

	backgroundColor: "$bg-main",
	borderRadius: 20,
	size: 40,

	"&:hover": {
		transition: "$scale",
		transform: "scale(1.1)",
	},
});

export const Popup = styled("div", {
	// position: "absolute",
	display: "flex",
	flexDirection: "column",
	bottom: "27vh",
	gap: "1rem",
	height: 100,
	width: 250,
	left: 10,

	overflowX: "hidden",
	overflowY: "auto",
	borderRadius: 20,
	padding: "1rem",
	zIndex: 500,

	backgroundColor: "$bg-main",
	boxShadow: "$small",

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

export const Progress = styled("div", {
	fontFamily: "$primary",
	whiteSpace: "nowrap",
	overflow: "hidden",
	fontSize: "0.9rem",
	textAlign: "left",
	color: "$text",

	gap: "0.5rem",

	table: {
		display: "flex", // row
		justifyContent: "1fr",
		width: "100%",
	},

	"td:nth-of-type(2)": {
		borderRight: "1px solid $text",
		paddingRight: 5,
		width: "100%",
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
		overflow: "hidden",
		fontSize: "0.9rem",
		textAlign: "left",
		color: "$text",

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
