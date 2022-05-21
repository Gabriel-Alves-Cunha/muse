import { Trigger } from "@radix-ui/react-dialog";

import { styled } from "@styles/global";

export const ImgWrapper = styled("div", {
	$$size: "45px",

	display: "flex", // row
	justifyContent: "center",
	alignItems: "center",

	minWidth: "$$size",
	height: "$$size",

	borderRadius: 13,
	border: "none",
	mr: 10,

	"& img": {
		objectFit: "cover",
		size: "$$size",

		borderRadius: 13,

		"&:before": {
			display: "none",
		},
	},

	"& svg": {
		color: "$deactivated-icon",
	},
});

export const Info = styled("div", {
	display: "flex",
	flexDirection: "column",
	justifyContent: "center",
	alignItems: "flex-start",

	size: "calc(100% - 5px)",
	overflow: "hidden",
});

export const Title = styled("p", {
	margin: "unset", // Virtuoso asks for this for performance reasons

	color: "$alternative-text",
	letterSpacing: "0.04rem",
	ff: "$secondary",
	fontSize: "1rem",
	fontWeight: 500,

	textOverflow: "ellipsis",
	whiteSpace: "nowrap", // make it one-line.
	overflow: "hidden",

	"& .highlight": {
		background: "yellowgreen",
	},
});

export const SubTitle = styled("p", {
	margin: "20px 0",

	color: "$alternative-text",
	letterSpacing: "0.03rem",
	fontSize: "0.9rem",
	fontWeight: 500,
	ff: "$primary",

	"&.row": {
		color: "$gray-text",
		margin: "unset",
	},
});

/** You need to set the width! */
export const TriggerOptions = styled(Trigger, {
	position: "relative",
	display: "flex", // row
	justifyContent: "center",
	alignItems: "center",

	color: "$deactivated-icon",
	background: "transparent",
	borderRadius: "50%",
	cursor: "pointer",
	border: "none",
	margin: 5,

	transition: "$bgc",

	"&:hover": {
		transition: "$bgc",
		background: "$icon-button-hovered",
	},

	// Hack to make the height the same size as the width:
	"&:before": {
		content: "",
		float: "left",
		pt: "100%", // ratio of 1:1
	},
});

export const ListWrapper = styled("div", {
	margin: "2em 5%",
	height: "70vh",
	maxWidth: 600,

	"@sm": {
		margin: "0.5em 5%",
	},

	overflowX: "hidden !important",

	/* width */
	".list::-webkit-scrollbar": {
		display: "block",
		size: 5,
	},

	/* Track */
	".list::-webkit-scrollbar-track": {
		background: "$scrollbar",
	},

	/* Handle */
	".list::-webkit-scrollbar-thumb": {
		background: "$scrollbar-thumb",
	},

	/* Handle on hover */
	".list::-webkit-scrollbar-thumb:hover": {
		background: "$scrollbar-thumb-hover",
	},
});

export const RowWrapper = styled("div", {
	position: "relative",
	display: "flex", // row
	justifyContent: "center",
	alignItems: "center",
	width: "98%",
	height: 65,
	left: 7,

	transition: "$boxShadow",
	borderRadius: 7,
	padding: 7,

	"&:hover, &:focus, &.active": {
		transition: "$boxShadow",
		boxShadow: "$row-wrapper",
	},

	"&.selected": {
		border: "2px solid $selected-border-color",
		background: "$bg-selected",
		boxShadow: "$bg-selected",
	},
});

export const PlayButton = styled("button", {
	position: "relative",
	display: "flex", // row
	justifyContent: "center",
	alignItems: "center",

	height: "100%",
	width: "90%",

	background: "transparent",
	cursor: "pointer",
	border: "none",
});

export const ErrorMsg = styled("pre", {
	margin: "20px 0",

	letterSpacing: "0.035rem",
	fontSize: "0.8rem",
	ff: "$secondary",
	fontWeight: 500,
	color: "red",
});

export const Footer = styled("div", {
	position: "relative",
	size: 10,

	background: "transparent",
});

export const EmptyList = styled("div", {
	position: "relative",
	display: "flex", // row
	justifyContent: "center",
	alignItems: "center",
	size: "95%",

	color: "$alternative-text",
	letterSpacing: "0.04rem",
	ff: "$secondary",
	fontSize: "1.1rem",
	fontWeight: 500,

	img: {
		size: 52,
		mr: 20,
	},
});

export const Center = styled("div", {
	position: "relative",
	dcolumn: "center",
});
