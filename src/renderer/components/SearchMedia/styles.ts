import { styled, keyframes } from "@styles/global";

export const Wrapper = styled("header", {
	position: "relative",
	display: "flex", // row,
	justifyContent: "space-between !important",
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
	borderRadius: 15,
	cursor: "text",

	transition: "$opacity",
	color: "$text",
	opacity: 0.5,

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

export const Button = styled("button", {
	display: "flex", // row,
	justifyContent: "center",
	alignItems: "center",
	size: 29,

	backgroundColor: "transparent",
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
		backgroundColor: "$icon-button-2",
	},

	"&.reload:hover": {
		animation: `${spin} 0.5s linear`,
	},

	"& svg.reloading": {
		animation: `${spin} infinity linear`,
	},
});

export const SearchResultsWrapper = styled("ul", {
	position: "absolute",
	display: "flex",
	flexDirection: "column",
	justifyContent: "center",
	alignItems: "center",
	left: "-25%",
	height: 200,
	width: 350,
	top: 50,

	border: "1px solid lightgray",
	background: "$bg-popover",
	boxShadow: "$popup",
	borderRadius: 7,
	padding: 10,
	zIndex: 10,
	gap: 10,

	overflowY: "auto",
	listStyle: "none",

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

export const DivToPosition = styled("ul", {});

export const Result = styled("li", {
	position: "relative",
	display: "flex", // row
	justifyContent: "center",
	alignItems: "center",
	width: "100%",
	height: 60,

	border: "1px solid lightgray",
	background: "$bg-popover",
	cursor: "pointer",
	borderRadius: 7,
	padding: 7,

	"&:hover": {
		boxShadow: "$row-wrapper",
	},
});

export const NothingFound = styled("div", {
	position: "absolute",
	display: "flex", // row,
	justifyContent: "center",
	alignItems: "center",
	left: "-25%",
	width: 350,
	height: 50,
	top: 50,

	border: "1px solid lightgray",
	background: "$bg-popover",
	boxShadow: "$popup",
	borderRadius: 7,
	zIndex: 10,

	color: "$deactivated-icon",
	letterSpacing: "0.03rem",
	fontFamily: "$secondary",
	textAlign: "center",
	fontSize: "1.05rem",
	fontWeight: 500,
});
