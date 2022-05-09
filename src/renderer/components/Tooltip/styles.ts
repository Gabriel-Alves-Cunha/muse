import { Content } from "@radix-ui/react-tooltip";

import { styled, keyframes } from "@styles/global";

const slideUpAndFade = keyframes({
	"0%": { opacity: 0, transform: "translateY(10px)" },
	"100%": { opacity: 1, transform: "translateY(0)" },
});

const slideRightAndFade = keyframes({
	"0%": { opacity: 0, transform: "translateX(-2px)" },
	"100%": { opacity: 1, transform: "translateX(0)" },
});

const slideDownAndFade = keyframes({
	"0%": { opacity: 0, transform: "translateY(-10px)" },
	"100%": { opacity: 1, transform: "translateY(0)" },
});

const slideLeftAndFade = keyframes({
	"0%": { opacity: 0, transform: "translateX(2px)" },
	"100%": { opacity: 1, transform: "translateX(0)" },
});

export const StyledContent = styled(Content, {
	boxSizing: "border-box", // So that border doens't occupy space

	background: "$bg-tooltip",
	padding: "10px 15px",
	borderRadius: 4,

	boxShadow: "$tooltip",

	border: "1px solid lightgray",
	letterSpacing: "0.03rem",
	fontFamily: "$secondary",
	fontWeight: 500,
	color: "$text",
	lineHeight: 1,
	fontSize: 15,

	"@media (prefers-reduced-motion: no-preference)": {
		willChange: "transform, opacity",

		animationTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
		animationFillMode: "forwards",
		animationDuration: "400ms",

		"&[data-state='delayed-open']": {
			"&[data-side='right']": { animationName: slideLeftAndFade },
			"&[data-side='left']": { animationName: slideRightAndFade },
			"&[data-side='bottom']": { animationName: slideUpAndFade },
			"&[data-side='top']": { animationName: slideDownAndFade },
		},
	},
});
