import {
	Description,
	Content,
	Overlay,
	Trigger,
	Title,
	Close,
} from "@radix-ui/react-dialog";

import { styled, keyframes } from "@styles/global";

const overlayShow = keyframes({
	"0%": { opacity: 0 },
	"100%": { opacity: 1 },
});

const contentShow = keyframes({
	"0%": {
		transform: "translate(-50%, -48%) scale(.96)",
		opacity: 0,
	},
	"100%": {
		transform: "translate(-50%, -50%) scale(1)",
		opacity: 1,
	},
});

export const StyledOverlay = styled(Overlay, {
	position: "fixed",
	display: "grid",
	placeItems: "center",
	bottom: 0,
	right: 0,
	left: 0,
	top: 0,

	background: "rgba(0, 0, 0, 0.1)",
	backdropFilter: "blur(2px)",

	overflowY: "auto",
	zIndex: 100,

	"@media (prefers-reduced-motion: no-preference)": {
		animation: `${overlayShow} 100ms cubic-bezier(0.16, 1, 0.3, 1) forwards`,
	},
});

export const StyledContent = styled(Content, {
	position: "fixed",

	// Center:
	transform: "translate(-50%, -50%)",
	left: "50%",
	top: "50%",

	maxHeight: "85vh",
	maxWidth: 450,
	minWidth: 300,
	padding: 30,

	background: "$bg-dialog",
	borderRadius: 4,
	zIndex: 150,

	boxShadow: "$dialog",

	"@media (prefers-reduced-motion: no-preference)": {
		animation: `${contentShow} 100ms cubic-bezier(0.16, 1, 0.3, 1) forwards`,
	},
});

export const StyledTitle = styled(Title, {
	margin: 0,

	ff: "$secondary",
	letterSpacing: "0.05rem",
	fontSize: "1.1rem",
	fontWeight: 600,
	color: "$text",
});

export const StyledDescription = styled(Description, {
	margin: "10px 0 20px",

	ff: "$secondary",
	letterSpacing: "0.03rem",
	color: "$gray-text",
	fontSize: "1rem",
	lineHeight: 1.5,
});

export const TriggerToRemoveMedia = styled(Trigger, {
	boxSizing: "border-box", // So that border doens't occupy space

	display: "flex", // row
	justifyContent: "space-between",
	alignItems: "center",
	height: 35,
	gap: 15,

	background: "#bb2b2e",
	padding: "0.8rem",
	cursor: "pointer",
	borderRadius: 4,
	border: "none",
	color: "white",

	letterSpacing: "0.04rem",
	fontSize: "1rem",
	fontWeight: 600,
	lineHeight: 1,

	"&:focus": {
		border: "1px solid #821e20",
	},

	"&:hover": {
		background: "#821e20",
	},
});

export const CloseIcon = styled(Close, {
	all: "unset",

	position: "absolute",
	boxSizing: "border-box", // So that border doens't occupy space
	display: "flex",
	justifyContent: "center",
	alignItems: "center",
	right: 10,
	size: 26,
	top: 10,

	borderRadius: "50%",
	cursor: "pointer",

	"& svg": {
		fill: "$accent-light",
	},

	"&:focus": {
		border: "1px solid $accent-light",
	},

	"&:hover": {
		background: "$icon-button-hovered",

		"& svg": {
			fill: "white",
		},
	},
});

export const ButtonToClose = styled(Close, {
	display: "inline-flex",
	boxSizing: "border-box", // So that border doens't occupy space
	justifyContent: "center",
	alignItems: "center",
	height: 35,

	padding: "0 15px",
	cursor: "pointer",
	borderRadius: 4,
	border: "none",

	letterSpacing: "0.04rem",
	fontSize: "1rem",
	fontWeight: 600,
	lineHeight: 1,

	"&#delete-media": {
		background: "#bb2b2e",
		color: "white",

		"&:focus": {
			border: "1px solid #821e20",
		},

		"&:hover": {
			background: "#821e20",
		},
	},

	"&#cancel": {
		background: "transparent",
		color: "#2c6e4f",

		"&:focus": {
			border: "1px solid #c6dbce",
		},

		"&:hover": {
			background: "#c6dbce",
		},
	},

	"&#save-changes": {
		background: "#ddf4e5",
		color: "#2c6e4f",

		"&:focus": {
			border: "1px solid #c6dbce",
		},

		"&:hover": {
			background: "#c6dbce",
		},
	},

	"&#reset-app-data": {
		background: "#94a59b",
		color: "black",
		margin: "10px 0",
		fw: 500,

		"&:focus": {
			border: "1px solid #c6dbce",
		},

		"&:hover": {
			background: "#c6dbce",
		},
	},

	"&#reload-window": {
		background: "#94a59b",
		color: "black",
		fw: 500,

		"&:focus": {
			border: "1px solid #c6dbce",
		},

		"&:hover": {
			background: "#c6dbce",
		},
	},
});

export const Flex = styled("div", {
	display: "flex",
	justifyContent: "flex-end",
	marginTop: 25,
	gap: 20,
});

export const Fieldset = styled("fieldset", {
	all: "unset",

	display: "flex",
	alignItems: "center",
	height: 37,

	marginBottom: 15,
	gap: 20,
});

export const Label = styled("label", {
	display: "flex",
	width: 90,

	ff: "$secondary",
	letterSpacing: "0.03rem",
	color: "$accent-light",
	ta: "right",
	fontSize: 15,
});

export const Input = styled("input", {
	all: "unset",

	display: "inline-flex",
	flex: 1,
	justifyContent: "center",
	alignItems: "center",
	width: "100%",
	height: 35,

	border: "2px solid $input-border",
	borderRadius: "0.75rem",
	padding: "0 10px",

	letterSpacing: "0.035rem",
	color: "$input-text",
	ff: "$secondary",
	fontSize: "1rem",
	lineHeight: 1,

	transition: "all 250ms ease",

	"&:focus": {
		borderColor: "$input-border-active",
	},

	"&:readonly": {
		border: "none",
	},
});
