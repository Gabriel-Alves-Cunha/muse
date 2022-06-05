import { MainArea } from "@components/MainArea";
import { styled } from "@styles/global";

export const Wrapper = styled(MainArea, {
	pos: "relative",
	d: "flex",
	fd: "column",
	h: "100vh",
	w: "100%",

	oy: "auto",
	scroll: 5,
});

export const Box = styled("div", {
	dflex: "center",
	w: "100%",
});

export const SearchWrapper = styled("div", {
	pos: "relative",
	dflex: "center",
	w: "80%",
	h: 60,

	"& p": {
		pos: "absolute",
		mt: "4rem",

		ff: "$secondary",
		ls: "0.03rem",
		fs: "0.9rem",
		c: "red",
		fw: 300,
	},
});

export const Searcher = styled("button", {
	pos: "relative",
	d: "flex", // row
	justifyContent: "flex-start",
	alignItems: "center",
	w: "100%",
	h: 40,

	b: "1px solid lightgray",
	cursor: "text",
	bg: "none",
	br: 20,

	"& svg": {
		c: "$text",
		ml: 10,
	},

	input: {
		ff: "$secondary",
		ls: "0.03rem",
		fs: "0.9rem",
		c: "$text",

		boxSizing: "border-box",
		size: "100%",

		bg: "none",
		b: "none",
		br: 15,
		px: 10,
	},
});

export const ResultContainer = styled("div", {
	dcolumn: "center",
	mb: "1.3rem",
	mt: 30,

	img: {
		objectFit: "cover",
		d: "flex",
		h: 168,
		w: 300,

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
		m: "2rem 1rem",

		wordWrap: "normal",
		ff: "$primary",
		ta: "center",
		fs: "1.1rem",
		c: "$text",
	},

	span: {
		m: "1rem auto",

		wordWrap: "normal",
		ff: "$primary",
		color: "$text",
		ta: "center",
		fs: "1rem",
	},
});

export const LoadingWrapper = styled("div", {
	size: 25,
	ml: 10,
});
