import type { Component, JSX } from "solid-js";

export const PauseIcon: Component<JSX.SvgSVGAttributes<SVGSVGElement>> = (
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
			stroke-linejoin="round"
			stroke-linecap="round"
			d="M15 19l-7-7 7-7"
			stroke-width="2"
		/>
	</svg>
);
