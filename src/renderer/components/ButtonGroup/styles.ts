import { styled, keyframes } from "@styles/global";

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

const spin = keyframes({
	from: { transform: "rotate(0deg)" },
	to: { transform: "rotate(360deg)" },
});

/////////////////////////////////////////

const scale = keyframes({
	"0%, 100%": { transform: "scale(1.0)" },
	"50%": { transform: "scale(0.95)" },
});

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

export const Wrapper = styled("div", {
	position: "relative",
	dflex: "center",

	bg: "none",

	button: {
		$$height: "40px",

		pos: "relative",
		dflex: "center",
		h: "$$height",

		cursor: "pointer",
		bg: "$bg-button", // TODO: falta isso no tailwind
		b: "none",
		px: 20,

		transitionProperty: "background, color",
		transitionTimingFunction: "ease",
		transitionDuration: 0.25,
		transitionDelay: 0,

		"& svg": { c: "$gray-text" },

		"&.single-button": { size: "$$height", br: "50%", p: 0 },

		"&.first": { borderBottomLeftRadius: 12, borderTopLeftRadius: 12 },

		"&.last": { borderBottomRightRadius: 12, borderTopRightRadius: 12 },

		"&:hover, &:focus": {
			bg: "$bg-button-hover", // TODO: Falta isso no tailwind

			"& svg": { c: "white" },

			"&.reload svg": { animation: `${spin} 0.7s linear` }, // TODO: isso no tailwind... tenho q ver...
		},

		"&:active": {
			// This is for the button in general:
			animation: `${scale} 0.25s ease 0s`,
		},

		//////////////////////////////////////////
		"&.reloading": { animation: `${spin} 1s infinite linear` },
	},
});

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

export const ButtonFromGroup = styled("button", {
	pos: "relative",
	dflex: "center",

	cursor: "pointer",
	bg: "none",
	b: "none",
});
