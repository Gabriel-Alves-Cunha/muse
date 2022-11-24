/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ["./src/renderer/**/*.{html,tsx,ts}"],
	theme: {
		extend: {
			transition: {
				"box-shadow": "box-shadow .2s ease-in-out 32ms",
				bgc: "background-color .1s ease-in-out 32ms",
				scale: "scale .2s ease-in-out 32ms",
			},
			colors: {
				/* Colors */
				"ctx-menu-separator": "var(--ctx-menu-separator)",
				"selected-border": "var(--selected-border)",
				"input-disabled": "var(--input-disabled)",
				"playing-border": "var(--playing-border)",
				active: "var(--active)",

				"accent-light": "var(--accent-light)",
				accent: "var(--accent)",

				/* Scrollbar colors */
				"scrollbar-thumb-hover": "var(--scrollbar-thumb-hover)",
				"scrollbar-thumb": "var(--scrollbar-thumb)",
				scrollbar: "var(--scrollbar)",

				/* Linear gradient colors */
				"lingrad-bottom": "var(--lingrad-bottom)",
				"lingrad-top": "var(--lingrad-top)",

				/* Icon colors */
				"icon-media-player-disabled": "var(--icon-media-player-disabled)",
				"icon-window-button": "var(--icon-window-button)",
				"icon-media-player": "var(--icon-media-player)",
				"icon-deactivated": "var(--icon-deactivated)",
				"icon-active": "var(--icon-active)",
			},
			textColor: {
				"ctx-menu-item-focus": "var(--text-ctx-menu-item-focus)",
				"ctx-menu-item": "var(--text-ctx-menu-item)",
				"ctx-menu": "var(--text-ctx-menu)",

				"decorations-down": "var(--text-decorations-down)",
				placeholder: "var(--text-placeholder)",
				alternative: "var(--text-alternative)",
				disabled: "var(--text-disabled)",
				oposite: "var(--text-oposite)",
				normal: "var(--text-normal)",
				muted: "var(--text-muted)",
				input: "var(--text-input)",
			},
			borderColor: {
				input: "var(--border-input)",
			},
			backgroundColor: {
				"ctx-menu-item-focus": "var(--bg-ctx-menu-item-focus)",
				"ctx-menu": "var(--bg-ctx-menu)",

				"media-player-icon-button-hovered":
					"var(--bg-media-player-icon-button-hovered)",
				"icon-button-hovered": "var(--bg-icon-button-hovered)",

				"decorations-down": "var(--bg-decorations-down)",
				"button-hover": "var(--bg-button-hover)",
				highlight: "var(--bg-highlight)",
				selected: "var(--bg-selected)",
				popover: "var(--bg-popover)",
				playing: "var(--bg-playing)",
				dialog: "var(--bg-dialog)",
				select: "var(--bg-select)",
				button: "var(--bg-button)",
				navbar: "var(--bg-navbar)",
				media: "var(--bg-media)",
				main: "var(--bg-main)",
			},
			boxShadow: {
				glow: "var(--shadow-glow-around-component)",
				popover: "var(--shadow-popover)",
				reflect:
					"0px 50px 70px rgba(0, 0, 0, 0.3), 0px 10px 10px rgba(0, 0, 0, 0.1)",
			},
		},
		fontFamily: {
			secondary: ["Source Sans Pro", "sans-serif"],
			primary: ["Assistant", "sans-serif"],
		},
	},
	plugins: [],
};
