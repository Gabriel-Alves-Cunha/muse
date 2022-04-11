import { MainArea } from "@components";
import { styled } from "@styles/global";

export const MainAreaExtended = styled(MainArea, {
	display: "inline-block",
	justifySelf: "center", // for grid: row
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
		cursor: "pointer",

		"&:hover": {
			transition: "$bgc",
			backgroundColor: "$accent",

			color: "white",
		},
	},

	input: {
		display: "none",
	},
});
