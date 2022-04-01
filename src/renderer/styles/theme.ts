/* eslint-disable @typescript-eslint/no-unused-vars */

import { camelCase2Dash } from "@utils/utils";

const colors_as__var_light_dark = Object.freeze({
	scrollbarThumbHover: ["var(--scrollbar-thumb-hover)", "#555", "#555"],
	scrollbarThumb: ["var(--scrollbar-thumb)", "#888", "#888"],
	scrollbar: ["var(--scrollbar)", "#f1f1f1", "#f1f1f1"],

	deactivatedIcon: ["var(--deactivated-icon)", "#a8a8a8", "#a8a8a8"],
	activeIcon: ["var(--active-icon)", "#191716", "#f1f0ea"],

	alternativeText: ["var(--alternative-text)", "#ccb69b", "#ccb69b"],
	grayText: ["var(--gray-text)", "#a8a8a8", "#a8a8a8"],
	text: ["var(--text)", "#191716", "#e0ddcf"],

	bgMediaPlayer: ["var(--bg-media-player)", "#efc69b", "#a5907e"],
	bgMain: ["var(--bg-main)", "#ECEBF3", "#191716"],

	buttonHovered: ["var(--button-hovered)", "#dbdadc", "#dbdadc"],

	accent: ["var(--accent)", "#af1b3f", "#550c18"],
} as const);

const color = (name: keyof typeof colors_as__var_light_dark) =>
	colors_as__var_light_dark[name][0];
color.light = (name: keyof typeof colors_as__var_light_dark) =>
	colors_as__var_light_dark[name][1];
color.dark = (name: keyof typeof colors_as__var_light_dark) =>
	colors_as__var_light_dark[name][2];
export { color };

export const lightColorsAsCSSVariables = Object.freeze(
	Object.entries(colors_as__var_light_dark).reduce(
		(prev, [colorName, [_var, light]]) => ({
			...prev,
			[`--${camelCase2Dash(colorName)}`]: light,
		}),
		{},
	),
);

export const darkColorsAsCSSVariables = Object.freeze(
	Object.entries(colors_as__var_light_dark).reduce(
		(prev, [colorName, [_var, _light, dark]]) => ({
			...prev,
			[`--${camelCase2Dash(colorName)}`]: dark,
		}),
		{},
	),
);

/* Make a vertical red line at the middle */
/* height: 100vh,
background: linear-gradient(red, red) no-repeat center/1px 100%, */
