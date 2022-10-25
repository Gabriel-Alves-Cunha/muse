export const StyledDialogContent = styled(Content, {
	"&.delete-media": { w: 300, "& #warning": { size: 35, mr: "auto" } },
});

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

export const StyledTitle = styled(Title, {
	"&.subtitle": { fs: "1.1rem", "&:first-letter": { fs: "1.9rem", fw: 400 } },
});

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

export const CloseDialog = styled(Close, {
	"&.delete-media": {
		bg: "#bb2b2e",
		c: "white",

		"&:hover, &:focus": { bg: "#821e20" },
	},

	"&#cancel": {
		bg: "transparent",
		c: "#2c6e4f",

		"&:hover, &:focus": { bg: "#c6dbce" },
	},

	"&#reset-app-data": {
		bg: "#94a59b",
		m: "10px 0",
		c: "black",

		"&:hover, &:focus": { bg: "#c6dbce" },
	},

	"&#reload-window": {
		bg: "#94a59b",
		c: "black",

		"&:hover, &:focus": { bg: "#c6dbce" },
	},
});
