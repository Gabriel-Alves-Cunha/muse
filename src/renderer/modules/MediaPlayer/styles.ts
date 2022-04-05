import { DECORATIONS_HEADER_HEIGHT } from "@components/Decorations/styles";
import { styled } from "@styles/global";

export const Wrapper = styled("div", {
	position: "absolute",
	display: "flex",
	flexDirection: "column",
	justifyContent: "flex-start",
	alignContent: "center",

	height: `calc(100vh - 2 * ${DECORATIONS_HEADER_HEIGHT})`,
	minWidth: 176,
	width: "25vw",

	zIndex: 30,
	right: 0,

	background:
		"linear-gradient(0deg, rgba(195,101,34,1) 0%, rgba(253,187,45,1) 100%)",
	padding: "1rem",

	"@media-player": {
		flexDirection: "row",
		justifyContent: "center",
		alignContent: "center",
		width: "100vw",
		height: 70,
		bottom: 0,
	},
});

export const OptionsAndAlbum = styled("div", {
	display: "flex", // row
	justifyContent: "space-between",
	alignItems: "center",
});

export const Album = styled("span", {
	letterSpacing: "0.04rem",
	fontFamily: "$primary",
	fontSize: "1rem",
	fontWeight: 500,
	color: "$alternative-text",
});

export const OptionsButton = styled("button", {
	display: "block",
	justifyContent: "center",
	alignItems: "center",
	size: 25,

	backgroundColor: "transparent",
	cursor: "pointer",
	border: "none",

	transition: "$color",
	color: "$deactivated-icon",

	"&:hover": {
		transition: "$color",
		color: "$active-icon",
	},
});

export const SquareImage = styled("div", {
	position: "relative",
	alignSelf: "center",

	marginTop: "25%",
	width: "90%",

	backgroundColor: "transparent",
	boxShadow: "$medium-black",
	borderRadius: 17,
	border: "none",

	"&:after": {
		content: "",
		display: "block",
		pb: "100%",
	},

	div: {
		position: "absolute",
		display: "flex", // row
		justifyContent: "center",
		alignItems: "center",
		size: "100%",
	},

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

		letterSpacing: "0.04em",
		fontFamily: "$primary",
		textAlign: "center",
		flexWrap: "wrap",

		overflowY: "hidden",

		"&.title": {
			fontSize: "1.15rem",
			fontWeight: 500,
			color: "$text",
		},

		"&.subtitle": {
			color: "$gray-text",
			fontSize: "0.9rem",
			fontWeight: 400,
		},
	},
});

export const ControlsAndSeekerContainer = styled("div", {
	position: "absolute",
	display: "flex",
	flexDirection: "column",
	bottom: 40,

	width: "87%",
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
		color: "$bg-main",
		fontSize: "1rem",

		backgroundColor: "transparent",
		border: "none",
	},
});

export const Controls = styled("div", {
	display: "flex", // row
	justifyContent: "space-between",
	alignItems: "center",
	mt: "10%",
	gap: 10,

	"> div": {
		display: "flex", // row
		justifyContent: "center",
		alignItems: "center",

		span: {
			display: "flex", // row
			justifyContent: "center",
			alignItems: "center",

			"&.previous-or-next": {
				borderRadius: "50%",
				cursor: "pointer",
				size: 40,

				transition: "$color",
				color: "$deactivated-icon",

				"&:hover": {
					transition: "$color",
					color: "$active-icon",
				},
			},

			"&.play-pause": {
				borderRadius: "50%",
				cursor: "pointer",
				size: 50,

				transition: "$color",
				color: "$deactivated-icon",

				"&:hover": {
					transition: "$color",
					color: "$active-icon",
				},
			},
		},
	},
});

export const ButtonForRandomAndLoop = styled("button", {
	display: "flex", // row
	justifyContent: "center",
	alignItems: "center",
	size: 25,

	backgroundColor: "transparent",
	cursor: "pointer",
	border: "none",

	willChange: "transform",
	transition: "$scale",

	"&:hover": {
		transition: "$scale",
		transform: "scale(1.5)",
	},
});

export const ProgressWrapper = styled("div", {
	display: "block",
	width: 200,
	height: 3,

	backgroundColor: "$bg-main",
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
