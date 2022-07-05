import { DECORATIONS_HEIGHT } from "@components/Decorations/styles";
import { styled } from "@styles/global";

export const Nav = styled("nav", {
	gridArea: "nav",

	d: "flex",
	fd: "column",
	justifyContent: "space-between",
	alignItems: "center",
	w: 65,

	h: `calc(100vh - ${DECORATIONS_HEIGHT})`,
	bg: "$bg-navbar",

	"& > :first-child": { mt: 40 },
	"& > :last-child": { mb: 40 },
});

export const Buttons = styled("div", {
	dcolumn: "center",
	w: "100%",

	button: {
		dflex: "center",
		size: 45,

		cursor: "pointer",
		bg: "none",
		b: "none",

		c: "$deactivated-icon",
		fs: "1rem",

		"&:hover, &:focus": { c: "$active-icon" },

		"&.active": { c: "$active-icon" },
	},
});

export const PopupsWrapper = styled("div", { dcolumn: "center", w: "100%" });
