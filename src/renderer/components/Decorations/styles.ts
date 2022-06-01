import { styled } from "@styles/global";

export const DECORATIONS_HEIGHT = "27px";

export const Wrapper = styled("header", {
	pos: "absolute",
	d: "flex", // row

	mt: `-${DECORATIONS_HEIGHT}`,
	h: DECORATIONS_HEIGHT,
	w: "100vw",

	bg: "$bg-main",

	"-webkit-app-region": "drag",
	// ^ window-draggable-region
	userSelect: "none",
});

export const WindowButtons = styled("div", {
	d: "flex",
	fd: "row-reverse",
	ml: "auto",
	h: "100%",

	bg: "transparent",

	button: {
		dflex: "center",

		c: "$window-buttons",
		cursor: "pointer",
		b: "none",

		h: DECORATIONS_HEIGHT,
		w: 48,

		bg: "transparent",

		"&:hover": {
			bg: "$icon-button-hovered",
		},

		"&#close:hover": {
			bg: "#e70000",
			c: "white",
		},
	},
});

export const AppName_Folder_Wrapper = styled("div", {
	pos: "absolute",
	dflex: "center",
	h: "100%",
	w: "20%",

	transform: "translate(-50%)",
	l: "50%",

	bg: "transparent",
	b: "none",

	ff: "$primary",
	ls: "0.03rem",
	fs: "0.93rem",
	c: "$text",
	fw: 300,

	"@sm": {
		d: "none",
	},
});

export const AppIcon = styled("div", {
	dflex: "center",

	ml: 7,
});
