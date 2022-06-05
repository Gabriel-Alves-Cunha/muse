import { Trigger } from "@radix-ui/react-dialog";

import { styled } from "@styles/global";

export const ErrorMsg = styled("pre", {
	margin: "20px 0",

	ff: "$secondary",
	ls: "0.035rem",
	fs: "0.8rem",
	c: "red",
	fw: 500,
});

export const Center = styled("div", {
	pos: "relative",
	dcolumn: "center",
});

export const TriggerOptions = styled(Trigger, {
	pos: "relative",
	d: "flex", // row
	justifyContent: "center",
	alignItems: "center",

	c: "$deactivated-icon",
	cursor: "pointer",
	bg: "none",
	br: "50%",
	b: "none",
	m: 5,

	transition: "$bgc",

	"&:hover": {
		transition: "$bgc",
		bg: "$icon-button-hovered",
	},

	// Hack to make the height the same size as the width:
	"&::before": {
		content: "",
		float: "left",
		pt: "100%", // ratio of 1:1
	},
});
