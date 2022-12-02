import type { Component, JSX } from "solid-js";

export const CloseIcon: Component<JSX.SvgSVGAttributes<SVGSVGElement>> = (
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
			d="M6 18L18 6M6 6l12 12"
			stroke-linejoin="round"
			stroke-linecap="round"
			stroke-width="2"
		/>
	</svg>
);
