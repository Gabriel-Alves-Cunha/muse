import { styled } from "@styles/global";

export const ConvertionProgress = styled("div", {
	display: "flex", // row

	fontFamily: "$primary",
	whiteSpace: "nowrap",
	overflow: "hidden",
	fontSize: "0.85rem",
	textAlign: "left",
	color: "$gray-text",

	gap: 8,

	div: {
		width: 30,
	},

	"td:nth-of-type(2)": {
		borderRight: "1px solid $text",
		// mt: 5,
		width: 15,
	},
});
