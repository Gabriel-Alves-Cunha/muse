import { styled } from "@styles/global";

export const Box = styled("div", { dflex: "center", mt: 30 });

export const OpenFilePickerButton = styled("button", {
	dflex: "center",
	w: 300,
	h: 50,

	m: "40 auto 0",
	gap: 16,
	p: 16,

	ff: "$secondary",
	ls: "0.03rem",
	fs: "1.1rem",
	c: "$text",
	fw: 500,

	b: "2px solid $accent",
	cursor: "pointer",
	bg: "none",
	br: 7,

	"&:hover": { bg: "$accent", c: "white" },

	input: { d: "none" },
});
