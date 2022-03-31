/* eslint-disable @typescript-eslint/no-unused-vars */

import { camelCase2Dash } from "@utils/utils";

// export const colors = {
// 	navButtonHoveredColor: "var(--nav-button-hovered-color)",
// 	navButtonActiveColor: "var(--nav-button-active-color)",
// 	navButtonHoveredBg: "var(--nav-button-hovered-bg)",
// 	navButtonActiveBg: "var(--nav-button-active-bg)",
// 	deactivatedIcon: "var(--deactivated-icon)",
// 	buttonHovered: "var(--button-hovered)",
// 	buttonBorder: "var(--button-border)",
// 	accentAlpha: "var(--accent-alpha)",
// 	accentLight: "var(--accent-light)",
// 	activeIcon: "var(--active-icon)",
// 	bgCentral: "var(--bg-central)",
// 	blackText: "var(--black-text)",
// 	boxShadow: "var(--box-shadow)",
// 	secondary: "var(--secondary)",
// 	grayText: "var(--gray-text)",
// 	primary: "var(--primary)",
// 	accent: "var(--accent)",
// 	bgNav: "var(--bg-nav)",
// 	text: "var(--text)",
// } as const;

export const colors_as__name_light_dark = Object.freeze({
	navButtonHoveredColor: [
		"var(--nav-button-hovered-color)",
		"#25306c",
		"black",
	],
	navButtonActiveColor: ["var(--nav-button-active-color)", "white", "black"],
	navButtonHoveredBg: ["var(--nav-button-hovered-bg)", "#c9c2f9", "black"],
	navButtonActiveBg: ["var(--nav-button-active-bg)", "#c1bbec", "black"],
	deactivatedIcon: ["var(--deactivated-icon)", "#a8a8a8", "#a8a8a8"],
	buttonHovered: ["var(--button-hovered)", "#E5E5E5", "#aa00ff99"],
	buttonBorder: ["var(--button-border)", "#aa00ff26", "#E5E5E5"],
	accentAlpha: ["var(--accent-alpha)", "#f1d4ff", "#dd99ff"],
	accentLight: ["var(--accent-light)", "black", "white"],
	activeIcon: ["var(--active-icon)", "#f2f3f7", "white"],
	blackText: ["var(--black-text)", "#edecf8", "black"],
	boxShadow: ["var(--box-shadow)", "#8e8e8e", "black"],
	bgCentral: ["var(--bg-central)", "black", "black"],
	secondary: ["var(--secondary)", "black", "black"],
	primary: ["var(--primary)", "#aa00ff", "black"],
	grayText: ["var(--gray-text)", "#ccc", "#000"],
	accent: ["var(--accent)", "#edecf8", "black"],
	bgNav: ["var(--bg-nav)", "#00525e", "black"],
	text: ["var(--text)", "", "black"],
} as const);

export const color = (name: keyof typeof colors_as__name_light_dark) =>
	colors_as__name_light_dark[name][0];

export const lightColorsAsCSSVariables = Object.entries(
	colors_as__name_light_dark,
).reduce(
	(prev, [colorName, [_name, light]]) => ({
		...prev,
		[`--${camelCase2Dash(colorName)}`]: light,
	}),
	{},
);

export const darkColorsAsCSSVariables = Object.entries(
	colors_as__name_light_dark,
).reduce(
	(prev, [colorName, [_name, _light, dark]]) => ({
		...prev,
		[`--${camelCase2Dash(colorName)}`]: dark,
	}),
	{},
);

/* Make a vertical red line at the middle */
/* height: 100vh,
background: linear-gradient(red, red) no-repeat center/1px 100%, */
