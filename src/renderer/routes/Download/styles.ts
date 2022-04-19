import { MainArea } from "@components";
import { styled } from "@styles/global";

export const Wrapper = styled(MainArea, {
	position: "relative",
	display: "inline-block",
	justifySelf: "flex-start", // for grid: row

	height: "calc(100vh - 20vh)",
	width: "100%",

	overflowY: "hidden",

	/* width */
	"&::-webkit-scrollbar": {
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

export const SearchWrapper = styled("div", {
	position: "relative",
	display: "flex", // row
	justifyContent: "center",
	alignItems: "center",

	padding: "0 5%",
	height: 60,

	p: {
		letterSpacing: "0.02rem",
		fontFamily: "$primary",
		position: "absolute",
		fontSize: "0.8rem",
		marginTop: "4rem",
		color: "red",
	},
});

export const Searcher = styled("button", {
	position: "relative",
	display: "flex", // row
	justifyContent: "flex-start",
	alignItems: "center",

	background: "transparent",
	width: "80%",
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
		transition: "$opacity",
		opacity: 0.8,

		marginLeft: 10,
		color: "$text",
	},

	"&:hover svg": {
		opacity: 1,
	},

	input: {
		letterSpacing: "0.03rem",
		fontFamily: "$secondary",
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

	img: {
		objectFit: "cover",
		display: "flex",
		size: "90%",

		maxHeight: 300,
		maxWidth: 300,

		"-webkit-box-reflect": `below 0px
			-webkit-gradient(linear, right top, right	bottom,
				from(transparent),
				color-stop(40%, transparent),
				to(rgba(255, 255, 255, 0.1))
			)`,

		boxShadow: "$reflect",

		transition: "$transform",

		"&:hover": {
			transition: "$transform",
			transform: "scale(1.04)",
		},
	},

	p: {
		fontFamily: "$primary",
		textAlign: "center",
		margin: "2rem 1rem",
		fontSize: "1.1rem",
		wordWrap: "normal",
		color: "$text",
	},

	span: {
		fontFamily: "$primary",
		textAlign: "center",
		margin: "1rem auto",
		wordWrap: "normal",
		fontSize: "1rem",
		color: "$text",
	},
});

export const Button = styled("button", {
	display: "flex", // row
	justifyContent: "center",
	alignItems: "center",
	width: 160,
	height: 42,

	fontFamily: "$primary",
	textAlign: "center",
	fontSize: "1rem",
	color: "$text",
	padding: 10,

	backgroundColor: "$bg-main",
	cursor: "pointer",
	borderRadius: 5,
	border: "none",

	transition: "$opacity",
	opacity: 0.65,

	"&:hover": {
		transition: "$opacity",
		opacity: 1,
	},
});
