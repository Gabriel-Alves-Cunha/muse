import { DECORATIONS_HEADER_HEIGHT } from "@components/Decorations/styles";
import { styled } from "@styles/global";

const padding = "10px";

export const Wrapper = styled("div", {
	gridArea: "media-player",

	position: "relative",
	display: "inline-block",

	justifyItems: "center", // for grid: row
	alignItems: "center", // for grid: column

	justifySelf: "center", // for grid: row
	alignSelf: "start", // for grid: column

	height: `calc(100vh - ${DECORATIONS_HEADER_HEIGHT})`,
	width: "100%",
	padding,

	background: "linear-gradient(to bottom, $lingrad-1, $lingrad-2);",

	"@media-player": {
		display: "inline-block",
		justifySelf: "center", // for grid: row
		alignSelf: "center", // for grid: column
		width: "100vw",
		height: 70,
	},

	"& svg": {
		color: "$media-player-icons",
	},
});

export const OptionsAndAlbum = styled("div", {
	display: "flex", // row
	justifyContent: "space-between",
	alignItems: "center",
});

export const Album = styled("span", {
	letterSpacing: "0.04rem",
	fontFamily: "$secondary",
	fontSize: "1rem",
	fontWeight: 500,
	color: "$text",
});

/** You need to set the width! */
export const IconButton = styled("button", {
	position: "relative",
	display: "flex", // row
	justifyContent: "center",
	alignItems: "center",

	background: "transparent",
	borderRadius: "50%",
	cursor: "pointer",
	border: "none",

	transition: "$bgc",

	"&:hover": {
		transition: "$bgc",
		background: "$icon-button-hovered",
	},

	// Hack to make the height the same size as the width:
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

	background: "transparent",
	boxShadow: "$media-player-img",
	borderRadius: 17,
	border: "none",

	"&:after": {
		content: "",
		display: "block",
		pb: "100%",
	},

	div: {
		position: "absolute",
		display: "flex", // row
		justifyContent: "center",
		alignItems: "center",
		size: "100%",
	},

	img: {
		objectFit: "cover",
		size: "100%",
	},
});

export const Info = styled("div", {
	display: "flex",
	flexDirection: "column",
	justifyContent: "center",
	alignItems: "center",
	height: "10vh",
	width: "100%",

	marginTop: "3vh",

	span: {
		display: "flex", // row
		justifyContent: "center",
		alignItems: "center",
		width: "100%",

		letterSpacing: "0.03rem",
		fontFamily: "$secondary",
		textAlign: "center",
		flexWrap: "wrap",
		color: "white",

		overflowY: "hidden",

		"&#title": {
			fontSize: "1.2rem",
			fontWeight: 500,
		},

		"&#subtitle": {
			fontSize: "0.9rem",
			fontWeight: 400,
		},
	},
});

export const ControlsAndSeekerContainer = styled("div", {
	position: "absolute",
	display: "flex",
	flexDirection: "column",
	bottom: 40,

	width: `calc(100% - 2 * ${padding})`,
});

export const SeekerContainer = styled("div", {
	display: "flex", // row
	justifyContent: "space-between",
	alignItems: "center",
	height: "1rem",
	width: "100%",

	marginTop: "5vh",

	span: {
		letterSpacing: "0.03em",
		fontFamily: "$primary",
		textAlign: "center",
		fontSize: "1rem",
		color: "white",

		background: "transparent",
		border: "none",
	},
});

export const ControlsButtonsWrapper = styled("div", {
	display: "flex", // row
	justifyContent: "space-between",
	alignItems: "center",
	mt: "10%",
});

export const ControlsWrapper = styled("div", {
	display: "inline-flex", // row
	justifyContent: "center",
	alignItems: "center",
	width: "100%",

	gap: "5%",
});

export const ButtonForRandomAndLoop = styled("button", {
	display: "flex", // row
	justifyContent: "center",
	alignItems: "center",
	size: 25,

	background: "transparent",
	cursor: "pointer",
	border: "none",

	willChange: "transform",
	transition: "$scale",

	"&:hover": {
		transition: "$scale",
		transform: "scale(1.5)",
	},
});

export const ProgressWrapper = styled("div", {
	position: "relative",
	display: "block",
	width: 200,
	height: 3,

	background: "$bg-main",
	cursor: "pointer",
	margin: "0 7px",

	"& span": {
		display: "none",
	},

	"&:hover span": {
		position: "absolute",
		display: "flex", // row
		justifyContent: "center",
		alignItems: "center",
		bottom: 10,
		height: 20,
		width: 35,

		background: "$bg-main",
		borderRadius: 2,

		fontFamily: "$primary",
		textAlign: "center",
		fontSize: "0.8rem",
		fontWeight: 500,
		color: "$text",
	},
});

export const ProgressThumb = styled("div", {
	background: "$accent",
	height: "100%",
});
