import { styled } from "@styles/global";

export const Wrapper = styled("div", {
	"&.flip-card": {
		size: "100%",

		background: "transparent",
		perspective: 1000, // Remove this if you don't want the 3D effect.
	},

	/* This container is needed to position the front and back side */
	".flip-card-inner": {
		position: "relative",
		size: "100%",

		transformStyle: "preserve-3d",
		transition: "transform 0.7s",
	},

	/* Do an horizontal flip when you move the mouse over the flip box container */
	"&.active .flip-card-inner": { transform: "rotateY(180deg)" },

	/* Position the front and back side */
	".flip-card-front, .flip-card-back": {
		position: "absolute",
		size: "100%",

		backfaceVisibility: "hidden",
	},

	".flip-card-front": { background: "transparent", zIndex: 1 },

	/* Style the back side */
	".flip-card-back": {
		background: "transparent",
		zIndex: 2,

		transform: "rotateY(180deg)",
	},
});
