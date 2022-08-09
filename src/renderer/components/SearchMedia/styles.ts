import { Anchor, Trigger } from "@radix-ui/react-popover";

import { styled } from "@styles/global";

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Constants:

const height = "40px";

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

export const SearchWrapper = styled("div", {
	pos: "relative",
	d: "flex", // row,
	justifyContent: "flex-start",
	alignItems: "center",
	w: 300,
	height,

	b: "2px solid $input-border",
	cursor: "default",
	br: "0.75rem",
	bg: "none",

	transition: "all ease 250ms",

	"&:hover, &:focus-within, &:focus": {
		transition: "all ease 250ms",

		borderColor: "$input-border-active",

		"& svg": { c: "$input-border-active" },

		"& label": {
			t: "-180%",
			l: -30,

			c: "$input-border-active",
			cursor: "default",
		},
	},

	"& > svg": { c: "$input-border", cursor: "default", ml: 10 },

	label: {
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
	},

	input: {
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
	},
});

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

export const Info = styled("div", {
	dcolumn: "flex-start",
	justifyContent: "center",
	size: "calc(100% - 5px)",

	ov: "hidden",
});

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

export const Title = styled("p", {
	ml: 5,

	textOverflow: "ellipsis",
	c: "$alternative-text",
	whiteSpace: "nowrap", // make it one-line.
	ff: "$secondary",
	ls: "0.03rem",
	ta: "left",
	fs: "1rem",
	fw: 500,
});

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

export const SubTitle = styled("p", {
	ml: 5,

	c: "$gray-text",
	ff: "$primary",
	ls: "0.035rem",
	fs: "0.8rem",
	fw: 500,
});

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

export const Highlight = styled("span", { bg: "$bg-highlight", c: "white" });

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

export const NothingFound = styled("div", {
	dflex: "center",

	c: "$deactivated-icon",
	ff: "$secondary",
	ls: "0.03rem",
	fs: "1.05rem",
	ta: "center",
	fw: 500,
});

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

export const HiddenPopoverTrigger = styled(Trigger, { d: "none" });
