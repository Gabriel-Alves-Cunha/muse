import { styled } from "@styles/global";

import { fonts, theme } from "@styles/theme";

export const Wrapper = styled("header", {
	display: "flex",
	flexDirection: "row",
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
	display: "flex",
	flexDirection: "row",
	justifyContent: "flex-start",
	alignItems: "center",

	minWidth: "100%",
	maxWidth: 500,
	height: 30,

	background: "transparent",
	borderRadius: 15,
	border: "none",
	cursor: "text",
	color: "#ccc",

	boxShadow: theme.boxShadows.small,

	svg: {
		marginLeft: 10,
	},

	"&:hover": {
		boxShadow: theme.boxShadows.inset_small,
		transition: "opacity 0s linear 17ms",

		svg: {
			color: "rgba(0, 0, 0, 0.5)",
		},
	},

	input: {
		fontFamily: fonts.primary,
		letterSpacing: "0.03em",
		boxSizing: "border-box",
		fontSize: "0.9rem",

		height: "100%",
		width: "100%",

		background: "transparent",
		borderRadius: 15,
		border: "none",

		color: "rgba(0, 0, 0, 0.5)",
		paddingRight: 10,
		paddingLeft: 10,

		"&::placeholder": {
			color: "#ccc",
		},

		"&:hover": {
			"&::placeholder": {
				color: "rgba(0, 0, 0, 0.5)",
			},
		},
	},
});

export const ReloadContainer = styled("button", {
	variants: {
		animation: {
			false: { animation: "spin 0.5s linear" },
			true: { animation: "" },
		},
	},

	display: "flex",
	justifyContent: "center",
	alignItems: "center",

	backgroundColor: "transparent",
	marginLeft: "1rem",
	cursor: "pointer",
	border: "none",

	"&:hover": {
		willChange: "transform",
		animation: "$animation",

		"@keyframes spin": {
			from: {
				transform: "rotate(0deg)",
			},
			to: {
				transform: "rotate(360deg)",
			},
		},
	},
});

export const Button = styled("button", {
	display: "flex",
	justifyContent: "center",
	alignItems: "center",

	backgroundColor: "transparent",
	/* marginLeft: 1rem; */
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

	backgroundColor: theme.colors.secondary,
	boxShadow: theme.boxShadows.medium,

	"&.list": {
		overflowX: "hidden !important",

		/* width */
		"&::-webkit-scrollbar": {
			width: 5,
		},

		/* Track */
		"&::-webkit-scrollbar-track": {
			background: "#f1f1f1",
		},

		/* Handle */
		"&::-webkit-scrollbar-thumb": {
			background: "#888",
		},

		/* Handle on hover */
		"&::-webkit-scrollbar-thumb:hover": {
			background: "#555",
		},
	},
});

export const Result = styled("button", {
	cursor: "pointer",
	border: "none",

	display: "flex",
	flexDirection: "row",
	justifyContent: "flex-start",
	alignItems: "center",

	width: "95% !important",

	backgroundColor: theme.colors.secondary,
	margin: "10px !important",
	borderRadius: 7,

	"&::after": {
		transition: "opacity 0.2s ease-in-out 17ms",
		boxShadow: theme.boxShadows.medium,
		opacity: 0,
	},

	"&:hover::after": {
		zIndex: 20,
		opacity: 1,
	},
});
