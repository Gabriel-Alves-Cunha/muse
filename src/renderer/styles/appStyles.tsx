import { styled, keyframes } from "./global";
import {
	DOWN_DECORATIONS_HEIGHT,
	TOP_DECORATIONS_HEIGHT,
} from "@components/Decorations/styles";

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////

export const Content = styled("div", {
	d: "grid",
	gridTemplate: `
		"nav main-area media-player" 100%
		/ 65px 1fr minmax(186px, 25vw)
	`,
	width: "100vw",
	height:
		`calc(100vh - (${TOP_DECORATIONS_HEIGHT} + ${DOWN_DECORATIONS_HEIGHT}))`,

	mt: TOP_DECORATIONS_HEIGHT,
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

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////

const rotating = keyframes({ to: { transform: "rotate(1turn)" } });

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////

export const Loading = styled("div", {
	size: 25,

	b: "2px solid transparent",
	borderTopColor: "$input-border-active",
	br: "50%",

	animation: `${rotating} 1s ease infinite`,
});
