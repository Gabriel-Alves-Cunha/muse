import {
	Description,
	Content,
	Overlay,
	Trigger,
	Title,
	Close,
} from "@radix-ui/react-dialog";

import { styled, keyframes } from "@styles/global";

export const overlayShow = keyframes({
	"0%": { opacity: 0 },
	"100%": { opacity: 1 },
});

export const StyledDialogBlurOverlay = styled(Overlay, {
	pos: "fixed",
	d: "grid",
	placeItems: "center",
	bottom: 0,
	r: 0,
	l: 0,
	t: 0,

	backdropFilter: "blur(2px)",
	bg: "rgba(0, 0, 0, 0.1)",

	overflowY: "auto",
	zIndex: 100,

	animation: `${overlayShow} 90ms linear`,
});

export const StyledDialogContent = styled(Content, {
	all: "unset",

	pos: "fixed",
	d: "grid",

	// Centered:
	transform: "translate(-50%, -50%)",
	l: "50%",
	t: "50%",

	maxHeight: "85vh",
	maxWidth: 450,
	minWidth: 300,
	p: 30,

	bg: "$bg-dialog",
	bs: "$dialog",
	zIndex: 150,
	br: 4,

	animation: `${overlayShow} 90ms linear`,

	"&.delete-media": {
		pos: "fixed",
		d: "grid",
		w: 300,

		// Centered:
		transform: "translate(-50%, -50%)",
		l: "50%",
		t: "50%",

		bg: "$bg-dialog",
		bs: "$dialog",
		zIndex: 150,
		p: 30,
		br: 4,

		"& #warning": { size: 35, mr: "auto" },
	},
});

export const StyledTitle = styled(Title, {
	all: "unset",

	ff: "$primary",
	ls: "0.03rem",
	fs: "1.4rem",
	c: "$text",
	fw: 500,

	"&.subtitle": { fs: "1.1rem", "&:first-letter": { fs: "1.9rem", fw: 400 } },
});

export const StyledDescription = styled(Description, {
	margin: "10px 0 20px",

	ff: "$secondary",
	c: "$gray-text",
	ls: "0.03rem",
	fs: "1rem",
	lh: 1.5,
});

export const DialogTriggerToRemoveMedia = styled(Trigger, {
	d: "flex", // row
	justifyContent: "space-between",
	alignItems: "center",
	gap: 15,
	h: 35,

	cursor: "pointer",
	bg: "#bb2b2e",
	p: "0.8rem",
	b: "none",
	br: 4,

	ls: "0.04rem",
	fs: "1rem",
	c: "white",
	fw: 600,
	lh: 1,

	"&:hover": { bg: "#821e20" },
});

export const CloseDialog = styled(Close, {
	all: "unset",

	dflex: "center",
	h: 35,

	cursor: "pointer",
	p: "0 15px",
	b: "none",
	br: 4,

	ff: "$secondary",
	ls: "0.04rem",
	fs: "1rem",
	fw: 600,
	lh: 1,

	"&.delete-media": {
		ff: "$secondary",
		ls: "0.04rem",
		fs: "1rem",
		fw: 600,

		bg: "#bb2b2e",
		c: "white",

		"&:hover": { bg: "#821e20" },
	},

	"&#cancel": {
		ff: "$secondary",
		ls: "0.04rem",
		fs: "1rem",
		fw: 600,

		bg: "transparent",
		c: "#2c6e4f",

		"&:hover": { bg: "#c6dbce" },
	},

	"&#reset-app-data": {
		ff: "$secondary",
		ls: "0.04rem",
		fs: "1rem",
		fw: 600,

		bg: "#94a59b",
		m: "10px 0",
		c: "black",

		"&:hover": { bg: "#c6dbce" },
	},

	"&#reload-window": {
		ff: "$secondary",
		ls: "0.04rem",
		fs: "1rem",
		fw: 600,

		bg: "#94a59b",
		c: "black",

		"&:hover": { bg: "#c6dbce" },
	},

	"&#save-changes": {
		h: 35,

		ff: "$secondary",
		lh: "2.1875rem", // same as height (35px)
		ls: "0.04rem",
		fs: "1rem",
		fw: 600,

		bg: "#ddf4e5",
		c: "#2c6e4f",

		"&:hover": { bg: "#c6dbce" },
	},

	"&#close-icon": {
		all: "unset",

		pos: "absolute",
		dflex: "center",
		size: 26,
		r: 10,
		t: 10,

		cursor: "pointer",
		br: "50%",

		"& svg": { fill: "$accent-light" },

		"&:hover": { bg: "$icon-button-hovered" },
	},
});

export const FlexRow = styled("div", {
	d: "flex", // row
	justifyContent: "flex-end",

	gap: 20,
	mt: 25,
});

export const Fieldset = styled("fieldset", {
	all: "unset",

	d: "flex",
	alignItems: "center",
	h: 37,

	gap: 20,
	mb: 15,
});

export const Label = styled("label", {
	d: "flex",
	w: 90,

	c: "$accent-light",
	ff: "$secondary",
	ls: "0.03rem",
	ta: "right",
	fs: "1rem",
	fw: 500,
});

export const Input = styled("input", {
	all: "unset",

	d: "inline-flex",
	flex: 1,
	justifyContent: "center",
	alignItems: "center",
	w: "100%",
	h: 35,

	b: "2px solid $input-border",
	p: "0 10px",
	br: 12,

	whiteSpace: "nowrap",
	c: "$input-text",
	ff: "$secondary",
	ls: "0.04rem",
	fs: "1rem",
	fw: 500,
	lh: 1,

	transition: "border-color 250ms ease",

	"&:focus, &:hover": { borderColor: "$input-border-active" },

	"&:read-only": { c: "$accent-light", b: "none" },
});
