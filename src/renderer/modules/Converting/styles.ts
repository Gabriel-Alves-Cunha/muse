import { styled } from "@styles/global";

import { theme } from "@styles/theme";

export const Circle = styled("div", {
	display: "flex",
	justifyContent: "center",
	alignItems: "center",
	position: "absolute",

	cursor: "pointer",
	bottom: "27vh",
	zIndex: 50,
	left: 10,

	borderRadius: 20,
	height: 40,
	width: 40,

	backgroundColor: theme.colors.bgNav,
	boxShadow: "$theme.shadows.small.value",

	"&:hover": {
		transition: "opacity 0s ease-in-out 17ms",
		boxShadow: "$theme.shadows.insetSmall.value",
	},
});

export const Popup = styled("div", {
	position: "absolute",
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

	backgroundColor: theme.colors.bgCentral,
	boxShadow: "$theme.shadows.small.value",

	/* width */
	"&::-webkit-scrollbar": {
		width: 5,
	},

	/* Track */
	"&::-webkit-scrollbar-track": {
		background: "#f1f1f1",
	},

	/* Handle */
	"&::-webkit-scrollbar-thumb": {
		background: "#888",
	},

	/* Handle on hover */
	"&::-webkit-scrollbar-thumb:hover": {
		background: "#555",
	},
});

export const Progress = styled("div", {
	fontFamily: "$theme.fonts.fontFamily.value",
	color: theme.colors.text,
	whiteSpace: "nowrap",
	overflow: "hidden",
	fontSize: "0.9rem",
	textAlign: "left",
	gap: "0.5rem",

	table: {
		display: "flex",
		justifyContent: "1fr",
		width: "100%",
	},

	"td:nth-of-type(2)": {
		borderRight: `1px solid ${theme.colors.text}`,
		paddingRight: 5,
		width: "100%",
	},
});

export const Title = styled("div", {
	display: "flex",
	justifyContent: "center",
	alignItems: "center",
	marginBottom: 10,
	height: "1rem",
	width: "100%",

	p: {
		fontFamily: "$theme.fonts.fontFamily.value",
		whiteSpace: "nowrap",
		overflow: "hidden",
		fontSize: "0.9rem",
		textAlign: "left",
		color: "#777",

		width: "90%",
	},

	span: {
		display: "flex",
		justifyContent: "center",
		alignItems: "center",
		height: 20,
		width: 20,

		backgroundColor: "transparent",
		borderRadius: "50%",
		marginLeft: 10,

		"&:hover": {
			backgroundColor: "rgba(125, 125, 125, 0.3)",
			color: "red",

			svg: {
				fill: "red",
			},
		},
	},
});
