import { styled } from "@styles/global";

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Constants:

export const DOWN_DECORATIONS_HEIGHT = "20px";
export const TOP_DECORATIONS_HEIGHT = "27px";

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

export const TopWrapper = styled("header", {
	pos: "absolute",
	d: "flex", // row

	mt: `-${TOP_DECORATIONS_HEIGHT}`,
	h: TOP_DECORATIONS_HEIGHT,
	w: "100vw",

	bg: "$bg-main",

	"-webkit-app-region": "drag",
	// ^ window-draggable-region
	userSelect: "none",
});

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

export const DownWrapper = styled("footer", {
	pos: "relative", // For some reason 'absolute' makes it behave weird with the ctx menu...
	d: "flex", // row
	justifyContent: "space-between",
	alignItems: "center",

	h: DOWN_DECORATIONS_HEIGHT,
	w: "100vw",
	bottom: 0,

	userSelect: "none",
	bg: "$scrollbar",

	"& p": {
		dflex: "center",
		h: "100%",

		c: "$alternative-text",
		ff: "$secondary",
		ls: "0.03rem",
		fs: "0.9rem",
		ta: "center",
		fw: 500,
	},
});

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

const gap = "12px";

export const LeftSlot = styled("div", {
	d: "flex", // row
	justifyContent: "left",
	alignItems: "center",

	gap,

	"&:first-child": { pl: gap },
});

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

export const RightSlot = styled("div", {
	d: "flex", // row
	justifyContent: "left",
	alignItems: "center",

	gap,

	"&:last-child": { pr: gap },
});

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

export const WindowButtonsWrapper = styled("div", {
	d: "flex",
	fd: "row-reverse",
	ml: "auto",
	h: "100%",

	bg: "none",
});

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

export const WindowButton = styled("button", {
	pos: "relative",
	dflex: "center",
	h: TOP_DECORATIONS_HEIGHT,
	w: 48,

	c: "$window-buttons",
	cursor: "pointer",
	bg: "none",
	b: "none",

	transition: "none !important",

	"&:hover, &:focus": { bg: "$icon-button-hovered" },

	"&#close:hover, &#close:focus": { bg: "#e70000", c: "white" },
});

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

export const AppName_Folder_Wrapper = styled("div", {
	pos: "absolute",
	dflex: "center",
	h: "100%",
	w: "20%",

	transform: "translate(-50%)",
	l: "50%",

	bg: "transparent",
	b: "none",

	whiteSpace: "nowrap",
	ff: "$primary",
	ls: "0.03rem",
	fs: "0.93rem",
	c: "$text",
	fw: 300,

	"@sm": { d: "none" },
});

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

export const AppIcon = styled("div", { dflex: "center", ml: 7 });
