import { styled } from "@styles/global";

export const Wrapper = styled("div", {
	display: "flex", // row
	justifyContent: "center",
	width: "100%",

	div: {
		display: "flex", // row
		justifyContent: "center",
		alignItems: "center",

		marginTop: "2rem",
		padding: "1rem",
		width: 200,
		height: 30,

		letterSpacing: "0.03rem",
		fontFamily: "$primary",
		fontSize: "1.1rem",
		fontWeight: 500,
		color: "$text",

		border: "1px solid $accent",

		"&:hover": {
			transition: "$bgc",
			backgroundColor: "$accent",

			cursor: "pointer",
			color: "white",
		},
	},

	input: {
		display: "none",
	},
});
