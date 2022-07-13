import {
	ItemIndicator as CtxItemIndicator,
	CheckboxItem as CtxCheckboxItem,
	TriggerItem as CtxTriggerItem,
	RadioItem as CtxRadioItem,
	Separator as CtxSeparator,
	Content as CtxContent,
	Label as CtxLabel,
	Item as CtxItem,
} from "@radix-ui/react-context-menu";

import { styled } from "@styles/global";

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

export const Content = styled(CtxContent, {
	ov: "hidden",
	minWidth: 220,

	bg: "$bg-ctx-menu",
	br: 6,
	p: 5,

	boxShadow: `0px 10px 38px -10px rgba(22, 23, 24, 0.35),
	0px 10px 20px -15px rgba(22, 23, 24, 0.2)`,
});

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

export const itemStyles = styled("div", {
	all: "unset",

	pos: "relative",
	d: "flex",
	alignItems: "center",
	h: 25,

	cursor: "pointer",
	p: "0 5px",
	pl: 25,
	br: 3,

	c: "$ctx-menu-item-text",
	ff: "$secondary",
	ls: "0.03rem",
	fs: 15,
	lh: 1,

	userSelect: "none",

	"&[data-disabled]": {
		c: "$ctx-menu-item-text-disabled",
		pointerEvents: "none",
	},

	"&:focus": { c: "$ctx-menu-item-text-focus", bg: "$ctx-menu-item-bg-focus" },
});

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

export const RightSlot = styled("div", {
	ml: "auto",
	pl: 20,

	c: "$ctx-menu-text",
	ff: "$secondary",
	ls: "0.03rem",
	fs: 15,
	lh: 1,

	":focus > &": { c: "$ctx-menu-item-text-focus" },

	"[data-disabled] &": { c: "$ctx-menu-item-text-disabled" },

	"&#search": { pr: 10, pl: 0, c: "$input-placeholder" },
});

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

export const Item = styled(CtxItem, { ...itemStyles });

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

export const CheckboxItem = styled(CtxCheckboxItem, { ...itemStyles });

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

export const RadioItem = styled(CtxRadioItem, { ...itemStyles });

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

export const TriggerItem = styled(CtxTriggerItem, {
	"&[data-state='open']": { c: "$ctx-menu-item-text", bg: "white" },

	...itemStyles,
});

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

export const Label = styled(CtxLabel, {
	pl: 25,

	c: "$ctx-menu-text",
	ff: "$secondary",
	lh: "25px",
	fs: 12,
});

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

export const Separator = styled(CtxSeparator, {
	bg: "$ctx-menu-separator",
	h: 1,
	m: 5,
});

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

export const ItemIndicator = styled(CtxItemIndicator, {
	pos: "absolute",
	d: "inline-flex",
	justifyContent: "center",
	alignItems: "center",
	left: 0,
	w: 25,
});
