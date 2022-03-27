import { styled } from "@styles/global";

import { theme } from "@styles/theme";

export const Nav = styled("nav", {
	display: "flex",
	flexDirection: "column",
	alignItems: "center",

	backgroundColor: theme.colors.bgNav,
	height: "100vh",
	paddingTop: 100,
	width: 65,
});

export const ScaleUpIconButton = styled("button", {
	display: "flex", // row,
	alignItems: "center",
	justifyContent: "center",
	width: "80%",
	height: 45,

	backgroundColor: "transparent",
	cursor: "pointer",
	fontSize: "1rem",

	transition: "transform .2s ease-in-out",
	color: theme.colors.deactivatedIcon,
	border: "none",

	"&:hover": {
		"&:not(&.active)": {
			transition: "transform .2s ease-in-out",
			transform: "scale(1.5)",
			color: theme.colors.activeIcon,
		},
	},

	"&.active": {
		color: theme.colors.activeIcon,
	},
});
