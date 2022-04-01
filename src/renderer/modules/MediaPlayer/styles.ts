import { DECORATIONS_HEADER_HEIGHT } from "@components/Decorations/styles";
import { styled } from "@styles/global";
import { color } from "@styles/theme";

export const Wrapper = styled("div", {
	position: "absolute",
	display: "flex",
	justifyContent: "flex-start",
	flexDirection: "column",
	alignContent: "center",

	height: `calc(100vh - ${DECORATIONS_HEADER_HEIGHT})`,
	width: "25vw",
	zIndex: 30,
	right: 0,

	backgroundColor: color("bgMediaPlayer"),
	padding: "1rem",
	border: "none",
});

// TODO: make it a square
export const ImgContainer = styled("div", {
	display: "flex",
	justifyContent: "center",
	alignItems: "center",
	alignSelf: "center",

	marginTop: "15%",
	height: "25vw",
	width: "25vw",

	boxShadow: "$whiteGlowAroundComponent",
	borderRadius: 17,
	border: "none",

	img: {
		objectFit: "cover",
		size: "100%",

		borderRadius: 17,
		border: "none",
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
		justifyContent: "center",
		alignItems: "center",
		display: "flex",
		width: "100%",

		"&.title": {
			fontFamily: "$fontFamily",
			letterSpacing: "0.03em",
			color: color("text"),
			fontSize: "1.1rem",
			fontWeight: 500,

			overflowY: "hidden",
		},

		"&.subtitle": {
			fontFamily: "$fontFamily",
			color: color("grayText"),
			letterSpacing: "0.03em",
			fontSize: "0.9rem",
			fontWeight: 400,

			overflowY: "hidden",
		},
	},
});

export const SeekerContainer = styled("div", {
	display: "flex",
	flexDirection: "row",
	justifyContent: "space-between",
	alignItems: "center",
	height: "1rem",
	width: "100%",

	marginTop: "5vh",

	span: {
		fontFamily: "$fontFamily",
		color: color("grayText"),
		letterSpacing: "0.03em",
		textAlign: "center",
		fontSize: "1rem",

		backgroundColor: "transparent",
		border: "none",
	},
});

export const Controls = styled("div", {
	display: "flex", // row
	justifyContent: "space-between",
	alignItems: "center",
	gap: 10,

	"> div": {
		display: "flex", // row
		justifyContent: "center",
		alignItems: "center",
	},

	"#loop": {},

	"#random": {},

	span: {
		display: "flex", // row
		justifyContent: "center",
		alignItems: "center",

		"&.previous-or-next": {
			color: color("text"),
			borderRadius: "50%",
			cursor: "pointer",
			size: 40,

			// TODO: see if this works
			"&:hover": "$scaleTransition",
		},

		"&.play-pause": {
			color: color("text"),
			borderRadius: "50%",
			cursor: "pointer",
			size: 50,

			"&:hover": {
				transition: "$scale",
				transform: "scale(1.1)",
			},
		},
	},
});

export const ProgressWrapper = styled("div", {
	display: "block",
	width: 200,
	height: 3,

	backgroundColor: "rgba(125, 125, 125, 0.6)",
	cursor: "pointer",
	margin: "0 7px",
});

export const OptionsAndAlbum = styled("div", {
	display: "flex", // row
	justifyContent: "space-between",
	alignItems: "center",
});
