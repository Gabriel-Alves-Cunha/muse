import { styled } from "@styles/global";

export const BorderedButton = styled("button", {
	dflex: "center",
	w: 200,
	h: 50,

	m: "40 auto 0",
	p: 16,

	ff: "$secondary",
	ls: "0.03rem",
	fs: "1.1rem",
	c: "$text",
	fw: 500,

	b: "1px solid $accent",
	cursor: "pointer",
	bg: "none",
	br: 7,

	"&:hover": { transition: "$bgc", bg: "$accent", c: "white" },

	input: { d: "none" },
});
