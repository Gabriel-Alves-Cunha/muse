import { styled } from "@styles/global";
import { color } from "@styles/theme";

export const Wrapper = styled("section", {
	display: "flex",
	position: "relative",
	flexDirection: "column",
	justifyContent: "flex-start",

	height: "calc(100vh - 20vh)",
	width: "100%",

	overflowY: "hidden",

	/* width */
	"::-webkit-scrollbar": {
		height: 5,
		width: 5,
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
});

export const SearchWrapper = styled("div", {
	display: "flex",
	position: "relative",
	flexDirection: "row",
	justifyContent: "center",
	alignItems: "center",

	padding: "0 5%",
	height: 60,

	p: {
		fontFamily: "$fontFamily",
		letterSpacing: "0.02rem",
		position: "absolute",
		fontSize: "0.8rem",
		marginTop: "4rem",
		color: "red",
	},
});

export const Searcher = styled("button", {
	position: "relative",
	display: "flex",
	flexDirection: "row",
	justifyContent: "flex-start",
	alignItems: "center",

	background: "transparent",
	width: "80%",
	height: 40,

	borderRadius: 10,
	border: `1px solid ${color("text")}`,
	cursor: "text",

	"& svg": {
		transition: "opacity .2s ease-in-out 20ms",
		color: color("text"),
		marginLeft: "10px",
		opacity: 0.5,
	},

	"&:hover svg": {
		opacity: 1,
	},

	"&::after": {
		transition: "opacity .2s ease-in-out 20ms",
		opacity: 0.5,
	},

	"&:hover::after": {
		opacity: 1,
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
		paddingRight: 10,
		paddingLeft: 10,

		"&::placeholder": {
			color: "#ccc",
		},

		"&::after": {
			transition: "opacity .2s ease-in-out 20ms",
			opacity: 0.5,
		},

		"&:hover": {
			opacity: 1,

			"&::placeholder": {
				color: color("text"),
			},
		},
	},
});

export const ResultContainer = styled("div", {
	display: "flex",
	flexDirection: "column",
	justifyContent: "center",
	marginBottom: "1.3rem",
	alignItems: "center",

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

		transition: "transform 0.2s ease-in-out 17ms",

		"&:hover": {
			transform: "scale(1.04)",
		},
	},

	p: {
		fontFamily: "$fontFamily",
		textAlign: "center",
		margin: "2rem 1rem",
		fontSize: "1.1rem",

		wordWrap: "normal",
		color: color("text"),
	},

	span: {
		fontFamily: "$fontFamily",
		textAlign: "center",
		margin: "1rem auto",
		fontSize: "1rem",

		wordWrap: "normal",
		color: color("text"),
	},
});

export const Button = styled("button", {
	display: "flex", // row
	justifyContent: "center",
	alignItems: "center",
	width: 160,
	height: 42,

	fontFamily: "$fontFamily",
	textAlign: "center",
	fontSize: "1rem",
	padding: 10,

	backgroundColor: color("bgMain"),
	boxShadow: "$small",
	cursor: "pointer",
	color: "black",

	borderRadius: 5,
	border: "none",

	"&:hover": {
		transition: "opacity 0.3s ease-in-out 17ms",
		boxShadow: "$insetSmall",
	},
});
