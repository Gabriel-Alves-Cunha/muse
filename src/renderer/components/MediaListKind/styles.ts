// export const Title = styled("p", {
// "& .highlight": { bg: "yellowgreen" },

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

// export const SubTitle = styled("p", {
// 	c: "$alternative-text",
// });

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

export const ListWrapper = styled("div", {
	maxWidth: 600,
	h: "80vh",

	".list": { scroll: 5, willChange: "transform" },
});

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

export const RowWrapper = styled("div", {
	"&:hover, &:focus, &.active": {
		transition: "$boxShadow",
		boxShadow: "$row-wrapper",
	},

	"&.selected": {
		outline: "2px solid $selected-border",
		outlineOffset: -2,

		bg: "$bg-selected",
	},

	"&.playing": {
		outline: "2px solid $playing-border",
		outlineOffset: -2,

		bg: "$bg-playing",
	},
});

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

export const Footer = styled("div", {
	m: "unset", // Virtuoso asks for this for performance reasons

	pos: "relative",
	size: 10,

	bg: "none",
});

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

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
