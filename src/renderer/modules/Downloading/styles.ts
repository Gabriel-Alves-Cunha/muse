import { styled } from "@styles/global";

import { theme } from "@styles/theme";

export const Circle = styled("div", {
	display: "flex",
	justifyContent: "center",
	alignItems: "center",
	position: "absolute",

	cursor: "pointer",
	bottom: "20vh",
	zIndex: 50,
	left: 10,

	borderRadius: 20,
	height: 40,
	width: 40,

	backgroundColor: theme.colors.bgNav,
	boxShadow: "$small",

	"&:hover": {
		transition: "opacity 0s ease-in-out 17ms",
		boxShadow: "$insetSmall",
	},
});

export const Popup = styled("div", {
	position: "absolute",
	display: "flex",
	flexDirection: "column",
	bottom: "20vh",
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
	boxShadow: "$small",

	/* width */
	"::-webkit-scrollbar": {
		height: 5,
		width: 5,
	},

	/* Track */
	"::-webkit-scrollbar-track": {
		background: "#f1f1f1",
	},

	/* Handle */
	"::-webkit-scrollbar-thumb": {
		background: "#888",
	},

	/* Handle on hover */
	"::-webkit-scrollbar-thumb:hover": {
		background: "#555",
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
		fontFamily: "$fontFamily",
		whiteSpace: "nowrap",
		fontSize: "0.8rem",
		textAlign: "left",
		color: "#777",

		overflow: "hidden",
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

			"& svg": {
				fill: "red",
			},
		},
	},
});
