import { styled } from "@styles/global";

export const MainArea = styled("div", {
	gridArea: "main-area",

	position: "relative",
	display: "inline-block",
	alignSelf: "stretch", // for grid: column

	size: "100%",

	"@sm": {
		header: {
			justifyContent: "center",
			marginLeft: 0,
		},
	},
});
