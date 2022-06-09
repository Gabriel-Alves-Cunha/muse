import { DECORATIONS_HEIGHT } from "@components/Decorations/styles";
import { styled } from "@styles/global";

const padding = "10px";

export const Wrapper = styled("div", {
	gridArea: "media-player",

	pos: "relative",
	d: "inline-block",

	justifyItems: "center", // for grid: row
	alignItems: "center", // for grid: column

	justifySelf: "center", // for grid: row
	alignSelf: "start", // for grid: column

	h: `calc(100vh - ${DECORATIONS_HEIGHT})`,
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

export const OptionsAndAlbum = styled("div", {
	d: "flex", // row
	justifyContent: "space-between",
	alignItems: "center",
});

export const Album = styled("span", {
	c: "$media-player-icons",
	ff: "$secondary",
	ls: "0.04rem",
	fs: "1rem",
	fw: 500,
});

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

export const ControlsAndSeekerContainer = styled("div", {
	pos: "absolute",
	d: "flex",
	fd: "column",
	bottom: 40,

	w: `calc(100% - 2 * ${padding})`,
});

export const SeekerContainer = styled("div", {
	d: "flex",
	fd: "column",
	w: "100%",

	px: 10,
	gap: 7,
});

export const Duration = styled("div", {
	d: "flex", // row
	justifyContent: "space-between",
	alignItems: "center",

	"& p": {
		c: "$media-player-icons",
		ff: "$primary",
		ls: "0.03em",
		ta: "center",
		fs: "1rem",

		bg: "transparent",
		b: "none",
	},
});

export const ControlsButtonsWrapper = styled("div", {
	d: "flex", // row
	justifyContent: "space-between",
	alignItems: "center",
	mt: "10%",
});

export const ControlsWrapper = styled("div", {
	pos: "relative",
	dflex: "center",
	// Accounting for all the buttons:
	w: "calc(30px + 5px + 50px + 5px + 30px)",
});

export const TooltipCircleIconButton = styled("button", {
	pos: "relative",
	dflex: "center",

	c: "$media-player-icons",
	cursor: "pointer",
	bg: "none",
	br: "50%",
	b: "none",

	transition: "$bgc",

	"&:hover": { transition: "$bgc", bg: "$media-player-icon-button-hovered" },

	variants: {
		size: { small: { size: 30 }, large: { size: 50, mx: 5 } },

		"tooltip-side": {
			"left-bottom": { "&::before, &::after": { r: "50%", t: "110%" } },
			bottom: { "&::before, &::after": { t: "110%" } },
			right: { "&::before, &::after": { left: "110%" } },
			left: { "&::before, &::after": { r: "110%" } },
			top: { "&::before, &::after": { bottom: "110%" } },
		},
	},

	defaultVariants: { "tooltip-side": "bottom", size: "small" },

	////////////////////////////////////////////////
	// Tooltip:
	"&:active": { "&::before, &::after": { visibility: "hidden" } },

	"&:hover::before": { visibility: "visible", transition: "all 0.4s 1s ease " },

	"&::before, &::after": {
		visibility: "hidden",

		content: "attr(data-tooltip)",
		pos: "absolute",
		size: "auto",

		b: "1px solid white",
		bg: "#181818",
		p: "3px 8px",
		zIndex: 100,

		whiteSpace: "nowrap",
		ff: "$primary",
		lh: "normal",
		ta: "center",
		fs: "1rem",
		c: "#fff",
		fw: 500,

		pointerEvents: "none",
	},
});

export const ProgressWrapper = styled("div", {
	pos: "relative",
	d: "block",
	w: "100%",
	h: 3,

	cursor: "pointer",
	bg: "$bg-main",

	"& span": { d: "none" },

	"&:hover span": {
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

export const ProgressThumb = styled("div", {
	pos: "relative",
	bg: "$accent",
	h: "100%",
});
