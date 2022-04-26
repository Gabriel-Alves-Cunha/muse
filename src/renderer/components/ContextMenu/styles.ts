import {
	CheckboxItem,
	ItemIndicator,
	TriggerItem,
	RadioItem,
	Separator,
	Content,
	Label,
	Item,
} from "@radix-ui/react-context-menu";

import { styled } from "@styles/global";

export const Box = styled("div", {});

export const StyledContent = styled(Content, {
	overflow: "hidden",
	minWidth: 220,

	backgroundColor: "white",
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
	fontFamily: "$secondary",
	lineHeight: 1,
	fontSize: 15,

	userSelect: "none",

	"&[data-disabled]": {
		color: "$ctx-menu-item-text-disabled",
		pointerEvents: "none",
	},

	"&:focus": {
		color: "$ctx-menu-item-text-focus",
		backgroundColor: "#6c56d0",
	},
});

console.log({ itemStyles });

export const RightSlot = styled("div", {
	ml: "auto",
	pl: 20,

	color: "$ctx-menu-text",

	":focus > &": { color: "$ctx-menu-item-text-focus" },

	"[data-disabled] &": {
		color: "$ctx-menu-item-text-disabled",
	},
});

export const StyledItem = styled(Item, { ...itemStyles });

export const StyledCheckboxItem = styled(CheckboxItem, {
	...itemStyles,
});

export const StyledRadioItem = styled(RadioItem, {
	...itemStyles,
});

export const StyledTriggerItem = styled(TriggerItem, {
	"&[data-state='open']": {
		color: "$ctx-menu-item-text",
		backgroundColor: "white",
	},

	...itemStyles,
});

export const StyledLabel = styled(Label, {
	pl: 25,

	fontFamily: "$secondary",
	color: "$ctx-menu-text",
	lineHeight: "25px",
	fontSize: 12,
});

export const StyledSeparator = styled(Separator, {
	backgroundColor: "$ctx-menu-separator",
	height: 1,
	margin: 5,
});

export const StyledItemIndicator = styled(ItemIndicator, {
	position: "absolute",
	display: "inline-flex",
	justifyContent: "center",
	alignItems: "center",
	width: 25,
	left: 0,
});
