import { styled } from "@styles/global";
import { color } from "@styles/theme";

export const Nav = styled("nav", {
	display: "flex", // row
	flexDirection: "column",
	justifyContent: "space-between",
	alignItems: "center",

	backgroundColor: color("bgMain"),
	height: "100vh",
	padding: "20px 0",
	width: 65,
});

export const Buttons = styled("div", {
	display: "flex", // row
	flexDirection: "column",
	justifyContent: "center",
	alignItems: "center",

	width: "100%",
});

export const ScaleUpIconButton = styled("button", {
	display: "flex", // row,
	justifyContent: "center",
	alignItems: "center",
	width: "80%",
	height: 45,

	backgroundColor: "transparent",
	cursor: "pointer",
	fontSize: "1rem",

	color: color("deactivatedIcon"),
	transition: "$scale",
	border: "none",

	"&:hover": {
		"&:not(&.active)": {
			transition: "$scale",
			transform: "scale(1.5)",
			color: color("activeIcon"),
		},
	},

	"&.active": {
		color: color("activeIcon"),
	},
});
