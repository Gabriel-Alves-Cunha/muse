import { Trigger } from "@radix-ui/react-popover";

import { styled } from "@styles/global";

export const StyledPopoverTrigger = styled(Trigger, {
	pos: "relative",
	dflex: "center",
	size: 40,

	bg: "transparent",
	cursor: "pointer",
	b: "none",

	c: "$deactivated-icon",
	fs: "1rem",

	"&:hover": {
		c: "$active-icon",
	},

	"&.has-items": {
		pos: "relative",
		d: "inline-block",

		i: {
			pos: "absolute",
			boxSizing: "content-box",
			w: "100%",
			size: 16,
			r: -5,
			t: 0,

			b: "1px solid #fff",
			bg: "#5cb85c",
			px: "auto",
			br: "50%",

			fontStyle: "normal",
			ff: "$primary",
			ls: "0.03rem",
			ta: "center",
			c: "black",
			fw: 500,
			fs: 10,

			"&:before": {
				content: "attr(data-length)",
				pos: "absolute",
				r: 2,
				t: 1,
			},
		},
	},

	////////////////////////////////////////////////
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

		b: "1px solid white",
		bg: "#181818",
		p: "3px 8px",
		zIndex: 100,

		whiteSpace: "nowrap",
		ff: "$primary",
		lh: "normal",
		ta: "center",
		fs: "1rem",
		c: "#fff",
		fw: 500,

		pointerEvents: "none",
	},

	variants: {
		"tooltip-side": {
			"left-bottom": {
				"&::before, ::after": {
					r: "50%",
					t: "110%",
				},
			},
			bottom: {
				"&::before, ::after": {
					t: "110%",
				},
			},
			right: {
				"&::before, ::after": {
					l: "110%",
				},
			},
			left: {
				"&::before, ::after": {
					r: "110%",
				},
			},
			top: {
				"&::before, ::after": {
					bottom: "110%",
				},
			},
		},
	},

	defaultVariants: {
		"tooltip-side": "bottom",
	},
});

export const Content = styled("div", {
	d: "flex",
	fd: "column",

	b: "1px solid lightgray",
	br: 5,
	p: 10,
});

export const TitleAndCancelWrapper = styled("div", {
	pos: "relative",
	d: "flex", // row
	justifyContent: "flex-start",
	alignItems: "center",
	w: "90%",
	h: 16,

	mb: 10,

	"& p": {
		c: "$alternative-text",
		whiteSpace: "nowrap", // keep it one line
		ff: "$primary",
		fs: "0.9rem",
		ta: "left",

		ov: "hidden",
		w: "90%",
	},

	button: {
		pos: "absolute",
		dflex: "center",
		size: 20,
		r: -21,

		bg: "transparent",
		cursor: "pointer",
		br: "50%",
		b: "none",

		"&:focus, &:hover": {
			bg: "$button-hovered",

			"& svg": {
				fill: "red",
			},
		},
	},
});
