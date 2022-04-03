import { DECORATIONS_HEADER_HEIGHT } from "@components/Decorations/styles";
import { styled } from "@styles/global";

export const Wrapper = styled("div", {
	position: "absolute",
	display: "flex",
	flexDirection: "column",
	justifyContent: "flex-start",
	alignContent: "center",

	height: `calc(100vh - ${DECORATIONS_HEADER_HEIGHT})`,
	width: "25vw",
	zIndex: 30,
	right: 0,

	backgroundColor: "$bg-media-player",
	padding: "1rem",
	border: "none",
});

// TODO: make it a square
export const ImgContainer = styled("div", {
	display: "flex", // row
	justifyContent: "center",
	alignItems: "center",
	alignSelf: "center",

	marginTop: "15%",
	height: "25vw",
	width: "25vw",

	boxShadow: "$white-glow-around-component",
	borderRadius: 17,
	border: "none",

	img: {
		objectFit: "cover",
		size: "100%",

		borderRadius: 17,
		border: "none",
	},
});

export const Info = styled("div", {
	display: "flex",
	flexDirection: "column",
	justifyContent: "center",
	alignItems: "center",
	height: "10vh",
	width: "100%",

	marginTop: "3vh",

	span: {
		display: "flex", // row
		justifyContent: "center",
		alignItems: "center",
		width: "100%",

		"&.title": {
			letterSpacing: "0.03em",
			fontFamily: "$primary",
			fontSize: "1.1rem",
			fontWeight: 500,
			color: "$text",

			overflowY: "hidden",
		},

		"&.subtitle": {
			letterSpacing: "0.03em",
			fontFamily: "$primary",
			color: "$gray-text",
			fontSize: "0.9rem",
			fontWeight: 400,

			overflowY: "hidden",
		},
	},
});

export const SeekerContainer = styled("div", {
	display: "flex", // row
	justifyContent: "space-between",
	alignItems: "center",
	height: "1rem",
	width: "100%",

	marginTop: "5vh",

	span: {
		letterSpacing: "0.03em",
		fontFamily: "$primary",
		textAlign: "center",
		color: "$gray-text",
		fontSize: "1rem",

		backgroundColor: "transparent",
		border: "none",
	},
});

export const Controls = styled("div", {
	display: "flex", // row
	justifyContent: "space-between",
	alignItems: "center",
	gap: 10,

	"> div": {
		display: "flex", // row
		justifyContent: "center",
		alignItems: "center",
	},

	"#loop": {},

	"#random": {},

	span: {
		display: "flex", // row
		justifyContent: "center",
		alignItems: "center",

		"&.previous-or-next": {
			borderRadius: "50%",
			cursor: "pointer",
			color: "$text",
			size: 40,

			// TODO: see if this works
			"&:hover": "$scaleTransition",
		},

		"&.play-pause": {
			borderRadius: "50%",
			cursor: "pointer",
			color: "$text",
			size: 50,

			transition: "$scale",

			"&:hover": {
				transition: "$scale",
				transform: "scale(1.1)",
			},
		},
	},
});

export const ProgressWrapper = styled("div", {
	display: "block",
	width: 200,
	height: 3,

	backgroundColor: "rgba(125, 125, 125, 0.6)",
	cursor: "pointer",
	margin: "0 7px",
});

export const ProgressThumb = styled("div", {
	position: "relative",
	height: 3,
	left: 0,
	top: 0,

	backgroundColor: "$accent",
});

// export const ProgressBar = styled("div", {
// 	position: "absolute",
// 	right: -3,
// 	height: 6,
// 	width: 6,
// 	top: 0,

// 	border: "1px solid $accent",
// 	borderRadius: "50%",
// 	background: "white",

// 	animation: "move 1s linear infinite",
// 	transform: "translate(0, -25%)",
// });

export const OptionsAndAlbum = styled("div", {
	display: "flex", // row
	justifyContent: "space-between",
	alignItems: "center",
});
