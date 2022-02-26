import { styled } from "@styles/global";

import { fonts, theme } from "@styles/theme";

const HEADER_HEIGHT = 27;

export const Wrapper = styled("header", {
	height: HEADER_HEIGHT,
	position: "relative",
	display: "flex",

	backgroundColor: theme.colors.secondary,

	"-webkit-user-select": "none",
	"-webkit-app-region": "drag",
	// ^ window-draggable-region
	"user-select": "none",
});

//<{ isToClose?: boolean }>
export const WindowButton = styled("button", {
	justifyContent: "center",
	alignContent: "center",
	alignItems: "center",
	display: "flex",

	border: "none",
	color: "black",

	height: HEADER_HEIGHT,
	width: 48,

	backgroundColor: theme.colors.secondary,

	variants: {
		color: {
			true: { color: "white" },
			false: { color: "" },
		},
		backgroundColor: {
			false: { backgroundColor: "#dbdadc" },
			true: { backgroundColor: "#e70000" },
		},
	},

	"&:hover": {
		backgroundColor: "$backgroundColor",
		color: "$color",
	},
});

export const WindowButtons = styled("div", {
	display: "flex",
	flexDirection: "row-reverse",
	marginLeft: "auto",
	height: "100%",

	backgroundColor: theme.colors.secondary,
});

export const AppName_Folder_Wrapper = styled("button", {
	backgroundColor: theme.colors.secondary,
	border: "none",

	display: "flex",
	justifyContent: "center",
	alignItems: "center",
	position: "absolute",
	height: "100%",
	width: "20%",
	left: "50%",

	transform: "translate(-50%)",

	fontFamily: fonts.primary,
	color: theme.colors.text,
	letterSpacing: "0.03em",
	fontSize: "0.9em",
	fontWeight: 300,

	media: {
		small: {
			display: "none",
		},
	},
});

export const AppIcon = styled("div", {
	display: "flex",
	justifyContent: "center",
	alignItems: "center",

	marginLeft: 7,
});
