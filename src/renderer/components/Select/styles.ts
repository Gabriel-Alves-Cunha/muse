import {
	ItemIndicator as RadixItemIndicator,
	Viewport as RadixViewport,
	Content as RadixContent,
	Trigger as RadixTrigger,
	Label as RadixLabel,
	Item as RadixItem,
} from "@radix-ui/react-select";

import { TooltipButton_ } from "@components/TooltipButton";
import { styled } from "@styles/global";

export const Content = styled(RadixContent, {
	bg: "$bg-select",
	ov: "hidden",
	br: 6,

	boxShadow: `0px 10px 38px -10px rgba(22, 23, 24, 0.35),
		0px 10px 20px -15px rgba(22, 23, 24, 0.2)`,
});

export const Trigger = styled(RadixTrigger, {
	...TooltipButton_,
});

export const Viewport = styled(RadixViewport, {
	p: 5,
});

export const Item = styled(RadixItem, {
	all: "unset",

	pos: "relative",
	d: "flex",
	alignItems: "center",
	h: 25,

	p: "0 35px 0 25px",
	br: 3,
	cursor: "pointer",

	c: "$ctx-menu-item-text",
	ls: "0.03rem",
	ff: "$secondary",
	lh: 1,
	fs: 15,

	userSelect: "none",

	"&[data-disabled]": {
		c: "$ctx-menu-item-text-disabled",
		pointerEvents: "none",
	},

	"&:focus": {
		c: "$ctx-menu-item-text-focus",
		bg: "$ctx-menu-item-bg-focus",
	},
});

export const Label = styled(RadixLabel, {
	pl: 25,

	c: "$ctx-menu-text",
	lh: "25px",
	ff: "$secondary",
	fs: 12,
});

export const ItemIndicator = styled(RadixItemIndicator, {
	pos: "absolute",
	d: "inline-flex",
	justifyContent: "center",
	alignItems: "center",
	w: 25,
	left: 0,
});
