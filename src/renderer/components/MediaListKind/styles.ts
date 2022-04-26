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
	margin: "0 10px",
	border: "none",

	"& img": {
		objectFit: "cover",
		size: "$$size",

		borderRadius: 13,
		border: "none",

		"&:before": {
			display: "none",
		},
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

export const SubTitle = styled("p", {
	margin: "unset", // Virtuoso asks for this for performance reasons

	letterSpacing: "0.03rem",
	fontFamily: "$primary",
	color: "$gray-text",
	fontSize: "0.8rem",
	fontWeight: 500,
});

/** You need to set the width! */
export const TriggerOptions = styled(Trigger, {
	position: "relative",
	display: "flex", // row
	justifyContent: "center",
	alignItems: "center",

	background: "transparent",
	borderRadius: "50%",
	cursor: "pointer",
	border: "none",
	margin: 5,

	transition: "$bgc",

	"&:hover": {
		transition: "$bgc",
		backgroundColor: "#88888860",
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

	transition: "0.3s",
	borderRadius: 7,
	padding: 7,

	"&:hover, &:focus, &.active": {
		transition: "$boxShadow",
		boxShadow: "$row-wrapper",
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

export const Title = styled("p", {
	margin: "unset", // Virtuoso asks for this for performance reasons

	color: "$alternative-text",
	letterSpacing: "0.03rem",
	fontFamily: "$secondary",
	fontSize: "1rem",
	fontWeight: 500,

	textOverflow: "ellipsis",
	whiteSpace: "nowrap", // make it one-line.
	overflow: "hidden",
});

export const Alert = styled("div", {
	position: "absolute",
	top: 0,
	left: 0,
	width: "100%",
	height: "100%",
});

export const Msg = styled("pre", {
	color: "$alternative-text",
	letterSpacing: "0.03rem",
	fontFamily: "$secondary",
	fontSize: "0.8rem",
	fontWeight: 500,
});

export const Button = styled("button", {
	position: "relative",
	display: "flex", // row
	justifyContent: "center",
	alignItems: "center",

	height: 40,
	width: 200,

	border: "1px solid lightgray",
	background: "transparent",
	cursor: "pointer",
	borderRadius: 7,
});
