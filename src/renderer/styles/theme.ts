export const theme = {
	colors: {
		navButtonHoveredColor: "var(--nav-button-hovered-color)",
		navButtonActiveColor: "var(--nav-button-active-color)",
		navButtonHoveredBg: "var(--nav-button-hovered-bg)",
		navButtonActiveBg: "var(--nav-button-active-bg)",
		accentAlpha: "var(--accent-alpha)",
		bgCentral: "var(--bg-central)",
		blackText: "var(--black-text)",
		secondary: "var(--secondary)",
		grayText: "var(--gray-text)",
		primary: "var(--primary)",
		accent: "var(--accent)",
		bgNav: "var(--bg-nav)",
		text: "var(--text)",
	},
} as const;

export const fonts = {
	all: `font-family: 'Assistant', sans-serif;
color: ${theme.colors.text};
letter-spacing: 0.03em;
font-size: 1rem`,
	primary: "'Assistant', sans-serif",
} as const;
