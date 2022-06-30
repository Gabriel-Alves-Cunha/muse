import { slideRightAndFade } from "@components/Popover/styles";
import { styled } from "@styles/global";

export const Canvas = styled("canvas", { size: 300 });

export const ClosePopoverTrigger = styled("button", {
	pos: "absolute",
	dflex: "center",
	size: 26,
	r: 1,
	t: 1,

	cursor: "pointer",
	bg: "none",
	b: "none",
	br: "50%",

	ff: "$secondary",
	ls: "0.04rem",
	fs: "1rem",
	fw: 600,
	lh: 1,

	"& svg": { fill: "red" },

	"&:hover": { bg: "rgba(0, 0, 0, 0.2)" },
});

export const PopoverContent = styled("div", {
	pos: "fixed",
	dflex: "center",
	bottom: 10,
	left: 10,

	boxShadow: "$popover",
	bg: "$bg-popover",
	ox: "hidden",
	zIndex: 200,
	br: 13,

	animationTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
	animationFillMode: "forwards",
	animationDuration: "400ms",

	"&[data-open='true']": {
		"&[data-side='left']": { animationName: slideRightAndFade },
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
