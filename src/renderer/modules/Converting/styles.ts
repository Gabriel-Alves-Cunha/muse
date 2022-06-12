import { Anchor } from "@radix-ui/react-popover";

import { styled } from "@styles/global";

export const ConvertionProgress = styled("div", {
	d: "flex", // row

	whiteSpace: "nowrap", // one line
	c: "$gray-text",
	ff: "$primary",
	fs: "0.85rem",
	ls: "0.03rem",
	ov: "hidden",
	ta: "left",
});

export const PopoverAnchor = styled(Anchor, {
	pos: "relative",
	left: 10,
	t: 10,
});
