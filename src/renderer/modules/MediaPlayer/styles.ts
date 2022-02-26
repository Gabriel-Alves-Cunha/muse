import { styled } from "@styles/global";

import { fonts, theme } from "@styles/theme";

export const Wrapper = styled("div", {
	display: "flex",
	flexDirection: "row",
	alignItems: "center",
	position: "absolute",

	// center itself:
	left: "50%",
	transform: "translate(-50%)",

	bottom: 25, // <-- This is being needed to push it up a little :( something with the absolute positioning...
	height: "11vh",
	width: "95vw",
	zIndex: 30,

	backgroundColor: "#e0e0e095",
	borderTopRightRadius: 40,
	borderTopLeftRadius: 40,
	padding: "0.8rem",
	border: "none",

	boxShadow: theme.boxShadows.medium,
	backdropFilter: "blur(5px)",
});

export const Img = styled("div", {
	display: "flex",
	justifyContent: "center",
	alignItems: "center",

	marginLeft: "1%",
	minWidth: 70,
	height: 70,

	borderRadius: 17,
	border: "none",

	boxShadow: "7px 7px 14px #b1b1b1, -7px -7px 14px #ffffff",

	img: {
		objectFit: "cover",
		height: 70,
		width: 70,

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

	".title": {
		fontFamily: fonts.primary,
		color: theme.colors.text,
		letterSpacing: "0.03em",
		fontSize: "1.1rem",
		fontWeight: 500,

		overflowY: "hidden",
		maxHeight: 70,
	},

	".subtitle": {
		color: theme.colors.grayText,
		fontFamily: fonts.primary,
		letterSpacing: "0.03em",
		fontSize: "0.9rem",
		fontWeight: 400,

		overflowY: "hidden",
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
	},

	".previous-or-next": {
		borderRadius: "50%",
		cursor: "pointer",
		height: 30,
		width: 30,

		"&:hover": {
			transition: "opacity 0.1s ease-in-out 17ms",
			boxShadow: theme.boxShadows.small,
		},
	},

	".play-pause": {
		borderRadius: "50%",
		color: "#27283899",
		cursor: "pointer",
		height: 40,
		width: 40,

		"&:hover": {
			boxShadow: "7px 7px 14px #b1b1b1, -7px -7px 14px #ffffff",
			transition: "opacity 0.1s ease-in-out 17ms",
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
		backgroundColor: "transparent",
		color: theme.colors.grayText,
		fontFamily: fonts.primary,
		letterSpacing: "0.03em",
		textAlign: "center",
		fontSize: "1rem",
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
