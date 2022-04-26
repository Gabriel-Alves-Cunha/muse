import { Content, Arrow } from "@radix-ui/react-tooltip";

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
	backgroundColor: "white",
	padding: "10px 15px",
	borderRadius: 4,

	boxShadow: `
	hsl(206 22% 7% / 35%)
	0px 10px 38px -10px,
	hsl(206 22% 7% / 20%)
	0px 10px 20px -15px`,

	letterSpacing: "0.03rem",
	fontFamily: "$secondary",
	fontWeight: 500,
	color: "$text",
	lineHeight: 1,
	fontSize: 15,

	"@media (prefers-reduced-motion: no-preference)": {
		animationTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
		willChange: "transform, opacity",
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

export const StyledArrow = styled(Arrow, {
	fill: "white",
});
