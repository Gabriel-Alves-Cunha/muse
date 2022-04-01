import { styled } from "@styles/global";
import { color } from "@styles/theme";

export const Bar = styled("progress", {
	appearance: "none",
	border: "none",

	transition: "width 0.3s linear",
	width: "92%",
	height: 3,

	"&[value]::-webkit-progress-value": {
		backgroundColor: color("accent"),
	},

	"&[value]::-webkit-progress-bar": {
		backgroundColor: "#a8a8a880",
	},
});

export const Component = styled("div", {
	display: "flex", // row,
	width: "100%",
	height: 15,

	alignItems: "center",

	"& svg": {
		margin: "auto",
	},
});
