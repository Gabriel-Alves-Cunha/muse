import { styled } from "@styles/global";

import { theme } from "@styles/theme";

export const OptionsModalWrapper = styled("div", {
	display: "flex",
	flexDirection: "column",
	maxHeight: 400,
	maxWidth: 320,

	backgroundColor: theme.colors.bgNav,
	borderRadius: 10,

	overflowX: "hidden",
	overflowY: "auto",

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
});

export const Option = styled("button", {
	display: "flex",
	flexDirection: "row",
	justifyContent: "flex-start",
	alignItems: "center",

	fontFamily: "$theme.fonts.fontFamily.value",
	letterSpacing: "0.03em",
	fontSize: "1rem",

	background: "#edecf8",
	color: "#00525e",
	width: "100%",
	height: 50,

	border: "none",
	borderBottom: "1px solid #ccc",

	overflowY: "visible",
	userSelect: "text",
	padding: "0.7rem",
	cursor: "text",

	"&::selection": {
		background: "#aa00ff; // theme.colors.accen",
		color: "#fff",
	},

	"&.hoverable": {
		cursor: "pointer",

		"&:hover": {
			transition: "backgroundColor 0.1s ease-in-out",
			backgroundColor: "#d3d3d5",
		},
	},

	span: {
		fontFamily: "$theme.fonts.fontFamily.value",
		letterSpacing: "0.03em",
		textAlign: "left",
		fontSize: "1rem",
		color: "#8e8e8e",

		"&::selection": {
			background: "#aa00ff; // theme.colors.accen",
			color: "#fff",
		},
	},

	"&.rm": {
		display: "flex",
		flexDirection: "row",
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

	fontFamily: "$theme.fonts.fontFamily.value",
	letterSpacing: "0.03em",
	background: "#edecf8",
	textAlign: "center",
	fontSize: "1.05rem",
	flexWrap: "wrap",
	color: "#00525e",
	borderRadius: 10,

	p: {
		padding: "0.8rem",
	},

	span: {
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		width: "100%",
		height: 40,

		fontFamily: "$theme.fonts.fontFamily.value",
		letterSpacing: "0.03em",
		fontSize: "1.05rem",
		fontWeight: "500",
		color: "white",

		"&.yes": {
			background: "#bb2b2e",
			marginTop: "0.8rem",
		},
		"&.no": {
			borderBottomRightRadius: 10,
			borderBottomLeftRadius: 10,
			background: "#219a00",
		},

		"&:hover": {
			transition: "backgroundColor 0.1s ease",
			filter: "brightness(1.1)",
			cursor: "pointer",
			color: "black",
		},
	},
});
