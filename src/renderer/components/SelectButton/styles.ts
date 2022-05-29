import {
	ItemIndicator as RadixItemIndicator,
	Viewport as RadixViewport,
	Content as RadixContent,
	Trigger as RadixTrigger,
	Label as RadixLabel,
	Item as RadixItem,
} from "@radix-ui/react-select";

import { styled } from "@styles/global";

export const Box = styled("div", {});

export const Content = styled(RadixContent, {
	background: "white",
	overflow: "hidden",
	borderRadius: 6,

	boxShadow:
		"0px 10px 38px -10px rgba(22, 23, 24, 0.35), 0px 10px 20px -15px rgba(22, 23, 24, 0.2)",
});

export const Trigger = styled(RadixTrigger, {
	all: "unset",

	display: "inline-flex",
	justifyContent: "center",
	alignItems: "center",
	height: 35,

	background: "white",
	padding: "0 15px",
	borderRadius: 4,
	gap: 5,

	color: "violet",
	lineHeight: 1,
	fontSize: 13,

	boxShadow: `0 2px 10px ${"black"}`,

	"&:hover": { backgroundColor: "mauve" },

	"&:focus": { boxShadow: "0 0 0 2px black" },
});

export const Viewport = styled(RadixViewport, {
	padding: 5,
});

export const Item = styled(RadixItem, {
	all: "unset",

	display: "flex",
	position: "relative",
	alignItems: "center",
	height: 25,

	padding: "0 35px 0 25px",
	userSelect: "none",
	borderRadius: 3,

	color: "violet",
	lineHeight: 1,
	fontSize: 13,

	"&[data-disabled]": {
		pointerEvents: "none",
		color: "mauve",
	},

	"&:focus": {
		backgroundColor: "violet",
		color: "violet",
	},
});

export const Label = styled(RadixLabel, {
	padding: "0 25px",
	fontSize: 12,
	lineHeight: "25px",
	color: "mauve",
});

export const ItemIndicator = styled(RadixItemIndicator, {
	position: "absolute",
	display: "inline-flex",
	justifyContent: "center",
	alignItems: "center",
	width: 25,
	left: 0,
});
