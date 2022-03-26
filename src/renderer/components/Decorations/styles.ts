import { styled } from "@styles/global";

import { theme } from "@styles/theme";

export const DECORATIONS_HEADER_HEIGHT = "27px";

export const Wrapper = styled("header", {
	position: "absolute",
	display: "flex",

	marginTop: `-${DECORATIONS_HEADER_HEIGHT}`,
	minHeight: DECORATIONS_HEADER_HEIGHT,
	width: "100%",

	backgroundColor: theme.colors.secondary,

	"-webkit-app-region": "drag",
	// ^ window-draggable-region
	"user-select": "none",
});

export const WindowButton = styled("button", {
	justifyContent: "center",
	alignContent: "center",
	alignItems: "center",
	display: "flex",

	border: "none",
	color: "black",

	height: DECORATIONS_HEADER_HEIGHT,
	width: 48,

	backgroundColor: theme.colors.secondary,

	"&.close:hover": {
		backgroundColor: "#e70000",
		color: "white",
	},

	"&:hover": {
		backgroundColor: "#dbdadc",
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

	fontFamily: "$fontFamily",
	color: theme.colors.text,
	letterSpacing: "0.03em",
	fontSize: "0.9em",
	fontWeight: 300,

	"@sm": {
		display: "none",
	},
});

export const AppIcon = styled("div", {
	display: "flex",
	justifyContent: "center",
	alignItems: "center",

	marginLeft: 7,
});
