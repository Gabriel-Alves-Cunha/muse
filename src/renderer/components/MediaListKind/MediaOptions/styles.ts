import { styled } from "@styles/global";
import { color } from "@styles/theme";

export const OptionsModalWrapper = styled("div", {
	display: "flex",
	flexDirection: "column",
	maxHeight: 400,
	maxWidth: 320,

	backgroundColor: color("bgMain"),
	borderRadius: 10,

	overflowX: "hidden",
	overflowY: "auto",

	/* width */
	"::-webkit-scrollbar": {
		size: 5,
	},

	/* Track */
	"::-webkit-scrollbar-track": {
		background: color("scrollbar"),
	},

	/* Handle */
	"::-webkit-scrollbar-thumb": {
		background: color("scrollbarThumb"),
	},

	/* Handle on hover */
	"::-webkit-scrollbar-thumb:hover": {
		background: color("scrollbarThumbHover"),
	},
});

export const Option = styled("button", {
	display: "flex", // row
	justifyContent: "flex-start",
	alignItems: "center",

	fontFamily: "$fontFamily",
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
		background: color("accent"),
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
		fontFamily: "$fontFamily",
		letterSpacing: "0.03em",
		textAlign: "left",
		fontSize: "1rem",
		color: "#8e8e8e",

		"&::selection": {
			background: color("accent"),
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

	fontFamily: "$fontFamily",
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
		display: "flex", // row
		justifyContent: "center",
		alignItems: "center",
		width: "100%",
		height: 40,

		fontFamily: "$fontFamily",
		letterSpacing: "0.03em",
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
			transition: "filter 0.1s ease",
			filter: "brightness(1.1)",
			cursor: "pointer",
			color: "black",
		},
	},
});
