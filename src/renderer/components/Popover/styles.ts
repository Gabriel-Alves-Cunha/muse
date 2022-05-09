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

export const StyledContent = styled(Content, {
	position: "relative", // to the popover anchor
	display: "flex",
	flexDirection: "column",

	variants: {
		size: {
			nothingFoundForSearchMedia: {
				height: 100,
				width: 350,

				overflow: "hidden",
			},
			nothingFoundForConvertionsOrDownloads: {
				height: 100,
				width: 260,

				overflow: "hidden",
			},
			searchMediaResults: {
				height: 200,
				width: 350,

				overflow: "hidden",
			},
			convertionsOrDownloads: {
				height: 300,
				width: 260,

				overflow: "hidden",
			},
		},
	},

	background: "$bg-popover",
	borderRadius: 10,
	padding: 20,

	border: "1px solid lightgrey",
	boxShadow: "$popover",
	gap: 16,

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

	p: {
		position: "relative",
		top: "50%", // position the top  edge of the element at the middle of the parent
		left: "50%", // position the left edge of the element at the middle of the parent
		transform: "translate(-50%, -50%)",

		color: "$deactivated-icon",
		letterSpacing: "0.03rem",
		fontFamily: "$secondary",
		textAlign: "center",
		fontSize: "1.05rem",
		fontWeight: 500,
	},

	"&:focus": {
		boxShadow: "$popover",
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
