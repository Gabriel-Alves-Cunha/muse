import { Anchor } from "@radix-ui/react-popover";

import { styled } from "@styles/global";

export const ConvertionProgress = styled("div", {
	display: "flex", // row

	ff: "$primary",
	whiteSpace: "nowrap",
	overflow: "hidden",
	fontSize: "0.85rem",
	ta: "left",
	color: "$gray-text",

	gap: 8,

	div: {
		width: 30,
	},

	"td:nth-of-type(2)": {
		borderRight: "1px solid $text",
		// mt: 5,
		width: 15,
	},
});

export const PopoverAnchor = styled(Anchor, {
	position: "relative",

	left: 10,
	top: 10,
});
