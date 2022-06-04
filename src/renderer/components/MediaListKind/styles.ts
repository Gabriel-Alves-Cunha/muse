import { styled } from "@styles/global";

export const Img = styled("div", {
	$$size: "45px",

	dflex: "center",

	minWidth: "$$size",
	h: "$$size",

	b: "none",
	br: 13,
	mr: 10,

	"& img": {
		objectFit: "cover",
		size: "$$size",

		br: 13,

		"&::before": {
			d: "none",
		},
	},

	"& svg": {
		c: "$deactivated-icon",
	},
});

export const SubTitle = styled("p", {
	margin: "20px 0",

	c: "$alternative-text",
	ls: "0.03rem",
	fs: "0.9rem",
	fw: 500,
	ff: "$primary",

	"&.row": {
		c: "$gray-text",
		margin: "unset",
	},
});

export const Info = styled("div", {
	d: "flex",
	fd: "column",
	justifyContent: "center",
	alignItems: "flex-start",

	size: "calc(100% - 5px)",
	ov: "hidden",
});

export const Title = styled("p", {
	margin: "unset", // Virtuoso asks for this for performance reasons

	c: "$alternative-text",
	ls: "0.04rem",
	ff: "$secondary",
	fs: "1rem",
	fw: 500,

	textOverflow: "ellipsis",
	whiteSpace: "nowrap", // make it one-line.
	ov: "hidden",

	"& .highlight": {
		bg: "yellowgreen",
	},
});

export const ListWrapper = styled("div", {
	margin: "2rem 5%",
	maxWidth: 600,
	h: "70vh",

	"@sm": {
		margin: "0.5em 5%",
	},

	overflowX: "hidden !important",

	/* width */
	".list::-webkit-scrollbar": {
		d: "block",
		size: 5,
	},

	/* Track */
	".list::-webkit-scrollbar-track": {
		bg: "$scrollbar",
	},

	/* Handle */
	".list::-webkit-scrollbar-thumb": {
		bg: "$scrollbar-thumb",
	},

	/* Handle on hover */
	".list::-webkit-scrollbar-thumb:hover": {
		bg: "$scrollbar-thumb-hover",
	},
});

export const RowWrapper = styled("div", {
	pos: "relative",
	dflex: "center",
	w: "98%",
	h: 65,
	l: 7,

	transition: "$boxShadow",
	br: 7,
	p: 7,

	"&:hover, &:focus, &.active": {
		transition: "$boxShadow",
		boxShadow: "$row-wrapper",
	},

	"&.selected": {
		b: "2px solid $selected-border-color",
		boxShadow: "$bg-selected",
		bg: "$bg-selected",
	},

	"& button.play": {
		dflex: "center",
		h: "100%",
		w: "90%",

		bg: "transparent",
		cursor: "pointer",
		b: "none",
	},
});

export const Footer = styled("div", {
	pos: "relative",
	size: 10,

	bg: "transparent",
});

export const EmptyList = styled("div", {
	pos: "relative",
	dflex: "center",
	size: "95%",

	c: "$alternative-text",
	ff: "$secondary",
	ls: "0.04rem",
	fs: "1.1rem",
	fw: 500,

	img: {
		size: 50,
		mr: 20,
	},
});
