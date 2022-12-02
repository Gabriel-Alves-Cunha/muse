import type { Component, JSX } from "solid-js";

export const RightIcon: Component<JSX.SvgSVGAttributes<SVGSVGElement>> = (
	props,
) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		stroke="currentColor"
		viewBox="0 0 24 24"
		class="w-6 h-6"
		fill="none"
		{...props}
	>
		<path
			stroke-linecap="round"
			stroke-linejoin="round"
			stroke-width="2"
			d="M9 5l7 7-7 7"
		/>
	</svg>
);
