import { DECORATIONS_HEADER_HEIGHT } from "@components/Decorations/styles";
import { styled } from "@styles/global";

const padding = "10px";

export const Wrapper = styled("div", {
	gridArea: "media-player",

	position: "relative",
	d: "inline-block",

	justifyItems: "center", // for grid: row
	alignItems: "center", // for grid: column

	justifySelf: "center", // for grid: row
	alignSelf: "start", // for grid: column

	h: `calc(100vh - ${DECORATIONS_HEADER_HEIGHT})`,
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

	"& svg": {
		color: "$media-player-icons",
	},
});

export const OptionsAndAlbum = styled("div", {
	d: "flex", // row
	justifyContent: "space-between",
	alignItems: "center",
});

export const Album = styled("span", {
	letterSpacing: "0.04rem",
	ff: "$secondary",
	fs: "1rem",
	fw: 500,
	color: "$media-player-icons",
});

/** You need to set the w! */
export const IconButton = styled("button", {
	position: "relative",
	d: "flex", // row
	justifyContent: "center",
	alignItems: "center",

	bg: "transparent",
	br: "50%",
	cursor: "pointer",
	b: "none",

	transition: "$bgc",

	"&:hover": {
		transition: "$bgc",
		bg: "$media-player-icon-button-hovered",
	},

	// Hack to make the h the same size as the w:
	"&:before": {
		content: "",
		float: "left",
		pt: "100%", // ratio of 1:1
	},
});

export const SquareImage = styled("div", {
	position: "relative",
	alignSelf: "center",

	mt: "25%",
	mx: "10%",

	bs: "$media-player-img",
	bg: "transparent",
	b: "none",
	br: 17,

	"&:after": {
		content: "",
		d: "block",
		pb: "100%",
	},

	div: {
		position: "absolute",
		dcolumn: "center",
		size: "100%",
	},

	img: {
		objectFit: "cover",
		size: "100%",

		br: 17,
	},
});

export const Info = styled("div", {
	d: "flex",
	dcolumn: "center",
	h: "10vh",
	w: "100%",

	mt: "3vh",

	span: {
		dflex: "center",
		w: "100%",

		color: "$media-player-icons",
		letterSpacing: "0.03rem",
		flexWrap: "wrap",
		ff: "$secondary",
		ta: "center",

		oy: "hidden",

		"&#title": {
			fs: "1.2rem",
			fw: 500,
		},

		"&#subtitle": {
			fs: "0.9rem",
			fw: 400,
		},
	},
});

export const ControlsAndSeekerContainer = styled("div", {
	position: "absolute",
	d: "flex",
	fd: "column",
	bottom: 40,

	w: `calc(100% - 2 * ${padding})`,
});

export const SeekerContainer = styled("div", {
	display: "flex",
	flexDirection: "column",
	w: "100%",

	px: 10,
	gap: 7,
});

export const Duration = styled("div", {
	d: "flex", // row
	justifyContent: "space-between",
	alignItems: "center",

	"& p": {
		color: "$media-player-icons",
		letterSpacing: "0.03em",
		ff: "$primary",
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
	d: "inline-flex", // row
	justifyContent: "center",
	alignItems: "center",
	w: "100%",

	gap: "5%",
});

export const ButtonForRandomAndLoop = styled("button", {
	dflex: "center",
	size: 25,

	bg: "transparent",
	cursor: "pointer",
	b: "none",

	willChange: "transform",
	transition: "$scale",

	"&:hover": {
		transition: "$scale",
		transform: "scale(1.5)",
	},
});

export const ProgressWrapper = styled("div", {
	position: "relative",
	d: "block",
	w: "100%",
	h: 3,

	cursor: "pointer",
	bg: "$bg-main",

	"& span": {
		display: "none",
	},

	"&:hover span": {
		position: "absolute",
		display: "block",
		bottom: 10,
		h: 20,
		w: 35,

		bg: "$bg-main",
		br: 2,

		color: "$text",
		ff: "$primary",
		ta: "center",
		fs: "0.8rem",
		fw: 500,
	},
});

export const ProgressThumb = styled("div", {
	position: "relative",
	bg: "$accent",
	h: "100%",
});
