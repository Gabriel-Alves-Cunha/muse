import { DECORATIONS_HEADER_HEIGHT } from "@components/Decorations/styles";
import { styled } from "@styles/global";

export const Nav = styled("nav", {
	gridArea: "nav",

	display: "flex", // row
	flexDirection: "column",
	justifyContent: "space-between",
	alignItems: "center",

	height: `calc(100vh - ${DECORATIONS_HEADER_HEIGHT})`,
	background: "$bg-navbar",
	width: 65,

	"& > :first-child": {
		mt: 40,
	},
	"& > :last-child": {
		mb: 40,
	},
});

export const Buttons = styled("div", {
	display: "flex", // row
	flexDirection: "column",
	justifyContent: "center",
	alignItems: "center",
	width: "100%",

	transition: "$bgc",

	"&:hover": {
		transition: "$bgc",
		background: "$icon-button-hovered",
	},
});

export const ScaleUpIconButton = styled("button", {
	display: "flex", // row,
	justifyContent: "center",
	alignItems: "center",
	size: 45,

	background: "transparent",
	cursor: "pointer",
	border: "none",

	color: "$deactivated-icon",
	fontSize: "1rem",

	willChange: "transform",
	transition: "$scale",

	"&:hover": {
		transition: "$scale",
		transform: "scale(1.4)",
		color: "$active-icon",
	},

	"&.active": {
		color: "$active-icon",
	},
});

export const Popups = styled("div", {
	display: "flex", // row
	flexDirection: "column",
	justifyContent: "center",
	alignItems: "center",

	width: "100%",
});
