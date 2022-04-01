import { Content, Arrow, Close, PopoverTrigger } from "@radix-ui/react-popover";

import { styled, keyframes } from "@styles/global";
import { color } from "@styles/theme";

export const StyledPopoverTrigger = styled(PopoverTrigger, {
	display: "flex", // row,
	justifyContent: "center",
	alignItems: "center",
	width: "80%",
	height: 45,

	backgroundColor: "transparent",
	cursor: "pointer",
	fontSize: "1rem",

	color: color("activeIcon"),
	transition: "$opacity",
	border: "none",
	opacity: 0.5,

	"&:hover": {
		transition: "$opacity",
		opacity: 1,
	},
});

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
	backgroundColor: "white",
	borderRadius: 4,
	padding: 20,
	width: 260,

	boxShadow: `hsl(206 22% 7% / 35%) 0px 10px 38px -10px,
		hsl(206 22% 7% / 20%) 0px 10px 20px -15px`,

	animationTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
	animationFillMode: "forwards",
	animationDuration: ".4s",

	willChange: "transform, opacity",

	"&[data-state='open']": {
		"&[data-side='right']": { animationName: slideLeftAndFade },
		"&[data-side='left']": { animationName: slideRightAndFade },
		"&[data-side='bottom']": { animationName: slideUpAndFade },
		"&[data-side='top']": { animationName: slideDownAndFade },
	},

	"&:focus": {
		boxShadow: `hsl(206 22% 7% / 35%) 0px 10px 38px -10px,
		hsl(206 22% 7% / 20%) 0px 10px 20px -15px,
		0 0 0 2px ${color("accent")}`,
	},
});

export const StyledArrow = styled(Arrow, {
	fill: color("bgMain"),
});

export const StyledClose = styled(Close, {
	all: "unset",

	position: "absolute",
	display: "inline-flex",
	justifyContent: "center",
	alignItems: "center",

	size: 25,
	top: 5,
	right: 5,

	fontFamily: "inherit",
	color: color("accent"),

	borderRadius: "100%",

	"&:hover": { backgroundColor: color("buttonHovered") },
	"&:focus": { boxShadow: `0 0 0 2px ${color("buttonHovered")}` },
});

export const Circle = styled("div", {
	display: "flex",
	justifyContent: "center",
	alignItems: "center",

	cursor: "pointer",
	bottom: "20vh",

	backgroundColor: "transparent",
	borderRadius: 20,
	size: 40,

	"&:hover": {
		transition: "$scale",
		transform: "scale(1.4)",
	},
});

export const Popup = styled("div", {
	position: "absolute",
	display: "flex",
	flexDirection: "column",
	bottom: "20vh",
	gap: "1rem",
	height: 100,
	width: 250,
	left: 10,

	overflowX: "hidden",
	overflowY: "auto",
	borderRadius: 20,
	padding: "1rem",
	zIndex: 500,

	backgroundColor: color("bgMain"),
	boxShadow: "$small",

	/* width */
	"::-webkit-scrollbar": {
		size: 5,
	},

	/* Track */
	"::-webkit-scrollbar-track": {
		background: color("scrollbar"),
	},

	/* Handle */
	"::-webkit-scrollbar-thumb": {
		background: color("scrollbarThumb"),
	},

	/* Handle on hover */
	"::-webkit-scrollbar-thumb:hover": {
		background: color("scrollbarThumbHover"),
	},
});

export const Title = styled("div", {
	display: "flex", // row
	justifyContent: "center",
	alignItems: "center",
	marginBottom: 10,
	height: "1rem",
	width: "100%",

	p: {
		fontFamily: "$fontFamily",
		whiteSpace: "nowrap",
		color: color("text"),
		fontSize: "0.8rem",
		textAlign: "left",

		overflow: "hidden",
		width: "90%",
	},

	span: {
		display: "flex", // row
		justifyContent: "center",
		alignItems: "center",
		height: 20,
		width: 20,

		backgroundColor: "transparent",
		borderRadius: "50%",
		marginLeft: 10,

		"&:hover": {
			backgroundColor: "rgba(125, 125, 125, 0.3)",
			color: "red",

			"& svg": {
				fill: "red",
			},
		},
	},
});
