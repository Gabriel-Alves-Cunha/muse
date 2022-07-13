import { styled } from "@styles/global";

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

export const Component = styled("div", {
	d: "flex", // row,
	alignItems: "center",
	w: "98%",
	h: 15,

	"& svg": { ml: 9, fill: "$text" },
});

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

export const Bar = styled("progress", {
	appearance: "none",
	b: "none",

	transition: "width 0.3s linear",
	w: 188,
	h: 3,

	"&[value]::-webkit-progress-value": { bg: "$accent" },

	"&[value]::-webkit-progress-bar": { bg: "#a8a8a880" },
});
