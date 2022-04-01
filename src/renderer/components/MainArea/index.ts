import { styled } from "@styles/global";

export const MainArea = styled("div", {
	position: "relative",
	display: "flex",
	flexDirection: "column",

	size: "100%",

	"@sm": {
		header: {
			justifyContent: "center",
			marginLeft: 0,
		},
	},
});
