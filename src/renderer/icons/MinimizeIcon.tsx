import type { Component, JSX } from "solid-js";

export const MinimizeIcon: Component<JSX.SvgSVGAttributes<SVGSVGElement>> = (
	props,
) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		fill="currentColor"
		viewBox="0 0 16 16"
		height="16"
		width="16"
		{...props}
	>
		<path d="M14 8v1H3V8h11z" />
	</svg>
);
