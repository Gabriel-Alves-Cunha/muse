import { styled } from "@styles/global";

import { fonts, theme } from "@styles/theme";

export const Nav = styled("nav", {
	display: "flex",
	flexDirection: "column",
	alignContent: "center",

	height: "100vh",
	width: 170,

	backgroundColor: theme.colors.bgNav,

	"&.active": {
		outline: `3px solid ${theme.colors.bgCentral}`,
		outlineOffset: -3,

		background: "white",

		boxShadow: theme.boxShadows.small,
	},

	media: {
		small: {
			width: 30,

			"&.active": {
				boxShadow: "none",
				outline: "none",

				backgroundColor: theme.colors.accentAlpha,
			},

			button: {
				justifyContent: "center",

				height: 42,
				width: 30,

				padding: 0,
				margin: 0,

				boxShadow: "none",
				borderRadius: 0,

				"&:hover": {
					boxShadow: "none",
				},

				div: {
					// Text
					display: "none",
				},

				span: {
					// svg
					color: "black",
					margin: 0,
				},
			},
		},
	},
});

export const FolderButton = styled("button", {
	display: "flex", // row,
	alignItems: "center",
	width: 160,
	height: 42,

	backgroundColor: "transparent",
	cursor: "pointer",
	fontSize: "1rem",
	padding: 10,
	margin: 5,

	borderRadius: 5,
	border: "none",

	span: {
		display: "flex",
		alignItems: "center",

		marginRight: 10,
	},

	"&:hover": {
		"&:not(&.active)": {
			transition: "box-shadow 0.2s",
			boxShadow: theme.boxShadows.inset_small,
		},
	},
});

export const Text = styled("div", {
	fontFamily: fonts.primary,
	color: theme.colors.text,
	letterSpacing: "0.03em",
	fontSize: "1.05rem",
	textAlign: "left",
	fontWeight: 500,
});
