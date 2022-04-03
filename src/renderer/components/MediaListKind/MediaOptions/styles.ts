import { styled } from "@styles/global";

export const OptionsModalWrapper = styled("div", {
	display: "flex",
	flexDirection: "column",
	maxHeight: 400,
	maxWidth: 320,

	backgroundColor: "$bg-main",
	borderRadius: 10,

	overflowX: "hidden",
	overflowY: "auto",

	/* width */
	"::-webkit-scrollbar": {
		size: 5,
	},

	/* Track */
	"::-webkit-scrollbar-track": {
		background: "$scrollbar",
	},

	/* Handle */
	"::-webkit-scrollbar-thumb": {
		background: "$scrollbar-thumb",
	},

	/* Handle on hover */
	"::-webkit-scrollbar-thumb:hover": {
		background: "$scrollbar-thumb-hover",
	},
});

export const Option = styled("button", {
	display: "flex", // row
	justifyContent: "flex-start",
	alignItems: "center",

	letterSpacing: "0.03em",
	fontFamily: "$primary",
	fontSize: "1rem",

	background: "$bg-main",
	color: "$text",
	width: "100%",
	height: 50,

	borderBottom: "1px solid $text",
	border: "none",

	overflowY: "visible",
	userSelect: "text",
	padding: "0.7rem",
	cursor: "text",

	"&::selection": {
		background: "$accent",
		color: "#fff",
	},

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
