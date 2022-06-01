import { Anchor } from "@radix-ui/react-popover";

import { styled } from "@styles/global";

export const ConvertionProgress = styled("div", {
	d: "flex", // row

	ff: "$primary",
	whiteSpace: "nowrap",
	ov: "hidden",
	fs: "0.85rem",
	ta: "left",
	c: "$gray-text",

	gap: 8,

	div: {
		w: 30,
	},

	"td:nth-of-type(2)": {
		borderRight: "1px solid $text",
		// mt: 5,
		w: 15,
	},
});

export const PopoverAnchor = styled(Anchor, {
	pos: "relative",

	left: 10,
	t: 10,
});
