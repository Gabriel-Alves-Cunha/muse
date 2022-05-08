import { Arrow, Content } from "@radix-ui/react-popover";

import { styled, keyframes } from "@styles/global";

const slideUpAndFade = keyframes({
	"0%": { opacity: 0, transform: "translateY(2px)" },
	"100%": { opacity: 1, transform: "translateY(0)" },
});

const slideRightAndFade = keyframes({
	"0%": { opacity: 0, transform: "translateX(-2px)" },
	"100%": { opacity: 1, transform: "translateX(0)" },
});

const slideDownAndFade = keyframes({
	"0%": { opacity: 0, transform: "translateY(-2px)" },
	"100%": { opacity: 1, transform: "translateY(0)" },
});

const slideLeftAndFade = keyframes({
	"0%": { opacity: 0, transform: "translateX(2px)" },
	"100%": { opacity: 1, transform: "translateX(0)" },
});

// TODO: make variants for Downloading/Converting and SearchMedia
export const StyledContent = styled(Content, {
	variants: {
		size: {
			small: {},
			medium: {
				height: 200,
				width: 350,
			},
			large: {
				maxHeight: 300,
				minHeight: 100,
				width: 260,
			},
		},
	},

	overflowY: "auto",
	overflowX: "clip",

	background: "$bg-popover",
	borderRadius: 4,
	padding: 20,

	boxShadow: "$popup",

	"@media (prefers-reduced-motion: no-preference)": {
		willChange: "transform, opacity",

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

	"&:focus": {
		boxShadow: `hsl(206 22% 7% / 35%)
		0px 10px 38px -10px,

		hsl(206 22% 7% / 20%)
		0px 10px 20px -15px,

		0 0 0 2px $deactivated-icon`,
	},

	/* width */
	"&::-webkit-scrollbar": {
		display: "block",
		size: 2,
	},

	/* Track */
	"&::-webkit-scrollbar-track": {
		background: "$scrollbar",
	},

	/* Handle */
	"&::-webkit-scrollbar-thumb": {
		background: "$scrollbar-thumb",
	},

	/* Handle on hover */
	"&::-webkit-scrollbar-thumb:hover": {
		background: "$scrollbar-thumb-hover",
	},
});

export const StyledArrow = styled(Arrow, {
	fill: "$bg-popover",
});
