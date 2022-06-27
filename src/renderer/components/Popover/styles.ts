import { Content } from "@radix-ui/react-popover";

import { styled, keyframes } from "@styles/global";

export const slideUpAndFade = keyframes({
	"0%": { opacity: 0, transform: "translateY(2px)" },
	"100%": { opacity: 1, transform: "translateY(0)" },
});

export const slideRightAndFade = keyframes({
	"0%": { opacity: 0, transform: "translateX(-2px)" },
	"100%": { opacity: 1, transform: "translateX(0)" },
});

export const slideDownAndFade = keyframes({
	"0%": { opacity: 0, transform: "translateY(-2px)" },
	"100%": { opacity: 1, transform: "translateY(0)" },
});

export const slideLeftAndFade = keyframes({
	"0%": { opacity: 0, transform: "translateX(2px)" },
	"100%": { opacity: 1, transform: "translateX(0)" },
});

export const StyledContent = styled(Content, {
	pos: "relative", // to the popover anchor
	d: "flex",
	fd: "column",
	gap: 10,

	bg: "$bg-popover",
	ox: "hidden",
	br: 10,
	p: 10,

	boxShadow: "$popover",

	"@media (prefers-reduced-motion: no-preference)": {
		animationTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
		animationFillMode: "forwards",
		animationDuration: "400ms",

		"&[data-state='open']": {
			"&[data-side='right']": { animationName: slideLeftAndFade },
			"&[data-side='left']": { animationName: slideRightAndFade },
			"&[data-side='bottom']": { animationName: slideUpAndFade },
			"&[data-side='top']": { animationName: slideDownAndFade },
		},
	},

	"& > p": {
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

	scroll: 2,

	variants: {
		size: {
			"nothing-found-for-search-media": {
				maxHeight: 100,
				minHeight: 50,
				w: 350,

				ov: "auto",
			},
			"nothing-found-for-convertions-or-downloads": {
				h: 100,
				w: 260,

				ov: "hidden",
			},
			"search-media-results": { h: 250, w: 350, ov: "auto" },
			"convertions-or-downloads": { h: 300, w: 260, ov: "auto" },
		},
	},
});
