import { styled } from "@styles/global";

export const MainArea = styled("div", {
	flexDirection: "column",
	position: "relative",
	display: "flex",

	height: "100%",
	width: "100%",

	media: {
		small: {
			header: {
				justifyContent: "center",
				marginLeft: 0,
			},
		},
	},
});