import { Anchor } from "@radix-ui/react-popover";

import { styled } from "@styles/global";

export const ConvertionProgress = styled("div", {
	d: "flex", // row
	justifyContent: "space-between",

	whiteSpace: "nowrap", // one line
	c: "$gray-text",
	ff: "$primary",
	fs: "0.85rem",
	ls: "0.03rem",
	ov: "hidden",
	ta: "left",

	span: { c: "white", mr: 4 },
});

export const PopoverAnchor = styled(Anchor, {
	pos: "relative",
	left: 10,
	t: 10,
});

export const CancelButton = styled("button", {
	pos: "absolute",
	dflex: "center",
	size: 20,
	r: -19,

	cursor: "pointer",
	bg: "none",
	br: "50%",
	b: "none",

	"&:focus, &:hover": { bg: "$icon-button-hovered" },

	"& svg": { fill: "$text" },
});
