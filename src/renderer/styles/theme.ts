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
	boxShadows: {
		inset_small:
			"inset -3px -3px 4px 0 rgba(255, 255, 255, 0.9), inset 3px 3px 4px 0 rgba(0, 0, 0, 0.07)",
		medium:
			"-6px -6px 8px rgba(255, 255, 255, 0.9), 5px 5px 8px rgba(0, 0, 0, 0.07)",
		small:
			"-3px -3px 4px rgba(255, 255, 255, 0.9), 3px 3px 4px rgba(0, 0, 0, 0.07)",
		glow: "0px 0px 3px 1px",
	},
} as const;

export const fonts = {
	primary: "'Assistant', sans-serif",
	all: `font-family: 'Assistant', sans-serif;
				color: ${theme.colors.text};
				letter-spacing: 0.03em;
				font-size: 1rem`,
} as const;
