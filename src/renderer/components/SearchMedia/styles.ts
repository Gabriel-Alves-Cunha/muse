import { styled, keyframes } from "@styles/global";

export const Wrapper = styled("header", {
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
});

export const Search = styled("div", {
	position: "relative",
	display: "flex", // row,
	justifyContent: "flex-start",
	alignItems: "center",

	minWidth: "100%",
	maxWidth: 500,
	height: 30,

	background: "transparent",
	boxShadow: "$small",
	borderRadius: 15,
	border: "none",
	cursor: "text",

	color: "$text",

	transition: "$opacity",
	opacity: 0.6,

	"& svg": {
		marginLeft: 10,
	},

	"&:hover": {
		boxShadow: "$insetSmall",

		transition: "$opacity",
		opacity: 1,
	},

	input: {
		letterSpacing: "0.03em",
		boxSizing: "border-box",
		fontFamily: "$primary",
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

export const SearchResultsWrapper = styled("section", {
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
	display: "flex", // row,
	justifyContent: "flex-start",
	alignItems: "center",

	width: "95% !important",

	backgroundColor: "$bg-main",
	margin: "10px !important",
	cursor: "pointer",
	borderRadius: 7,
	border: "none",
});
