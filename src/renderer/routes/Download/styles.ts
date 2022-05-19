import { MainArea } from "@components/MainArea";
import { styled } from "@styles/global";

export const Wrapper = styled(MainArea, {
	position: "relative",
	display: "flex",
	flexDirection: "column",
	height: "100vh",
	width: "100%",

	overflowY: "auto",

	/* width */
	"&::-webkit-scrollbar": {
		display: "block",
		size: 5,
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

export const Box = styled("div", {
	display: "flex", // row
	justifyContent: "center",
	alignItems: "center",
	width: "100%",
});

export const SearchWrapper = styled("div", {
	position: "relative",
	display: "flex", // row
	justifyContent: "center",
	alignItems: "center",
	width: "80%",
	height: 60,

	"& p": {
		position: "absolute",
		marginTop: "4rem",

		letterSpacing: "0.03rem",
		ff: "$secondary",
		fontSize: "0.9rem",
		fontWeight: 300,
		color: "red",
	},
});

export const Searcher = styled("button", {
	position: "relative",
	display: "flex", // row
	justifyContent: "flex-start",
	alignItems: "center",

	background: "transparent",
	width: "100%",
	height: 40,

	border: "1px solid lightgray",
	borderRadius: 20,
	cursor: "text",

	transition: "$opacity",
	opacity: 0.8,

	"&:hover": {
		opacity: 1,
	},

	"& svg": {
		marginLeft: 10,
		color: "$text",
		opacity: 0.8,
	},

	"&:hover svg": {
		opacity: 1,
	},

	input: {
		letterSpacing: "0.03rem",
		ff: "$secondary",
		fontSize: "0.9rem",

		boxSizing: "border-box",
		size: "100%",

		background: "transparent",
		borderRadius: 15,
		border: "none",

		color: "$text",
		opacity: 0.8,
		px: 10,

		"&::placeholder": {
			color: "$text",
		},

		"&:hover": {
			transition: "$opacity",
			opacity: 1,
		},
	},
});

export const ResultContainer = styled("div", {
	display: "flex",
	flexDirection: "column",
	justifyContent: "center",
	alignItems: "center",
	mb: "1.3rem",
	mt: 30,

	img: {
		objectFit: "cover",
		display: "flex",
		height: 168.75,
		width: 300,

		maxHeight: 300,
		maxWidth: 300,

		"-webkit-box-reflect": `below 0px
			-webkit-gradient(linear, right top, right	bottom,
				from(transparent),
				color-stop(40%, transparent),
				to(rgba(255, 255, 255, 0.1))
			)`,

		boxShadow: "$reflect",

		transition: "$scale",

		"&:hover": {
			transition: "$scale",
			transform: "scale(1.1)",
		},
	},

	"& p": {
		ff: "$primary",
		ta: "center",
		margin: "2rem 1rem",
		fontSize: "1.1rem",
		wordWrap: "normal",
		color: "$text",
	},

	span: {
		ff: "$primary",
		ta: "center",
		margin: "1rem auto",
		wordWrap: "normal",
		fontSize: "1rem",
		color: "$text",
	},
});

export const LoadingWrapper = styled("div", {
	marginLeft: 10,
	size: 25,
});
