import { MainArea } from "@components/MainArea";
import { styled } from "@styles/global";

export const Wrapper = styled(MainArea, {
	pos: "relative",
	d: "flex",
	fd: "column",
	h: "100vh",
	w: "100%",

	overflowY: "auto",

	/* width */
	"&::-webkit-scrollbar": {
		d: "block",
		size: 5,
	},

	/* Track */
	"&::-webkit-scrollbar-track": {
		bg: "$scrollbar",
	},

	/* Handle */
	"&::-webkit-scrollbar-thumb": {
		bg: "$scrollbar-thumb",
	},

	/* Handle on hover */
	"&::-webkit-scrollbar-thumb:hover": {
		bg: "$scrollbar-thumb-hover",
	},
});

export const Box = styled("div", {
	d: "flex", // row
	justifyContent: "center",
	alignItems: "center",
	w: "100%",
});

export const SearchWrapper = styled("div", {
	pos: "relative",
	d: "flex", // row
	justifyContent: "center",
	alignItems: "center",
	w: "80%",
	h: 60,

	"& p": {
		pos: "absolute",
		mt: "4rem",

		ls: "0.03rem",
		ff: "$secondary",
		fs: "0.9rem",
		fw: 300,
		c: "red",
	},
});

export const Searcher = styled("button", {
	pos: "relative",
	d: "flex", // row
	justifyContent: "flex-start",
	alignItems: "center",

	bg: "transparent",
	w: "100%",
	h: 40,

	b: "1px solid lightgray",
	br: 20,
	cursor: "text",

	transition: "$opacity",
	opacity: 0.8,

	"&:hover": {
		opacity: 1,
	},

	"& svg": {
		ml: 10,
		c: "$text",
		opacity: 0.8,
	},

	"&:hover svg": {
		opacity: 1,
	},

	input: {
		ls: "0.03rem",
		ff: "$secondary",
		fs: "0.9rem",

		boxSizing: "border-box",
		size: "100%",

		bg: "transparent",
		br: 15,
		b: "none",

		c: "$text",
		opacity: 0.8,
		px: 10,

		"&::placeholder": {
			c: "$text",
		},

		"&:hover": {
			transition: "$opacity",
			opacity: 1,
		},
	},
});

export const ResultContainer = styled("div", {
	d: "flex",
	fd: "column",
	justifyContent: "center",
	alignItems: "center",
	mb: "1.3rem",
	mt: 30,

	img: {
		objectFit: "cover",
		d: "flex",
		h: 168.75,
		w: 300,

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
		fs: "1.1rem",
		wordWrap: "normal",
		c: "$text",
	},

	span: {
		ff: "$primary",
		ta: "center",
		margin: "1rem auto",
		wordWrap: "normal",
		fs: "1rem",
		color: "$text",
	},
});

export const LoadingWrapper = styled("div", {
	ml: 10,
	size: 25,
});
