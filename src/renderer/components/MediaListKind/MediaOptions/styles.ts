import {
	Description,
	Content,
	Overlay,
	Title,
	Close,
} from "@radix-ui/react-dialog";

import { styled, keyframes } from "@styles/global";

export const Option = styled("button", {
	display: "flex", // row
	justifyContent: "flex-start",
	alignItems: "center",

	letterSpacing: "0.03em",
	fontFamily: "$primary",
	fontSize: "1rem",

	background: "transparent",
	color: "$text",
	width: "100%",
	height: 50,

	borderBottom: "1px solid $text",

	overflowY: "visible",
	userSelect: "text",
	padding: "0.7rem",
	cursor: "text",

	// "&::selection": {
	// 	background: "$accent",
	// 	color: "#fff",
	// },

	"&.hoverable": {
		cursor: "pointer",

		"&:hover": {
			transition: "$bgc",
			backgroundColor: "$button-hovered",
		},
	},

	span: {
		letterSpacing: "0.03em",
		fontFamily: "$primary",
		textAlign: "left",
		fontSize: "1rem",
		color: "$text",

		"&::selection": {
			background: "$accent",
			color: "#fff",
		},
	},

	"&.rm": {
		display: "flex", // row
		justifyContent: "space-between",

		background: "#bb2b2e",
		color: "white",

		"&:hover": {
			transition: "backgroundColor 0.1s ease-in-out",
			backgroundColor: "#821e20",
			cursor: "pointer",
		},
	},
});

export const Confirm = styled("div", {
	display: "flex",
	flexDirection: "column",
	alignItems: "center",
	maxHeight: 350,
	width: 320,

	letterSpacing: "0.03em",
	fontFamily: "$primary",
	textAlign: "center",
	fontSize: "1.05rem",
	flexWrap: "wrap",
	color: "$text",

	background: "$bg-main",
	borderRadius: 10,

	p: {
		padding: "0.8rem",
	},

	span: {
		display: "flex", // row
		justifyContent: "center",
		alignItems: "center",
		width: "100%",
		height: 40,

		letterSpacing: "0.03em",
		fontFamily: "$primary",
		fontSize: "1.05rem",
		fontWeight: "500",
		color: "white",

		"&.yes": {
			background: "#bb2b2e",
			marginTop: "0.8rem",
		},
		"&.no": {
			borderRadius: "0 0 10px 10px",
			background: "#219a00",
		},

		"&:hover": {
			transition: "$filter",
			filter: "brightness(1.1)",

			cursor: "pointer",
			color: "black",
		},
	},
});

/////////////////////////////////////////////////////
/////////////////////////////////////////////////////
/////////////////////////////////////////////////////

const overlayShow = keyframes({
	"0%": { opacity: 0 },
	"100%": { opacity: 1 },
});

const contentShow = keyframes({
	"0%": { opacity: 0, transform: "translate(-50%, -48%) scale(.96)" },
	"100%": { opacity: 1, transform: "translate(-50%, -50%) scale(1)" },
});

export const StyledOverlay = styled(Overlay, {
	position: "fixed",
	display: "grid",
	placeItems: "center",
	bottom: 0,
	right: 0,
	left: 0,
	top: 0,

	backgroundColor: "rgba(0, 0, 0, 0.2)",

	overflowY: "auto",
	zIndex: 100,

	"@media (prefers-reduced-motion: no-preference)": {
		animation: `${overlayShow} .15ms cubic-bezier(0.16, 1, 0.3, 1) forwards`,
	},
});

export const StyledContent = styled(Content, {
	position: "fixed",
	transform: "translate(-50%, -50%)",
	left: "50%",
	top: "50%",

	maxHeight: "85vh",
	maxWidth: 450,
	minWidth: 300,

	padding: 30,

	backgroundColor: "white",
	borderRadius: 4,
	boxShadow:
		"hsl(206 22% 7% / 35%) 0px 10px 38px -10px, hsl(206 22% 7% / 20%) 0px 10px 20px -15px",

	"@media (prefers-reduced-motion: no-preference)": {
		animation: `${contentShow} .15ms cubic-bezier(0.16, 1, 0.3, 1) forwards`,
	},

	"&:focus": { outline: "none" },
});

export const StyledTitle = styled(Title, {
	margin: 0,

	fontFamily: "$secondary",
	fontWeight: 500,
	color: "$text",
	fontSize: 17,
});

export const StyledDescription = styled(Description, {
	margin: "10px 0 20px",

	fontFamily: "$secondary",
	color: "$gray-text",
	lineHeight: 1.5,
	fontSize: 15,
});

export const StyledClose = styled(Close, {
	all: "unset",

	position: "absolute",
	display: "inline-flex",
	justifyContent: "center",
	alignItems: "center",
	right: 10,
	size: 25,
	top: 10,

	borderRadius: "100%",
	color: "$gray-text",

	"&:hover": { backgroundColor: "rgba(0, 0, 0, 0.2)" },
	"&:focus": { boxShadow: "0 0 0 2px $accent" },
});
