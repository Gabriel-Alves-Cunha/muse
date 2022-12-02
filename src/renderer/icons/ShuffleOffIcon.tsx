import type { Component, JSX } from "solid-js";

export const ShuffleOffIcon: Component<JSX.SvgSVGAttributes<SVGSVGElement>> = (
	props,
) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		height="24"
		width="24"
		{...props}
	>
		<path d="M29.05 40.5v-3h6.25l-9.2-9.15 2.1-2.15 9.3 9.2v-6.35h3V40.5Zm-19.45 0-2.1-2.15 27.9-27.9h-6.35v-3H40.5V18.9h-3v-6.3Zm10.15-18.7L7.5 9.6l2.15-2.15 12.25 12.2Z" />
	</svg>
);
