import { TOP_DECORATIONS_HEIGHT } from "@components/Decorations/styles";
import { styled } from "@styles/global";

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Constants:

const padding = "10px";

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

export const Wrapper = styled("aside", {
	gridArea: "media-player",

	pos: "relative",
	d: "inline-block",

	justifyItems: "center", // for grid: row
	alignItems: "center", // for grid: column

	justifySelf: "center", // for grid: row
	alignSelf: "start", // for grid: column

	h: `calc(100vh - ${TOP_DECORATIONS_HEIGHT})`,
	w: "100%",
	padding,

	bg: "linear-gradient(to bottom, $lingrad-top, $lingrad-bottom);",

	"@media-player": {
		d: "inline-block",
		justifySelf: "center", // for grid: row
		alignSelf: "center", // for grid: column
		w: "100vw",
		h: 70,
	},

	"& svg": { c: "$media-player-icons" },
});

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

export const OptionsAndAlbum = styled("div", {
	d: "flex", // row
	justifyContent: "space-between",
	alignItems: "center",
});

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

export const Album = styled("span", {
	c: "$media-player-icons",
	ff: "$secondary",
	ls: "0.04rem",
	fs: "1rem",
	fw: 500,
});

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

export const SquareImage = styled("div", {
	pos: "relative",
	alignSelf: "center",

	bs: "$media-player-img",
	m: "25% 10% 0",
	bg: "none",
	b: "none",
	br: 17,

	"&::after": { content: "", d: "block", pb: "100%" },

	div: { pos: "absolute", dcolumn: "center", size: "100%" },

	img: { objectFit: "cover", size: "100%", br: 17 },
});

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

export const Info = styled("div", {
	dcolumn: "center",
	h: "10vh",
	w: "100%",

	mt: "3vh",

	span: {
		dflex: "center",
		w: "100%",

		c: "$media-player-icons",
		flexWrap: "wrap",
		ff: "$secondary",
		ls: "0.03rem",
		ta: "center",

		oy: "hidden",

		"&#title": { fs: "1.2rem", fw: 500 },

		"&#subtitle": { fs: "0.9rem", fw: 400 },
	},
});

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

export const ControlsAndSeekerContainer = styled("div", {
	pos: "absolute",
	d: "flex",
	fd: "column",
	w: "100%",
	bottom: 40,
});

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

export const SeekerContainer = styled("div", {
	d: "flex",
	fd: "column",
	w: "100%",

	px: 10,
	gap: 7,
});

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

export const Duration = styled("div", {
	d: "flex", // row
	justifyContent: "space-between",
	alignItems: "center",

	"& p": {
		c: "$media-player-icons",
		ff: "$primary",
		ls: "0.03rem",
		ta: "center",
		fs: "1rem",

		bg: "transparent",
		b: "none",
	},
});

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

export const ControlsButtonsWrapper = styled("div", {
	d: "flex", // row
	justifyContent: "space-between",
	alignItems: "center",
	mt: "10%",
});

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

export const ControlsWrapper = styled("div", {
	pos: "relative",
	dflex: "center",
	// Accounting for all the buttons:
	w: "calc(30px + 5px + 50px + 5px + 30px)",
});

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

export const CircledIconButton = styled("button", {
	pos: "relative",
	dflex: "center",

	c: "$media-player-icons",
	cursor: "pointer",
	bg: "none",
	br: "50%",
	b: "none",

	transition: "$bgc",

	"&:hover, &:focus": {
		transition: "$bgc",
		bg: "$media-player-icon-button-hovered",
	},

	"&:disabled": { transition: "none", cursor: "default", bg: "none" },

	variants: { size: { small: { size: 30 }, large: { size: 50, mx: 5 } } },

	defaultVariants: { size: "small" },
});

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

export const ProgressWrapper = styled("div", {
	pos: "relative",
	d: "block",
	w: "100%",
	h: 3,

	cursor: "pointer",
	bg: "$bg-main",

	"& span": { d: "none" },

	"&:hover span, &:focus span": {
		pos: "absolute",
		dflex: "center",
		bottom: 10,
		h: 20,
		w: 35,

		transition: "none",
		bg: "$bg-main",
		br: 2,

		ff: "$primary",
		ta: "center",
		fs: "0.8rem",
		c: "$text",
		fw: 500,
	},
});

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

export const LyricsWrapper = styled("div", {
	size: "100%",

	ff: "$primary",
	ls: "0.03rem",
	lh: "0.5rem",
	fs: "0.8rem",
	ta: "left",
	c: "white",
	fw: 500,

	"&.lyrics-holder": {},

	"&.lyrics": {},
});

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

export const ProgressThumb = styled("div", {
	pos: "relative",
	bg: "$accent",
	h: "100%",
});
