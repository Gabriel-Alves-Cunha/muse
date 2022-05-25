import { Anchor, Trigger } from "@radix-ui/react-popover";

import { styled } from "@styles/global";

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

	border: "2px solid $input-border",
	background: "transparent",
	borderRadius: "0.75rem",
	cursor: "text",
	color: "$text",

	transition: "all 250ms ease",

	"& svg": {
		marginLeft: 10,
	},

	label: {
		position: "absolute",
		top: "20%",
		left: 10,

		zIindex: "var(--nextui-zIndices-1)",
		padding: 0,

		transition: "left 0.25s ease 0s, color 0.25s ease 0s, top 0.25s ease 0s",
	},

	input: {
		boxSizing: "border-box",
		size: "100%",

		letterSpacing: "0.03rem",
		color: "$input-text",
		fontSize: "0.9rem",
		ff: "$secondary",

		background: "transparent",
		padding: "0 10px",
		border: "none",
	},

	"&:focus": {
		label: {
			top: "-72%",
			left: 5,

			color: "$input-border-active",
			cursor: "default",
		},
		input: {
			borderColor: "$input-border-active",
		},
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
