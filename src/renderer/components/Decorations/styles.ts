import { styled } from "@styles/global";

export const DECORATIONS_HEADER_HEIGHT = "27px";

export const Wrapper = styled("header", {
	position: "absolute",
	display: "flex", // row

	marginTop: `-${DECORATIONS_HEADER_HEIGHT}`,
	minHeight: DECORATIONS_HEADER_HEIGHT,
	width: "100%",

	background: "$bg-main",

	"-webkit-app-region": "drag",
	// ^ window-draggable-region
	"user-select": "none",
});

export const WindowButton = styled("button", {
	display: "flex", // row
	justifyContent: "center",
	alignContent: "center",
	alignItems: "center",

	color: "$window-buttons",
	cursor: "pointer",
	border: "none",

	height: DECORATIONS_HEADER_HEIGHT,
	width: 48,

	background: "transparent",

	"&:hover": {
		background: "$icon-button-hovered",
	},

	"&#close:hover": {
		background: "#e70000",
		color: "white",
	},
});

export const WindowButtons = styled("div", {
	display: "flex",
	flexDirection: "row-reverse",
	marginLeft: "auto",
	height: "100%",

	background: "transparent",
});

export const AppName_Folder_Wrapper = styled("div", {
	position: "absolute",
	display: "flex", // row
	justifyContent: "center",
	alignItems: "center",
	height: "100%",
	width: "20%",
	left: "50%",

	transform: "translate(-50%)",

	background: "transparent",
	border: "none",

	letterSpacing: "0.03rem",
	ff: "$primary",
	fontSize: "0.93rem",
	fontWeight: 300,
	color: "$text",

	"@sm": {
		display: "none",
	},
});

export const AppIcon = styled("div", {
	display: "flex", // row
	justifyContent: "center",
	alignItems: "center",

	marginLeft: 7,
});
