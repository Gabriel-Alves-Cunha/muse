import { Anchor, Close, Content } from "@radix-ui/react-popover";

import { styled } from "@styles/global";
import {
	slideRightAndFade,
	slideDownAndFade,
	slideLeftAndFade,
	slideUpAndFade,
} from "@components/Popover/styles";

export const Canvas = styled("canvas", { size: 400 });

export const PopoverAnchor = styled(Anchor, {
	pos: "relative",
	left: 10,
	t: 10,
});

export const ClosePopoverTrigger = styled(Close, {
	all: "unset",

	pos: "absolute",
	dflex: "center",
	size: 26,
	r: 10,
	t: 10,

	cursor: "pointer",
	p: "0 15px",
	b: "none",
	br: "50%",

	ff: "$secondary",
	ls: "0.04rem",
	fs: "1rem",
	fw: 600,
	lh: 1,

	"& svg": { fill: "$accent-light" },

	"&:hover": { bg: "$icon-button-hovered" },
});

export const PopoverContent = styled(Content, {
	pos: "relative", // to the popover anchor
	dflex: "center",

	bg: "$bg-popover",
	ox: "hidden",
	br: 10,
	p: 10,

	boxShadow: "$popover",

	"@media (prefers-reduced-motion: no-preference)": {
		animationTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
		animationFillMode: "forwards",
		animationDuration: "400ms",

		"&[data-state='open']": {
			"&[data-side='right']": { animationName: slideLeftAndFade },
			"&[data-side='left']": { animationName: slideRightAndFade },
			"&[data-side='bottom']": { animationName: slideUpAndFade },
			"&[data-side='top']": { animationName: slideDownAndFade },
		},
	},

	"& p": {
		pos: "relative",

		// Center:
		t: "50%", // position the top  edge of the element at the middle of the parent
		l: "50%", // position the left edge of the element at the middle of the parent
		transform: "translate(-50%, -50%)",

		c: "$deactivated-icon",
		ff: "$secondary",
		ls: "0.03rem",
		fs: "1.05rem",
		ta: "center",
		fw: 500,
	},

	"&:focus": { boxShadow: "$popover", outline: "none" },
});
