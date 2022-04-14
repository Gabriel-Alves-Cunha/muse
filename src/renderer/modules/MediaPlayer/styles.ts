import { DECORATIONS_HEADER_HEIGHT } from "@components/Decorations/styles";
import { styled } from "@styles/global";

const padding = "10px";

export const Wrapper = styled("div", {
	gridArea: "media-player",

	position: "relative",
	display: "inline-block",

	justifyItems: "center", // for grid: row
	alignItems: "center", // for grid: column

	justifySelf: "center", // for grid: row
	alignSelf: "start", // for grid: column

	height: `calc(100vh - ${DECORATIONS_HEADER_HEIGHT})`,
	width: "100%",
	padding,

	background:
		"linear-gradient(0deg, rgba(195,101,34,1) 0%, rgba(253,187,45,1) 100%)",

	"@media-player": {
		display: "inline-block",
		justifySelf: "center", // for grid: row
		alignSelf: "center", // for grid: column
		width: "100vw",
		height: 70,
	},
});

export const OptionsAndAlbum = styled("div", {
	display: "flex", // row
	justifyContent: "space-between",
	alignItems: "center",
});

export const Album = styled("span", {
	color: "$alternative-text",
	letterSpacing: "0.04rem",
	fontFamily: "$primary",
	fontSize: "1rem",
	fontWeight: 500,
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

		"#title": {
			fontSize: "1.15rem",
			fontWeight: 500,
			color: "$text",
		},

		"#subtitle": {
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

	width: `calc(100% - 2 * ${padding})`,
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

export const ControlsWrapper = styled("div", {
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

			"#play-pause": {
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
	position: "relative",
	display: "block",
	width: 200,
	height: 3,

	backgroundColor: "$bg-main",
	cursor: "pointer",
	margin: "0 7px",

	span: {
		display: "none",
	},

	"&:hover span": {
		position: "absolute",
		// display: "block",
		justifyContent: "center",
		alignItems: "center",
		bottom: 10,
		height: 20,
		width: 35,

		backgroundColor: "$bg-main",
		borderRadius: 2,

		fontFamily: "$primary",
		fontSize: "0.8rem",
		fontWeight: 500,
		color: "$text",
	},
});

export const ProgressThumb = styled("div", {
	position: "relative",
	height: 3,
	left: 0,
	top: 0,

	backgroundColor: "$accent",
});
