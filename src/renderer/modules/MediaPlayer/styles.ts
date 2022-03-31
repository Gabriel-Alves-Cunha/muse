import { styled } from "@styles/global";

import { DECORATIONS_HEADER_HEIGHT } from "@components/Decorations/styles";
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

	backgroundColor: color("accentLight"),
	padding: "1rem",
	border: "none",
});

export const ImgContainer = styled("div", {
	display: "flex",
	justifyContent: "center",
	alignItems: "center",
	alignSelf: "center",

	marginTop: "15%",
	height: "25vh",
	width: "25vh",

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
			color: color("text"),
			letterSpacing: "0.03em",
			fontSize: "1.1rem",
			fontWeight: 500,

			overflowY: "hidden",
		},

		"&.subtitle": {
			color: color("grayText"),
			fontFamily: "$fontFamily",
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
		color: color("grayText"),
		fontFamily: "$fontFamily",
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
		display: "flex",
		justifyContent: "center",
		alignItems: "center",
	},

	"#loop": {},

	"#random": {},

	span: {
		display: "flex",
		justifyContent: "center",
		alignItems: "center",

		"&.previous-or-next": {
			borderRadius: "50%",
			cursor: "pointer",
			height: 40,
			width: 40,

			"&:hover": {
				transition: "opacity 0.1s ease-in-out 17ms",
				boxShadow: "$small",
			},
		},

		"&.play-pause": {
			borderRadius: "50%",
			color: "#27283899",
			cursor: "pointer",
			height: 50,
			width: 50,

			"&:hover": {
				transition: "opacity 0.1s ease-in-out 17ms",
				boxShadow: "$whiteGlowAroundComponent",
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
