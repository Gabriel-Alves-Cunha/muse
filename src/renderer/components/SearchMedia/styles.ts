import { styled, keyframes } from "@styles/global";
import { color } from "@styles/theme";

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
	color: color("text"),
	boxShadow: "$small",
	borderRadius: 15,
	border: "none",
	cursor: "text",

	"& svg": {
		marginLeft: 10,
	},

	"&:hover": {
		boxShadow: "$insetSmall",
		transition: "$opacity",

		"& svg": {
			color: "rgba(0, 0, 0, 0.5)",
		},
	},

	input: {
		fontFamily: "$fontFamily",
		letterSpacing: "0.03em",
		boxSizing: "border-box",
		fontSize: "0.9rem",

		size: "100%",

		background: "transparent",
		borderRadius: 15,
		border: "none",

		color: color("text"),
		padding: "0 10px",

		transition: "$opacity",
		opacity: 0.5,

		"&:hover": {
			opacity: 1,

			"&::placeholder": {
				color: color("text"),
			},
		},

		"&::placeholder": {
			color: color("text"),
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

	backgroundColor: color("bgMain"),
	boxShadow: "$medium",

	"&.list": {
		overflowX: "hidden !important",

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
	},
});

export const Result = styled("button", {
	display: "flex", // row,
	justifyContent: "flex-start",
	alignItems: "center",

	width: "95% !important",

	backgroundColor: color("bgMain"),
	margin: "10px !important",
	cursor: "pointer",
	borderRadius: 7,
	border: "none",

	// TODO: fix this
	"&:hover": {
		transition: "opacity 0.2s ease-in-out 17ms",
		boxShadow: "$medium",
	},
});

export const NothingFound = styled("div", {
	display: "flex", // row,
	justifyContent: "flex-start",
	alignItems: "center",

	width: "95% !important",

	backgroundColor: color("bgMain"),
	margin: "10px !important",
	cursor: "pointer",
	borderRadius: 7,
	border: "none",
});
