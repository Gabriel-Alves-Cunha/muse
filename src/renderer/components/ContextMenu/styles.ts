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

export const Content = styled(CtxContent, {
	overflow: "hidden",
	minWidth: 220,

	background: "$bg-ctx-menu",
	borderRadius: 6,
	padding: 5,

	boxShadow: `0px 10px 38px -10px rgba(22, 23, 24, 0.35),
	0px 10px 20px -15px rgba(22, 23, 24, 0.2)`,
});

export const itemStyles = styled("div", {
	all: "unset",

	position: "relative",
	display: "flex",
	alignItems: "center",
	height: 25,

	padding: "0 5px",
	borderRadius: 3,
	pl: 25,

	color: "$ctx-menu-item-text",
	letterSpacing: "0.03rem",
	ff: "$secondary",
	lineHeight: 1,
	fontSize: 15,

	userSelect: "none",

	"&[data-disabled]": {
		color: "$ctx-menu-item-text-disabled",
		pointerEvents: "none",
	},

	"&:focus": {
		color: "$ctx-menu-item-text-focus",
		background: "$ctx-menu-item-bg-focus",
	},
});

export const RightSlot = styled("div", {
	ml: "auto",
	pl: 20,

	color: "$ctx-menu-text",

	":focus > &": { color: "$ctx-menu-item-text-focus" },

	"[data-disabled] &": {
		color: "$ctx-menu-item-text-disabled",
	},
});

export const Item = styled(CtxItem, { ...itemStyles });

export const CheckboxItem = styled(CtxCheckboxItem, {
	...itemStyles,
});

export const RadioItem = styled(CtxRadioItem, {
	...itemStyles,
});

export const TriggerItem = styled(CtxTriggerItem, {
	"&[data-state='open']": {
		color: "$ctx-menu-item-text",
		// TODO: maybe this is $bg-popover:
		background: "white",
	},

	...itemStyles,
});

export const Label = styled(CtxLabel, {
	pl: 25,

	color: "$ctx-menu-text",
	lineHeight: "25px",
	ff: "$secondary",
	fontSize: 12,
});

export const Separator = styled(CtxSeparator, {
	background: "$ctx-menu-separator",
	height: 1,
	margin: 5,
});

export const ItemIndicator = styled(CtxItemIndicator, {
	position: "absolute",
	display: "inline-flex",
	justifyContent: "center",
	alignItems: "center",
	width: 25,
	left: 0,
});
