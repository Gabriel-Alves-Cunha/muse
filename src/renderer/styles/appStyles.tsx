import { DECORATIONS_HEIGHT } from "@components/Decorations/styles";
import { styled, keyframes } from "./global";

export const Content = styled("div", {
	d: "grid",
	gridTemplate: `
		"nav main-area media-player" 100%
		/ 65px 1fr minmax(186px, 25vw)
	`,

	mt: DECORATIONS_HEIGHT,
	bg: "$bg-main",

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
	size: 25,

	borderTopColor: "$accent",
	b: "2px solid #e5e5e5",
	br: "50%",

	animation: `${rotating} 1s infinite`,
});
