import { Anchor, Trigger } from "@radix-ui/react-popover";

import { styled } from "@styles/global";

export const SearchWrapper = styled("div", {
	position: "relative",
	display: "flex", // row,
	justifyContent: "flex-start",
	alignItems: "center",

	width: 300,
	height: 40,

	border: "2px solid $input-border",
	background: "transparent",
	borderRadius: "0.75rem",
	cursor: "default",

	transition: "all ease 250ms",

	"&:hover, &:focus-within": {
		transition: "all ease 250ms",

		borderColor: "$input-border-active",

		"& svg": {
			color: "$input-border-active",
		},

		"& label": {
			top: "-180%",
			left: -30,

			color: "$input-border-active",
			cursor: "default",
		},
	},

	"& svg": {
		color: "$input-border",
		cursor: "default",
		strokeWidth: 30,
		mx: 10,
	},

	label: {
		position: "absolute",
		display: "flex", // row
		alignItems: "center",
		height: "2.5rem",
		width: 250,
		bottom: 0,
		right: 0,
		left: 30,
		top: 0,

		cursor: "text",
		margin: "auto",
		padding: 0,

		color: "$input-placeholder",
		whiteSpace: "nowrap",
		ff: "$secondary",
		ls: "0.04rem",
		fs: "1rem",
		fw: 400,
		lh: 1.5,

		transitionProperty: "color, top, left",
		transitionTimingFunction: "ease",
		transitionDuration: "250ms",
		transitionDelay: 0,
	},

	input: {
		boxSizing: "border-box",
		size: "100%",

		color: "$input-text",
		whiteSpace: "nowrap",
		ff: "$secondary",
		ls: "0.045rem",
		fs: "0.9rem",
		fw: 400,
		lh: 1.5,

		background: "transparent",
		border: "none",
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
	ff: "$secondary",
	whiteSpace: "nowrap", // make it one-line.
	ta: "left",
	fontSize: "1rem",
	fontWeight: 500,
});

export const SubTitle = styled("p", {
	marginLeft: 5,

	letterSpacing: "0.03rem",
	ff: "$primary",
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

	border: "1px solid $gray-text",
	background: "$bg-media",
	cursor: "pointer",
	borderRadius: 7,
	padding: 7,

	"&:hover": {
		transition: "all 100ms ease-in-out",
		borderColor: "$text",
	},
});

export const NothingFound = styled("div", {
	display: "flex", // row,
	justifyContent: "center",
	alignItems: "center",

	color: "$deactivated-icon",
	letterSpacing: "0.03rem",
	ff: "$secondary",
	ta: "center",
	fontSize: "1.05rem",
	fontWeight: 500,
});

export const HiddenPopoverTrigger = styled(Trigger, {
	display: "none",
});
