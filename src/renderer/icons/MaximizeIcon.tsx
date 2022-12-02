import type { Component, JSX } from "solid-js";

export const MaximizeIcon: Component<JSX.SvgSVGAttributes<SVGSVGElement>> = (
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
		<path d="M3 3v10h10V3H3zm9 9H4V4h8v8z" />
	</svg>
);
