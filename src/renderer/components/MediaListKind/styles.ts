import { Trigger } from "@radix-ui/react-dialog";

import { styled } from "@styles/global";

export const Img = styled("div", {
	$$size: "45px",

	display: "flex", // row
	justifyContent: "center",
	alignItems: "center",

	minWidth: "$$size",
	height: "$$size",

	boxShadow: "$small",
	borderRadius: 13,
	margin: "0 10px",
	border: "none",

	"&:not(:has(> img))": {
		border: "1px solid lightgray",
	},

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

export const Title = styled("p", {
	margin: "unset", // Virtuoso asks for this for performance reasons

	letterSpacing: "0.03rem",
	fontFamily: "$primary",
	fontSize: "1rem",
	fontWeight: 500,
	color: "$alternative-text",

	wordWrap: "normal",
	overflow: "hidden",
	/* white-space: nowrap; // make it one-line. */

	/* animation: 6s linear 0s infinite move;

	@keyframes move {
		from {
			transform: translateX(0%);
			left: 0%;
		}
		to {
			transform: translateX(-110%);
			left: 110%;
		}
	} */
});

export const SubTitle = styled("p", {
	margin: "unset", // Virtuoso asks for this for performance reasons

	letterSpacing: "0.03rem",
	fontFamily: "$primary",
	color: "$gray-text",
	fontSize: "0.8rem",
	fontWeight: 500,
});

export const TriggerOptions = styled(Trigger, {
	display: "flex", // row
	justifyContent: "center",
	alignItems: "center",

	background: "transparent",
	borderRadius: 7,
	margin: 5,

	height: 40,
	width: 25,

	cursor: "pointer",
	border: "none",

	"&:hover": {
		transition: "$boxShadow",
		boxShadow: "$small",
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
	display: "flex", // row
	justifyContent: "center",
	alignItems: "center",

	width: "98% !important",
	height: 65,

	borderRadius: 7,
	padding: 7,

	"&:hover": {
		transition: "$boxShadow",
		boxShadow: "$medium",
	},

	"&.active": {
		boxShadow: "$medium",
		background: "white",
	},
});

export const PlayButton = styled("button", {
	position: "relative",
	display: "flex", // row
	justifyContent: "center",
	alignItems: "center",

	height: "100%",
	width: "90%",

	cursor: "pointer",
});
