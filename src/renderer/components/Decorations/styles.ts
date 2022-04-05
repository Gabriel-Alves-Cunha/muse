import { styled } from "@styles/global";

export const DECORATIONS_HEADER_HEIGHT = "27px";

export const Wrapper = styled("header", {
	position: "absolute",
	display: "flex", // row

	marginTop: `-${DECORATIONS_HEADER_HEIGHT}`,
	minHeight: DECORATIONS_HEADER_HEIGHT,
	width: "100%",

	backgroundColor: "$bg-main",

	"-webkit-app-region": "drag",
	// ^ window-draggable-region
	"user-select": "none",
});

export const WindowButton = styled("button", {
	display: "flex", // row
	justifyContent: "center",
	alignContent: "center",
	alignItems: "center",

	border: "none",
	color: "black",

	height: DECORATIONS_HEADER_HEIGHT,
	width: 48,

	backgroundColor: "transparent",

	"&.close:hover": {
		backgroundColor: "#e70000",
		color: "white",
	},

	"&:hover": {
		backgroundColor: "$button-hovered",
	},
});

export const WindowButtons = styled("div", {
	display: "flex",
	flexDirection: "row-reverse",
	marginLeft: "auto",
	height: "100%",

	backgroundColor: "transparent",
});

export const AppName_Folder_Wrapper = styled("div", {
	position: "absolute",
	display: "flex", // row
	justifyContent: "center",
	alignItems: "center",
	height: "100%",
	width: "20%",
	left: "50%",

	backgroundColor: "transparent",
	border: "none",

	transform: "translate(-50%)",

	letterSpacing: "0.03em",
	fontFamily: "$primary",
	fontSize: "0.93em",
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
