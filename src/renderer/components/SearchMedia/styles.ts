import { Anchor, Trigger } from "@radix-ui/react-popover";

const height = "40px";

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

const hover_focus_within_focus = {
	transition: "all ease 250ms",

	borderColor: "$input-border-active",

	"& svg": { c: "$input-border-active" },

	"& label": {
		t: "-180%",
		l: -30,

		c: "$input-border-active",
		cursor: "default",
	},
};

const svg = { c: "$input-border", cursor: "default", ml: 10 };

const label = {
	pos: "absolute",
	d: "flex", // row
	alignItems: "center",
	width: "85%",
	height,

	l: 10 + 18,
	bottom: 0,
	r: 0,
	t: 0,

	m: "auto",
	p: 0,

	c: "$input-placeholder",
	whiteSpace: "nowrap",
	ff: "$secondary",
	ls: "0.04rem",
	fs: "1rem",
	fw: 400,
	lh: 1.5,

	transitionProperty: "color, top, left",
	transitionTimingFunction: "ease",
	transitionDuration: "250ms",
	transitionDelay: 0,

	"&.active": {
		t: "-180%",
		l: -30,

		c: "$input-border-active",
		cursor: "default",
	},
};

const input = {
	pos: "absolute",
	d: "flex", // row
	alignItems: "center",
	flex: 1, // occupy all remaining width
	height: `calc(${height} - 2 * 2px)`, // 2px = border

	l: 10 + 18 + 10,
	bottom: 0,
	r: 0,
	t: 0,

	whiteSpace: "nowrap",
	c: "$input-text",
	ff: "$primary",
	cursor: "text",
	ls: "0.045rem",
	fs: "1rem",
	fw: 500,
	lh: 1.5,

	outline: "none",
	bg: "none",
	b: "none",
};

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

export const SubTitle = styled("p", {
	pl: 5,

	c: "$gray-text",
	ff: "$primary",
	ls: "0.035rem",
	fs: "0.8rem",
	fw: 500,
});

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

export const SearchMediaPopoverAnchor = styled(Anchor, {
	pos: "absolute",
	// Tried to center it relative to the search input:
	l: "17.1%",
	t: 40,
});

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

export const HiddenPopoverTrigger = styled(Trigger, { d: "none" });
