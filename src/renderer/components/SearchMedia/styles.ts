import { Anchor, Trigger } from "@radix-ui/react-popover";

import { styled } from "@styles/global";

export const SearchWrapper = styled("div", {
	pos: "relative",
	d: "flex", // row,
	justifyContent: "flex-start",
	alignItems: "center",

	w: 300,
	h: 40,

	b: "2px solid $input-border",
	bg: "transparent",
	br: "0.75rem",
	cursor: "default",

	transition: "all ease 250ms",

	"&:hover, &:focus-within": {
		transition: "all ease 250ms",

		borderColor: "$input-border-active",

		"& svg": {
			c: "$input-border-active",
		},

		"& label": {
			t: "-180%",
			left: -30,

			c: "$input-border-active",
			cursor: "default",
		},
	},

	"& svg": {
		c: "$input-border",
		cursor: "default",
		strokeWidth: 30,
		mx: 10,
	},

	label: {
		pos: "absolute",
		d: "flex", // row
		alignItems: "center",
		h: "2.5rem",
		w: 250,
		bottom: 0,
		r: 0,
		left: 30,
		t: 0,

		cursor: "text",
		margin: "auto",
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
	},

	input: {
		boxSizing: "border-box",
		size: "100%",

		c: "$input-text",
		whiteSpace: "nowrap",
		ff: "$secondary",
		ls: "0.045rem",
		fs: "0.9rem",
		fw: 400,
		lh: 1.5,

		bg: "transparent",
		b: "none",
	},
});

export const Info = styled("div", {
	d: "flex",
	fd: "column",
	justifyContent: "flex-start",
	alignItems: "flex-start",

	size: "calc(100% - 5px)",
	ov: "hidden",
});

export const Title = styled("p", {
	ml: 5,

	c: "$alternative-text",
	textOverflow: "ellipsis",
	ls: "0.03rem",
	ff: "$secondary",
	whiteSpace: "nowrap", // make it one-line.
	ta: "left",
	fs: "1rem",
	fw: 500,
});

export const SubTitle = styled("p", {
	ml: 5,

	ls: "0.03rem",
	ff: "$primary",
	c: "$gray-text",
	fs: "0.8rem",
	fw: 500,
});

export const Highlight = styled("span", {
	bg: "yellowgreen",
	c: "white",
});

export const SearchMediaPopoverAnchor = styled(Anchor, {
	pos: "absolute",
	left: "50%",
	t: 30,
});

export const Result = styled("div", {
	pos: "relative",
	d: "flex", // row
	justifyContent: "flex-start",
	w: "100%",
	h: 60,

	b: "1px solid $gray-text",
	bg: "$bg-media",
	cursor: "pointer",
	br: 7,
	p: 7,

	"&:hover": {
		transition: "all 100ms ease-in-out",
		borderColor: "$text",
	},

	////////////////////////////////////////
	// Tooltip:
	"&:active": {
		"&::before, ::after": {
			visibility: "hidden",
		},
	},

	"&:hover::before": {
		visibility: "visible",

		transition: "all 0.4s 1s ease ",
	},

	"&::before, ::after": {
		visibility: "hidden",

		content: "attr(data-tooltip)",
		pos: "absolute",
		h: "auto",
		w: "auto",

		t: "110%",
		left: "30%",

		b: "1px solid white",
		bg: "#181818",
		p: "3px 8px",
		zIndex: 100,

		whiteSpace: "nowrap",
		lh: "normal",
		ff: "$primary",
		c: "#fff",
		ta: "center",
		fs: "1rem",
		fw: 500,

		pointerEvents: "none",
	},
});

export const NothingFound = styled("div", {
	d: "flex", // row,
	justifyContent: "center",
	alignItems: "center",

	c: "$deactivated-icon",
	ls: "0.03rem",
	ff: "$secondary",
	ta: "center",
	fs: "1.05rem",
	fw: 500,
});

export const HiddenPopoverTrigger = styled(Trigger, {
	d: "none",
});
