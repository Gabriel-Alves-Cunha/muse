import { styled } from "@styles/global";

import { fonts, theme } from "@styles/theme";

export const Img = styled("div", {
	display: "flex",
	justifyContent: "center",
	alignItems: "center",

	minWidth: 45,
	height: 45,

	borderRadius: 13,
	margin: "0 10px",
	border: "none",

	boxShadow: theme.boxShadows.small,

	img: {
		objectFit: "cover",
		height: 45,
		width: 45,

		borderRadius: 13,
		border: "none",

		"&:before": {
			display: "none",
		},
	},
});

export const Info = styled("div", {
	display: "flex",
	flexDirection: "column",
	justifyContent: "center",
	alignItems: "flex-start",

	height: "calc(100% - 5px)",
	width: "calc(100% - 5px)",

	overflow: "hidden",
});

export const Title = styled("p", {
	fontFamily: fonts.primary,
	color: theme.colors.text,
	letterSpacing: "0.03em",
	fontSize: "1rem",
	fontWeight: 500,

	wordWrap: "normal",
	overflow: "hidden",
	/* white-space: nowrap; // make it one-line. */

	/* animation: 6s linear 0s infinite move;

	@keyframes move {
		from {
			transform: translateX(0%);
			left: 0%;
		}
		to {
			transform: translateX(-110%);
			left: 110%;
		}
	} */
});

export const SubTitle = styled("p", {
	fontFamily: fonts.primary,
	color: theme.colors.grayText,
	letterSpacing: "0.03em",
	fontSize: "0.8em",
	fontWeight: 500,
});

export const Options = styled("button", {
	display: "flex",
	flexDirection: "column",
	justifyContent: "center",
	alignItems: "center",

	background: "transparent",
	borderRadius: 7,
	margin: 5,

	height: "80%",
	width: 25,

	cursor: "pointer",
	border: "none",

	"&:hover": {
		transition: "boxShadow 0.3s ease-in-out 17ms",
		boxShadow: theme.boxShadows.medium,
	},
});

export const ListWrapper = styled("div", {
	boxShadow: theme.boxShadows.medium,
	boxSizing: "border-box",
	margin: "2em 5%",
	borderRadius: 7,
	height: "65vh",
	maxWidth: 600,
	zIndex: 1,

	media: {
		small: {
			margin: "0.5em 5%",
		},
	},

	"&.list": {
		overflowX: "hidden !important",

		/* width */
		"&::-webkit-scrollbar": {
			width: 5,
		},

		/* Track */
		"&::-webkit-scrollbar-track": {
			background: "#f1f1f1",
		},

		/* Handle */
		"&::-webkit-scrollbar-thumb": {
			background: "#888",
		},

		/* Handle on hover */
		"&::-webkit-scrollbar-thumb:hover": {
			background: "#555",
		},
	},
});

export const RowWrapper = styled("div", {
	display: "flex",
	flexDirection: "row",
	justifyContent: "center",
	alignItems: "center",

	width: "98% !important",

	borderRadius: 7,
	margin: 7,

	"&:hover": {
		transition: "boxShadow 0.2s ease-in-out 17ms",
		boxShadow: theme.boxShadows.medium,
	},

	"&.active": {
		boxShadow: theme.boxShadows.medium,

		background: "white",

		outline: `3px solid ${theme.colors.bgCentral}`,
		outlineOffset: -3,
	},
});

export const PlayButton = styled("div", {
	display: "flex",
	position: "relative",
	flexDirection: "row",
	justifyContent: "center",
	alignItems: "center",

	height: "100%",
	width: "90%",

	cursor: "pointer",
});

export const InputWrapper = styled("div", {
	display: "flex",
	justifyContent: "center",
	alignItems: "center",
	height: 50,
	width: 320,

	boxShadow: theme.boxShadows.medium,
	background: "#d3d3d5",
	overflowY: "hidden",
	padding: "0.5rem",
	borderRadius: 7,

	"&::selection": {
		background: "#aa00ff; // ${theme.colors.accent}",
		color: "#ffffff",
	},

	input: {
		"&::selection": {
			background: "#aa00ff; // ${theme.colors.accent}",
			color: "#ffffff",
		},

		fontFamily: fonts.primary,
		letterSpacing: "0.03em",
		boxSizing: "border-box",
		fontSize: "1.05rem",
		color: "#00525e",
		fontWeight: 500,

		width: "100%",
		height: 26,

		background: "transparent",
		paddingLeft: 10,
		border: "none",

		"&::-webkit-input-placeholder": {
			display: "flex",
			justifyContent: "flex-start",
			alignItems: "center",

			color: "rgba(0, 0, 0, 0.5)",
			fontStyle: "italic",
		},
	},
});
