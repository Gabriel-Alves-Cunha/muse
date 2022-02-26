import { styled } from "@styles/global";

import { fonts, theme } from "@styles/theme";

export const Wrapper = styled("div", {
	display: "flex",
	justifyContent: "center",
	width: "100%",

	div: {
		display: "flex",
		justifyContent: "center",
		alignItems: "center",

		marginTop: "2rem",
		padding: "1rem",
		width: 200,
		height: 30,

		...fonts.all,
		fontWeight: 500,
		fontSize: "1.1rem",

		border: `1px solid ${theme.colors.navButtonHoveredColor}`,

		"&:hover": {
			backgroundColor: theme.colors.navButtonHoveredColor,
			transition: "background-color 0.15s ease-in-out",
			cursor: "pointer",
			color: "white",
		},
	},

	input: {
		display: "none",
	},
});
