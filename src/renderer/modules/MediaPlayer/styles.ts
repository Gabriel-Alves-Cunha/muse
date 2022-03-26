import { styled } from "@styles/global";

import { DECORATIONS_HEADER_HEIGHT } from "@components/Decorations/styles";
import { theme } from "@styles/theme";

export const Wrapper = styled("div", {
	display: "flex",
	flexDirection: "column",
	justifyContent: "space-between",
	alignItems: "center",
	position: "absolute",

	height: `calc(100vh - ${DECORATIONS_HEADER_HEIGHT})`,
	width: "25vw",
	zIndex: 30,
	right: 0,

	backgroundColor: theme.colors.accentLight,
	padding: "0.8rem",
	border: "none",

	backdropFilter: "blur(5px)",
});

export const Img = styled("div", {
	display: "flex",
	justifyContent: "center",
	alignItems: "center",

	marginLeft: "1%",
	minWidth: 70,
	height: 70,

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
	maxHeight: "100%",
	marginLeft: "3%",
	width: "100%",

	span: {
		"&.title": {
			fontFamily: "$fontFamily",
			color: theme.colors.text,
			letterSpacing: "0.03em",
			fontSize: "1.1rem",
			fontWeight: 500,

			overflowY: "hidden",
			maxHeight: 70,
		},

		"&.subtitle": {
			color: theme.colors.grayText,
			fontFamily: "$fontFamily",
			letterSpacing: "0.03em",
			fontSize: "0.9rem",
			fontWeight: 400,

			overflowY: "hidden",
		},
	},
});

export const Controls = styled("div", {
	display: "flex",
	flexDirection: "row",
	justifyContent: "center",
	alignItems: "center",
	marginLeft: "10%",
	gap: 10,

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

export const SeekerContainer = styled("div", {
	display: "flex",
	flexDirection: "row",
	justifyContent: "space-between",
	alignItems: "center",
	height: "1rem",
	width: 275,

	span: {
		color: theme.colors.grayText,
		fontFamily: "$fontFamily",
		letterSpacing: "0.03em",
		textAlign: "center",
		fontSize: "1rem",

		backgroundColor: "transparent",
		border: "none",
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
