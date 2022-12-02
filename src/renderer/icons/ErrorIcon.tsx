import type { Component, JSX } from "solid-js";

export const ErrorIcon: Component<JSX.SvgSVGAttributes<SVGSVGElement>> = (
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
			d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
		/>
	</svg>
);
