import { styled } from "@styles/global";

import { color } from "@styles/theme";

export const Wrapper = styled("div", {
	display: "flex",
	justifyContent: "center",
	width: "100%",

	div: {
		display: "flex",
		justifyContent: "center",
		alignItems: "center",

		marginTop: "2rem",
		padding: "1rem",
		width: 200,
		height: 30,

		letterSpacing: "$letterSpacing",
		fontFamily: "$fontFamily",
		color: color("text"),
		fontSize: "1.1rem",
		fontWeight: 500,

		border: `1px solid ${color("navButtonHoveredColor")}`,

		"&:hover": {
			backgroundColor: color("navButtonHoveredColor"),
			transition: "background-color 0.15s ease-in-out",
			cursor: "pointer",
			color: "white",
		},
	},

	input: {
		display: "none",
	},
});
