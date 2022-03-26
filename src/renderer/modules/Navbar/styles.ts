import { styled } from "@styles/global";

import { theme } from "@styles/theme";

export const Nav = styled("nav", {
	display: "flex",
	flexDirection: "column",
	alignContent: "center",

	backgroundColor: theme.colors.bgNav,
	height: "100vh",
	width: 65,
});

export const FolderButton = styled("button", {
	display: "flex", // row,
	alignItems: "center",
	justifyContent: "center",
	width: "80%",
	height: 45,

	backgroundColor: "transparent",
	cursor: "pointer",
	fontSize: "1rem",
	margin: 5,

	transition: "all .2s ease-in-out",
	color: "#a8a8a8",
	border: "none",

	"&:hover": {
		"&:not(&.active)": {
			transition: "all .2s ease-in-out",
			transform: "scale(1.5)",
			color: "black",
		},
	},

	"&.active": {
		color: "black",
	},
});
