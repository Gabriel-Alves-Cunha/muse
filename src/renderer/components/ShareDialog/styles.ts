import { Content, Close } from "@radix-ui/react-dialog";

import { slideUpAndFade } from "@components/Popover/styles";
import { styled } from "@styles/global";

export const Canvas = styled("canvas", { pos: "relative", size: 300, br: 13 });

export const CloseDialogTrigger = styled(Close, {
	pos: "absolute",
	dflex: "center",
	size: 26,
	r: 1,
	t: 1,

	cursor: "pointer",
	zIndex: 155,
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

export const StyledDialogShareContent = styled(Content, {
	pos: "absolute",
	d: "flex",
	flexDirection: "column",
	justifyContent: "space-between",
	alignItems: "center",
	w: 300,
	h: 500,

	// Centered:
	textAlign: "center",
	m: "auto",
	bottom: 0,
	r: 0,
	l: 0,
	t: 0,

	boxShadow: "$popover",
	bg: "$bg-popover",
	zIndex: 150,
	br: 13,

	"@media (prefers-reduced-motion: no-preference)": {
		animationTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
		animationFillMode: "forwards",
		animationDuration: "400ms",

		"&[data-state='open']": { animationName: slideUpAndFade },
	},

	"& div": {
		pos: "relative",
		w: 300,
		p: 8,

		"& p": {
			pos: "relative",
			mt: 8 * 3,

			c: "$alternative-text",
			ff: "$primary",
			ls: "0.04rem",
			fs: "1.3rem",
			fw: 500,

			textOverflow: "ellipsis",
			whiteSpace: "nowrap", // make it one-line.
			ov: "hidden",
		},

		ul: {
			display: "block",
			pos: "relative",

			mt: 8 * 2,

			ox: "hidden",
			oy: "auto",
			scroll: 2,

			"& li": {
				pos: "relative",

				c: "$alternative-text",
				ff: "$primary",
				ls: "0.04rem",
				fs: "1.1rem",
				fw: 500,

				textOverflow: "ellipsis",
				whiteSpace: "nowrap", // make it one-line.
				ov: "hidden",
			},
		},
	},
});
