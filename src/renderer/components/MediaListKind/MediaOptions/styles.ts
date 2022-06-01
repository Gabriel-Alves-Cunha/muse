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

export const StyledOverlay = styled(Overlay, {
	pos: "fixed",
	d: "grid",
	placeItems: "center",
	bottom: 0,
	r: 0,
	left: 0,
	t: 0,

	bg: "rgba(0, 0, 0, 0.1)",
	backdropFilter: "blur(2px)",

	overflowY: "auto",
	zIndex: 100,

	animation: `${overlayShow} 80ms linear`,
});

export const StyledContent = styled(Content, {
	all: "unset",

	pos: "fixed",
	d: "grid",

	// Centered:
	transform: "translate(-50%, -50%)",
	left: "50%",
	t: "50%",

	maxHeight: "85vh",
	maxWidth: 450,
	minWidth: 300,
	p: 30,

	bg: "$bg-dialog",
	br: 4,
	zIndex: 150,

	animation: `${overlayShow} 80ms linear`,

	"&#second": {
		pos: "fixed",
		d: "grid",
		h: 100,
		w: 300,

		// Centered:
		transform: "translate(-50%, -50%)",
		left: "50%",
		t: "50%",

		p: 30,

		bg: "$bg-dialog",
		br: 4,
		zIndex: 150,
	},
});

export const StyledTitle = styled(Title, {
	all: "unset",

	ff: "$secondary",
	c: "$text",
	ls: "0.07rem",
	fs: "1.1rem",
	fw: 600,
});

export const StyledDescription = styled(Description, {
	margin: "10px 0 20px",

	ls: "0.03rem",
	c: "$gray-text",
	ff: "$secondary",
	fs: "1rem",
	lh: 1.5,
});

export const TriggerToRemoveMedia = styled(Trigger, {
	boxSizing: "border-box", // So that border doens't occupy space

	d: "flex", // row
	justifyContent: "space-between",
	alignItems: "center",
	h: 35,
	gap: 15,

	bg: "#bb2b2e",
	p: "0.8rem",
	cursor: "pointer",
	br: 4,
	b: "none",
	c: "white",

	ls: "0.04rem",
	fs: "1rem",
	fw: 600,
	lh: 1,

	"&:focus": {
		b: "1px solid #821e20",
	},

	"&:hover": {
		bg: "#821e20",
	},
});

export const CloseDialog = styled(Close, {
	all: "unset",

	/////////////////////////////////////////
	// Tooltip:
	"&.tooltip": {
		"&:active": {
			"&::before, ::after": {
				visibility: "hidden",
			},
		},

		"&:hover::before": {
			visibility: "visible",

			transition: "all 0.4s 1s ease ",
		},

		"&::before, ::after": {
			visibility: "hidden",

			content: "attr(data-tooltip)",
			pos: "absolute",
			h: "auto",
			w: "auto",

			b: "1px solid white",
			bg: "#181818",
			p: "3px 8px",
			zIndex: 100,

			whiteSpace: "nowrap",
			lh: "normal",
			ff: "$primary",
			c: "#fff",
			ta: "center",
			fs: "1rem",
			fw: 500,

			pointerEvents: "none",
		},
	},

	// The variants below are for the tooltip,
	// they have to be on the outermost side:
	variants: {
		"tooltip-side": {
			"left-bottom": {
				"&::before, ::after": {
					r: "50%",
					t: "110%",
				},
			},
			bottom: {
				"&::before, ::after": {
					t: "110%",
				},
			},
			right: {
				"&::before, ::after": {
					left: "110%",
				},
			},
			left: {
				"&::before, ::after": {
					r: "110%",
				},
			},
			top: {
				"&::before, ::after": {
					bottom: "110%",
				},
			},
		},
	},

	defaultVariants: {
		"tooltip-side": "bottom",
	},

	/////////////////////////////////////////
	/////////////////////////////////////////
	/////////////////////////////////////////

	boxSizing: "border-box", // So that border doens't occupy space
	dflex: "center",
	h: 35,

	p: "0 15px",
	cursor: "pointer",
	br: 4,
	b: "none",

	ff: "$secondary",
	ls: "0.04rem",
	fs: "1rem",
	fw: 600,
	lh: 1,

	"&#delete-media": {
		ff: "$secondary",
		ls: "0.04rem",
		fs: "1rem",
		fw: 600,

		bg: "#bb2b2e",
		c: "white",

		"&:focus": {
			b: "1px solid #821e20",
		},

		"&:hover": {
			bg: "#821e20",
		},
	},

	"&#cancel": {
		ff: "$secondary",
		ls: "0.04rem",
		fs: "1rem",
		fw: 600,

		bg: "transparent",
		c: "#2c6e4f",

		"&:focus": {
			b: "1px solid #c6dbce",
		},

		"&:hover": {
			bg: "#c6dbce",
		},
	},

	"&#reset-app-data": {
		ff: "$secondary",
		ls: "0.04rem",
		fs: "1rem",
		fw: 600,

		bg: "#94a59b",
		margin: "10px 0",
		c: "black",

		"&:focus": {
			b: "1px solid #c6dbce",
		},

		"&:hover": {
			bg: "#c6dbce",
		},
	},

	"&#reload-window": {
		ff: "$secondary",
		ls: "0.04rem",
		fs: "1rem",
		fw: 600,

		bg: "#94a59b",
		c: "black",

		"&:focus": {
			b: "1px solid #c6dbce",
		},

		"&:hover": {
			bg: "#c6dbce",
		},
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

		"&:focus": {
			b: "1px solid #c6dbce",
		},

		"&:hover": {
			bg: "#c6dbce",
		},
	},

	"&#close-icon": {
		all: "unset",

		boxSizing: "border-box", // So that border doens't occupy space
		pos: "absolute",
		dflex: "center",
		r: 10,
		t: 10,

		size: "26px !important",

		br: "50%",
		cursor: "pointer",

		"& svg": {
			fill: "$accent-light",
		},

		"&:focus": {
			b: "1px solid $accent-light",
		},

		"&:hover": {
			bg: "$icon-button-hovered",

			"& svg": {
				fill: "white",
			},
		},
	},
});

export const FlexRow = styled("div", {
	all: "unset",

	d: "flex", // row
	justifyContent: "flex-end",
	mt: 25,
	gap: 20,
});

export const Fieldset = styled("fieldset", {
	all: "unset",

	d: "flex",
	alignItems: "center",
	h: 37,

	mb: 15,
	gap: 20,
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

// TODO: change to be equal to SearchMedia's
export const Input = styled("input", {
	all: "unset",

	d: "inline-flex",
	flex: 1,
	justifyContent: "center",
	alignItems: "center",
	w: "100%",
	h: 35,

	b: "2px solid $input-border",
	br: "0.75rem",
	p: "0 10px",

	ls: "0.035rem",
	c: "$input-text",
	ff: "$secondary",
	fs: "1rem",
	lh: 1,

	transition: "all 250ms ease",

	"&:focus": {
		borderColor: "$input-border-active",
	},

	"&:readonly": {
		b: "none",
	},
});
