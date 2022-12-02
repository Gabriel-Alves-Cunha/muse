import type { Component, JSX } from "solid-js";

export const CheckMarkIcon: Component<JSX.SvgSVGAttributes<SVGSVGElement>> = (
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
			d="M5 13l4 4L19 7"
		/>
	</svg>
);
