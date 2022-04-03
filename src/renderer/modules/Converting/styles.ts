import { styled } from "@styles/global";

export const ConvertionProgress = styled("div", {
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
