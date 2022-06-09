import { Anchor } from "@radix-ui/react-popover";

import { styled } from "@styles/global";

export const ConvertionProgress = styled("div", {
	d: "flex", // row

	whiteSpace: "nowrap",
	c: "$gray-text",
	ff: "$primary",
	fs: "0.85rem",
	ov: "hidden",
	ta: "left",

	gap: 8,

	div: { w: 30 },

	"td:nth-of-type(2)": { borderRight: "1px solid $text", w: 15 },
});

export const PopoverAnchor = styled(Anchor, {
	pos: "relative",
	left: 10,
	t: 10,
});
