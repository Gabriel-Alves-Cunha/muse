import { styled } from "@styles/global";

export const Component = styled("div", {
	display: "flex", // row,
	alignItems: "center",
	width: "100%",
	height: 15,

	"& svg": {
		margin: "auto",
	},
});

export const Bar = styled("progress", {
	appearance: "none",
	border: "none",

	transition: "width 0.3s linear",
	width: "90%",
	height: 3,

	"&[value]::-webkit-progress-value": {
		backgroundColor: "$accent",
	},

	"&[value]::-webkit-progress-bar": {
		backgroundColor: "#a8a8a880",
	},
});
