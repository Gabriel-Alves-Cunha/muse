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

	animation: `${overlayShow} 80ms linear`,
});

export const StyledContent = styled(Content, {
	all: "unset",

	position: "fixed",
	display: "grid",

	// Centered:
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

	animation: `${overlayShow} 80ms linear`,

	"&#second": {
		position: "fixed",
		display: "grid",
		height: 100,
		width: 300,

		// Centered:
		transform: "translate(-50%, -50%)",
		left: "50%",
		top: "50%",

		padding: 30,

		background: "$bg-dialog",
		borderRadius: 4,
		zIndex: 150,
	},
});

export const StyledTitle = styled(Title, {
	all: "unset",

	ff: "$secondary",
	color: "$text",
	ls: "0.07rem",
	fs: "1.1rem",
	fw: 600,
});

export const StyledDescription = styled(Description, {
	margin: "10px 0 20px",

	letterSpacing: "0.03rem",
	color: "$gray-text",
	ff: "$secondary",
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

	ls: "0.04rem",
	fs: "1rem",
	fw: 600,
	lh: 1,

	"&:focus": {
		border: "1px solid #821e20",
	},

	"&:hover": {
		background: "#821e20",
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
			position: "absolute",
			height: "auto",
			width: "auto",

			border: "1px solid white",
			background: "#181818",
			padding: "3px 8px",
			zIndex: 100,

			whiteSpace: "nowrap",
			lineHeight: "normal",
			ff: "$primary",
			color: "#fff",
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
					right: "50%",
					top: "110%",
				},
			},
			bottom: {
				"&::before, ::after": {
					top: "110%",
				},
			},
			right: {
				"&::before, ::after": {
					left: "110%",
				},
			},
			left: {
				"&::before, ::after": {
					right: "110%",
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
	height: 35,

	padding: "0 15px",
	cursor: "pointer",
	borderRadius: 4,
	border: "none",

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
		ff: "$secondary",
		ls: "0.04rem",
		fs: "1rem",
		fw: 600,

		background: "transparent",
		color: "#2c6e4f",

		"&:focus": {
			border: "1px solid #c6dbce",
		},

		"&:hover": {
			background: "#c6dbce",
		},
	},

	"&#reset-app-data": {
		ff: "$secondary",
		ls: "0.04rem",
		fs: "1rem",
		fw: 600,

		background: "#94a59b",
		margin: "10px 0",
		color: "black",

		"&:focus": {
			border: "1px solid #c6dbce",
		},

		"&:hover": {
			background: "#c6dbce",
		},
	},

	"&#reload-window": {
		ff: "$secondary",
		ls: "0.04rem",
		fs: "1rem",
		fw: 600,

		background: "#94a59b",
		color: "black",

		"&:focus": {
			border: "1px solid #c6dbce",
		},

		"&:hover": {
			background: "#c6dbce",
		},
	},

	"&#save-changes": {
		height: 35,

		ff: "$secondary",
		lh: "2.1875rem", // same as height (35px)
		ls: "0.04rem",
		fs: "1rem",
		fw: 600,

		background: "#ddf4e5",
		color: "#2c6e4f",

		"&:focus": {
			border: "1px solid #c6dbce",
		},

		"&:hover": {
			background: "#c6dbce",
		},
	},

	"&#close-icon": {
		all: "unset",

		boxSizing: "border-box", // So that border doens't occupy space
		position: "absolute",
		dflex: "center",
		right: 10,
		top: 10,

		size: "26px !important",

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
	},
});

export const FlexRow = styled("div", {
	all: "unset",

	display: "flex", // row
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

	color: "$accent-light",
	ff: "$secondary",
	ls: "0.03rem",
	ta: "right",
	fs: "1rem",
	fw: 500,
});

// TODO: change to be equal to SearchMedia's
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
