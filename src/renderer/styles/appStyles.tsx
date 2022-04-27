import { DECORATIONS_HEADER_HEIGHT } from "@components/Decorations/styles";
import { styled, keyframes } from "@styles/global";

export const Content = styled("div", {
	display: "grid",
	gridTemplate: `
		"nav main-area media-player" 100%
		/ 65px 1fr minmax(186px, 25vw)
	`,

	marginTop: DECORATIONS_HEADER_HEIGHT,
	backgroundColor: "$bg-main",

	"@sm": {
		gridTemplate: `
		"nav main-area" 1fr
		/ 35px 1fr
		"media-player" 70px
		/ 1fr
	`,
	},
});

const rotating = keyframes({
	to: {
		transform: "rotate(1turn)",
	},
});

export const Loading = styled("div", {
	animation: `${rotating} 1s infinite`,
	border: "2px solid #e5e5e5",
	borderTopColor: "$accent",
	borderRadius: "50%",
	size: 25,
});
