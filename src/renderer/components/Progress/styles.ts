import { styled, keyframes } from "@styles/global";

import { ProgressStatus } from "@common/@types/typesAndEnums";

import { theme } from "@styles/theme";

// TODO: see if this works...
const progressActive = keyframes({
	"0%": {
		opacity: 0.3,
		width: 0,
	},
	"40%": {
		opacity: 0.7,
		width: 0,
	},
	"80%": {
		opacity: 0.3,
	},
	"100%": {
		width: "$$percentage",
		opacity: 0,
	},
});

export const Bar = styled("div", {
	width: "$$percentage",
	height: "100%",

	backgroundColor: theme.colors.accent,
	transition: "width 0.3s linear",

	[`&.${ProgressStatus.ACTIVE}`]: {
		position: "absolute",
		height: "100%",

		animation: `${progressActive} 2s cubic-bezier(0.23, 1, 0.32, 1) infinite`,
		backgroundColor: "white",
	},
});

export const ProgressBarWrapper = styled("div", {
	position: "relative",
	width: "90%",
	height: 3,

	backgroundColor: theme.colors.bgNav,
});

export const Component = styled("div", {
	display: "flex",
	width: "100%",
	height: 15,

	alignItems: "center",

	"& svg": {
		margin: "auto",
	},
});
