import { styled } from "@styles/global";

export const Dots = styled("div", {
	position: "relative",
	background: "gray",
	height: 3,
	width: 3,

	"&::before": {
		content: "",
		position: "absolute",
		height: 3,
		width: 3,
		top: -6,
		left: 0,

		background: "gray",
	},

	"&::after": {
		content: "",
		position: "absolute",
		height: 3,
		width: 3,
		left: 0,
		top: 6,

		background: "gray",
	},
});
