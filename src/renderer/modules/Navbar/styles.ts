import { DECORATIONS_HEIGHT } from "@components/Decorations/styles";
import { styled } from "@styles/global";

export const Nav = styled("nav", {
	gridArea: "nav",

	d: "flex", // row
	fd: "column",
	justifyContent: "space-between",
	alignItems: "center",
	w: 65,

	h: `calc(100vh - ${DECORATIONS_HEIGHT})`,
	bg: "$bg-navbar",

	"& > :first-child": {
		mt: 40,
	},
	"& > :last-child": {
		mb: 40,
	},
});

export const Buttons = styled("div", {
	fd: "column",
	dflex: "center",
	w: "100%",

	button: {
		dflex: "center",
		size: 45,

		c: "$deactivated-icon",
		fs: "1rem",

		"&:hover": {
			c: "$active-icon",
		},

		"&.active": {
			c: "$active-icon",
		},
	},
});

export const Popups = styled("div", {
	fd: "column",
	dflex: "center",

	w: "100%",
});
