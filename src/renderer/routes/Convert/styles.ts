import { styled } from "@styles/global";

export const BorderedButton = styled("button", {
	d: "flex", // row
	justifyContent: "center",
	alignItems: "center",

	mt: 40,
	p: 16,
	w: 200,
	h: 50,
	mx: "auto",

	ls: "0.03rem",
	ff: "$secondary",
	fs: "1.1rem",
	fw: 500,
	c: "$text",

	b: "1px solid $accent",
	bg: "transparent",
	cursor: "pointer",
	br: 7,

	"&:hover": {
		transition: "$bgc",
		bg: "$accent",

		c: "white",
	},

	input: {
		d: "none",
	},
});
