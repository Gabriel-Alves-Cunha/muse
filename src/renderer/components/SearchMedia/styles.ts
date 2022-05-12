import { Anchor, Trigger } from "@radix-ui/react-popover";

import { styled, keyframes } from "@styles/global";

export const Wrapper = styled("header", {
	position: "relative",
	display: "flex", // row,
	justifyContent: "space-between",
	alignItems: "center",

	padding: "0 5%",
	maxWidth: 500,
	width: "90%",
	height: 60,
});

export const SearchWrapper = styled("div", {
	position: "relative",
	display: "flex",
	flexDirection: "column",
	justifyContent: "flex-start",
	alignItems: "flex-start",
	mx: "auto",
});

export const Search = styled("div", {
	position: "relative",
	display: "flex", // row,
	justifyContent: "flex-start",
	alignItems: "center",

	minWidth: "100%",
	maxWidth: 500,
	height: 30,

	border: "1px solid lightgray",
	background: "transparent",
	borderRadius: 15, // half of height
	cursor: "text",

	transition: "$opacity",
	color: "$text",
	opacity: 0.8,

	"&:hover": {
		transition: "$opacity",
		opacity: 1,
	},

	"& svg": {
		marginLeft: 10,
	},

	input: {
		boxSizing: "border-box",

		letterSpacing: "0.03rem",
		fontFamily: "$secondary",
		fontSize: "0.9rem",
		color: "$text",

		padding: "0 10px",
		size: "100%",

		background: "transparent",
		borderRadius: 15,
		border: "none",

		transition: "$opacity",
		opacity: 0.5,

		"&:hover": {
			transition: "$opacity",
			opacity: 1,
		},
	},
});

const spin = keyframes({
	from: {
		transform: "rotate(0deg)",
	},
	to: {
		transform: "rotate(360deg)",
	},
});

export const ReloadButton = styled("button", {
	display: "flex", // row,
	justifyContent: "center",
	alignItems: "center",
	size: 29,

	background: "transparent",
	borderRadius: "50%",
	cursor: "pointer",
	border: "none",
	marginLeft: 16,

	transition: "$bgc",

	"& svg": {
		color: "$gray-text",
	},

	"&:hover": {
		transition: "$bgc",
		background: "$icon-button-2",
	},

	"&.reload:hover": {
		animation: `${spin} 0.5s linear`,
	},

	"& svg.reloading": {
		animation: `${spin} infinity linear`,
	},
});

export const Info = styled("div", {
	display: "flex",
	flexDirection: "column",
	justifyContent: "flex-start",
	alignItems: "flex-start",

	size: "calc(100% - 5px)",
	overflow: "hidden",
});

export const Title = styled("p", {
	marginLeft: 5,

	color: "$alternative-text",
	textOverflow: "ellipsis",
	letterSpacing: "0.03rem",
	fontFamily: "$secondary",
	whiteSpace: "nowrap", // make it one-line.
	textAlign: "left",
	fontSize: "1rem",
	fontWeight: 500,
});

export const SubTitle = styled("p", {
	marginLeft: 5,

	letterSpacing: "0.03rem",
	fontFamily: "$primary",
	color: "$gray-text",
	fontSize: "0.8rem",
	fontWeight: 500,
});

export const Highlight = styled("span", {
	background: "yellowgreen",
	color: "white",
});

export const SearchMediaPopoverAnchor = styled(Anchor, {
	position: "absolute",
	left: "50%",
	top: 30,
});

export const Result = styled("div", {
	position: "relative",
	display: "flex", // row
	justifyContent: "flex-start",
	width: "100%",
	height: 60,

	border: "1px solid lightgray",
	background: "$bg-media",
	cursor: "pointer",
	borderRadius: 7,
	padding: 7,

	"&:hover": {
		boxShadow: "$row-wrapper",
	},
});

export const NothingFound = styled("div", {
	display: "flex", // row,
	justifyContent: "center",
	alignItems: "center",

	color: "$deactivated-icon",
	letterSpacing: "0.03rem",
	fontFamily: "$secondary",
	textAlign: "center",
	fontSize: "1.05rem",
	fontWeight: 500,
});

export const HiddenPopoverTrigger = styled(Trigger, {
	display: "none",
});
