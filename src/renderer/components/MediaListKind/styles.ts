import { styled } from "@styles/global";

export const Img = styled("div", {
	display: "flex", // row
	justifyContent: "center",
	alignItems: "center",

	minWidth: 45,
	height: 45,

	boxShadow: "$small",
	borderRadius: 13,
	margin: "0 10px",
	border: "none",

	img: {
		objectFit: "cover",
		size: 45,

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

	size: "calc(100% - 5px)",
	overflow: "hidden",
});

export const Title = styled("p", {
	letterSpacing: "0.03em",
	fontFamily: "$primary",
	fontSize: "1rem",
	fontWeight: 500,
	color: "$alternative-text",

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
	letterSpacing: "0.03em",
	fontFamily: "$primary",
	color: "$gray-text",
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
		transition: "$boxShadow",
		boxShadow: "$medium-black",
	},
});

export const ListWrapper = styled("div", {
	boxSizing: "border-box",

	margin: "2em 5%",
	height: "65vh",
	maxWidth: 600,
	zIndex: 1,

	"@sm": {
		margin: "0.5em 5%",
	},

	overflowX: "hidden !important",

	/* width */
	".list::-webkit-scrollbar": {
		display: "block",
		size: 5,
	},

	/* Track */
	".list::-webkit-scrollbar-track": {
		background: "$scrollbar",
	},

	/* Handle */
	".list::-webkit-scrollbar-thumb": {
		background: "$scrollbar-thumb",
	},

	/* Handle on hover */
	".list::-webkit-scrollbar-thumb:hover": {
		background: "$scrollbar-thumb-hover",
	},
});

export const RowWrapper = styled("div", {
	display: "flex", // row
	justifyContent: "center",
	alignItems: "center",

	width: "98% !important",

	borderRadius: 7,
	margin: 7,

	"&:hover": {
		transition: "$boxShadow",
		boxShadow: "$medium",
	},

	"&.active": {
		boxShadow: "$medium",
		background: "white",

		outline: "3px solid $bgMain",
		outlineOffset: -3,
	},
});

export const PlayButton = styled("div", {
	position: "relative",
	display: "flex", // row
	justifyContent: "center",
	alignItems: "center",

	height: "100%",
	width: "90%",

	cursor: "pointer",
});

export const InputWrapper = styled("div", {
	display: "flex", // row
	justifyContent: "center",
	alignItems: "center",
	height: 50,
	width: 320,

	background: "$bg-main",
	boxShadow: "$medium",
	overflowY: "hidden",
	padding: "0.5rem",
	borderRadius: 7,

	input: {
		letterSpacing: "0.03em",
		boxSizing: "border-box",
		fontFamily: "$primary",
		fontSize: "1.05rem",
		fontWeight: 500,
		color: "$alternative-text",

		width: "100%",
		height: 26,

		background: "transparent",
		paddingLeft: 10,
		border: "none",

		"::-webkit-input-placeholder": {
			display: "flex", // row
			justifyContent: "flex-start",
			alignItems: "center",

			color: "rgba(0, 0, 0, 0.5)",
			fontStyle: "italic",
		},
	},
});
