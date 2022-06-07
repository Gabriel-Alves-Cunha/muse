import { Trigger } from "@radix-ui/react-popover";

import { keyframes, styled } from "@styles/global";

export const StyledPopoverTrigger = styled(Trigger, {
	pos: "relative",
	dflex: "center",
	size: 40,

	cursor: "pointer",
	bg: "none",
	b: "none",

	c: "$deactivated-icon",
	fs: "1rem",

	"&:hover": {
		c: "$active-icon",
	},

	"&.has-items": {
		"& p": {
			// I can't get this shit to center properly
			boxSizing: "border-box",
			pos: "absolute",
			display: "flex",
			alignItems: "center",
			size: 18,
			r: -8,
			t: 0,

			b: "1px solid #fff",
			bg: "#5cb85c",
			br: "50%",

			"&::before": {
				content: "attr(data-length)",
				pos: "relative",
				dflex: "center",
				size: "100%",

				fontStyle: "normal",
				ff: "'Assistant'",
				ls: "0.03rem",
				c: "black",
				fw: 500,
				fs: 11,
			},
		},
	},

	////////////////////////////////////////////////
	// Tooltip:
	"&:active": {
		"&::before, &::after": {
			visibility: "hidden",
		},
	},

	"&:hover::before": {
		visibility: "visible",

		transition: "all 0.4s 1s ease ",
	},

	"&::before, &::after": {
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
				"&::before, &::after": {
					r: "50%",
					t: "110%",
				},
			},
			bottom: {
				"&::before, &::after": {
					t: "110%",
				},
			},
			right: {
				"&::before, &::after": {
					l: "110%",
				},
			},
			left: {
				"&::before, &::after": {
					r: "110%",
				},
			},
			top: {
				"&::before, &::after": {
					bottom: "110%",
				},
			},
		},
	},

	defaultVariants: {
		"tooltip-side": "bottom",
	},
});

const fallAway = keyframes({
	"0%": {
		transform: "rotateZ(0deg)",
		opacity: 1,
		top: 0,
	},
	"25%": {
		transform: "rotateZ(-15deg)",
	},
	"100%": {
		transform: "rotateZ(-5deg)",
		opacity: 0,
		top: 200,
	},
});

const moveUp = keyframes({
	"0%": {
		transform: "translateY(0px)",
	},
	"100%": {
		// -73 is the (height + 1 * gap):
		transform: "translateY(-73px)",
	},
});

const fallAwayDuration = 1;
const moveUpDelay = 0.2;
const moveUpDuration = fallAwayDuration / 2;
export const ItemWrapper = styled("div", {
	pos: "relative",
	d: "flex",
	fd: "column",
	w: 236,
	h: 63,

	b: "1px solid lightgray",
	br: 5,
	p: 10,

	"&.delete": {
		animation: `${fallAway} forwards ${fallAwayDuration}s ease-out`,
	},

	"&.move-up": {
		animation: `${moveUp} forwards ${moveUpDuration}s ease ${moveUpDelay}s`,
	},
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

		cursor: "pointer",
		bg: "none",
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
