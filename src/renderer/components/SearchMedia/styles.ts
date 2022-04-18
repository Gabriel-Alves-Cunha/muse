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
	display: "flex",
	flexDirection: "column",
	justifyContent: "flex-start",
	alignItems: "flex-start",
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

	color: "$text",

	"& svg": {
		marginLeft: 10,
	},

	input: {
		letterSpacing: "0.03rem",
		boxSizing: "border-box",
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

		"&:focus-visible": {
			outline: "none",
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

export const ReloadContainer = styled("button", {
	display: "flex", // row,
	justifyContent: "center",
	alignItems: "center",

	backgroundColor: "transparent",
	marginLeft: "1rem",
	cursor: "pointer",
	border: "none",

	"&:hover": {
		animation: `${spin} 0.5s linear`,
	},
});

export const Button = styled("button", {
	display: "flex", // row,
	justifyContent: "center",
	alignItems: "center",

	backgroundColor: "transparent",
	cursor: "pointer",
	border: "none",
});

export const SearchResultsWrapper = styled("div", {
	position: "absolute",
	display: "flex",
	flexDirection: "column",
	justifyContent: "center",
	alignItems: "center",
	height: "40vh",
	width: "100%",

	borderRadius: 7,
	marginTop: 30,
	zIndex: 10,

	backgroundColor: "$bg-main",
	boxShadow: "$medium",

	"&.list": {
		overflowX: "hidden !important",

		/* width */
		"::-webkit-scrollbar": {
			size: 5,
		},

		/* Track */
		"::-webkit-scrollbar-track": {
			background: "$scrollbar",
		},

		/* Handle */
		"::-webkit-scrollbar-thumb": {
			background: "$scrollbar-thumb",
		},

		/* Handle on hover */
		"::-webkit-scrollbar-thumb:hover": {
			background: "$scrollbar-thumb-hover",
		},
	},
});

export const Result = styled("button", {
	display: "flex", // row,
	justifyContent: "flex-start",
	alignItems: "center",

	width: "95% !important",

	backgroundColor: "$bg-main",
	margin: "10px !important",
	cursor: "pointer",
	borderRadius: 7,
	border: "none",

	transition: "$boxShadow",
	boxShadow: "",

	"&:hover": {
		transition: "$boxShadow",
		boxShadow: "$medium",
	},
});

export const NothingFound = styled("div", {
	position: "absolute",
	display: "flex", // row,
	justifyContent: "center",
	alignItems: "center",
	width: "100%",
	height: 50,
	top: 40,
	left: 0, // position the left edge of the element at the middle of the parent

	border: "1px solid lightgray",
	background: "$bg-popover",
	margin: "10px !important",
	boxShadow: "$popup",
	cursor: "pointer",
	borderRadius: 7,

	color: "$deactivated-icon",
	letterSpacing: "0.03rem",
	fontFamily: "$secondary",
	textAlign: "center",
	fontSize: "1.05rem",
	fontWeight: 500,
});
