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
	background: "$bg-select",
	overflow: "hidden",
	borderRadius: 6,

	boxShadow: `0px 10px 38px -10px rgba(22, 23, 24, 0.35),
		0px 10px 20px -15px rgba(22, 23, 24, 0.2)`,
});

export const Trigger = styled(RadixTrigger, {
	...TooltipButton_,
});

export const Viewport = styled(RadixViewport, {
	padding: 5,
});

export const Item = styled(RadixItem, {
	all: "unset",

	position: "relative",
	display: "flex",
	alignItems: "center",
	height: 25,

	padding: "0 35px 0 25px",
	borderRadius: 3,
	cursor: "pointer",

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

export const Label = styled(RadixLabel, {
	pl: 25,

	color: "$ctx-menu-text",
	lineHeight: "25px",
	ff: "$secondary",
	fontSize: 12,
});

export const ItemIndicator = styled(RadixItemIndicator, {
	position: "absolute",
	display: "inline-flex",
	justifyContent: "center",
	alignItems: "center",
	width: 25,
	left: 0,
});
