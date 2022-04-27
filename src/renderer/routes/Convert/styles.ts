import { styled } from "@styles/global";

export const BorderedButton = styled("button", {
	display: "flex", // row
	justifyContent: "center",
	alignItems: "center",

	marginTop: 40,
	padding: 16,
	width: 200,
	height: 50,
	mx: "auto",

	letterSpacing: "0.03rem",
	fontFamily: "$secondary",
	fontSize: "1.1rem",
	fontWeight: 500,
	color: "$text",

	border: "1px solid $accent",
	background: "transparent",
	cursor: "pointer",
	borderRadius: 7,

	"&:hover": {
		transition: "$bgc",
		backgroundColor: "$accent",

		color: "white",
	},

	input: {
		display: "none",
	},
});
