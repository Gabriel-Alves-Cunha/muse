import { styled } from "@styles/global";

export const Img = styled("div", {
	m: "unset", // Virtuoso asks for this for performance reasons

	$$size: "45px",

	dflex: "center",
	minWidth: "$$size",
	size: "$$size",

	b: "none",
	br: 13,

	"& img": {
		objectFit: "cover",
		size: "$$size",

		br: 13,

		"&::before": { d: "none" },
	},

	"& svg": { c: "$deactivated-icon" },
});

export const Info = styled("div", {
	m: "unset", // Virtuoso asks for this for performance reasons

	d: "flex",
	fd: "column",
	justifyContent: "center",
	alignItems: "flex-start",
	size: "95%",

	ov: "hidden",
	pl: 20,
});

export const Title = styled("p", {
	m: "unset", // Virtuoso asks for this for performance reasons

	c: "$alternative-text",
	ff: "$secondary",
	ls: "0.04rem",
	fs: "1rem",
	fw: 500,

	textOverflow: "ellipsis",
	whiteSpace: "nowrap", // make it one-line.
	ov: "hidden",

	"& .highlight": { bg: "yellowgreen" },
});

export const SubTitle = styled("p", {
	m: "unset", // Virtuoso asks for this for performance reasons

	c: "$alternative-text",
	ff: "$primary",
	ls: "0.03rem",
	fs: "0.9rem",
	fw: 500,

	"&.row": { c: "$gray-text", m: "unset" },
});

export const ListWrapper = styled("div", {
	maxWidth: 600,
	h: "80vh",

	".list": { scroll: 5, willChange: "transform" },
});

export const RowWrapper = styled("div", {
	m: "unset", // Virtuoso asks for this for performance reasons

	pos: "relative",
	d: "flex",
	justifyContent: "flex-start",
	alignItems: "center",
	w: "98%",
	h: 65,
	l: 7,

	transition: "none",
	br: 7,
	p: 7,

	"&:hover, &:focus, &.active": {
		transition: "$boxShadow",
		boxShadow: "$row-wrapper",
	},

	"&.selected": {
		b: "2px solid $selected-border",
		bg: "$bg-selected",
	},
});

export const PlayButton = styled("button", {
	pos: "relative",
	dflex: "center",
	h: "100%",
	w: "90%",

	cursor: "pointer",
	bg: "none",
	b: "none",
});

export const Footer = styled("div", {
	m: "unset", // Virtuoso asks for this for performance reasons

	pos: "relative",
	size: 10,

	bg: "none",
});

export const EmptyList = styled("div", {
	m: "unset", // Virtuoso asks for this for performance reasons

	pos: "relative",
	dflex: "center",
	size: "95%",

	c: "$alternative-text",
	ff: "$secondary",
	ls: "0.04rem",
	fs: "1.1rem",
	fw: 500,

	img: { size: 50, mr: 20 },
});
