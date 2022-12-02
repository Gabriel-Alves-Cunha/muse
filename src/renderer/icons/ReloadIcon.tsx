import type { Component, JSX } from "solid-js";

export const ReloadIcon: Component<JSX.SvgSVGAttributes<SVGSVGElement>> = (
	props,
) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		fill="#000000"
		height="24"
		width="24"
		{...props}
	>
		<rect width="24" height="24" fill="none" />
		<polyline
			points="176.2 99.7 224.2 99.7 224.2 51.7"
			stroke-linejoin="round"
			stroke-linecap="round"
			stroke-width="16"
			stroke="#000000"
			fill="none"
		/>
		<path
			d="M190.2,190.2a88,88,0,1,1,0-124.4l34,33.9"
			stroke-linejoin="round"
			stroke-linecap="round"
			stroke-width="16"
			stroke="#000000"
			fill="none"
		/>
	</svg>
);
