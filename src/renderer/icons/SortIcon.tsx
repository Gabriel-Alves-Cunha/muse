import type { Component, JSX } from "solid-js";

export const SortIcon: Component<JSX.SvgSVGAttributes<SVGSVGElement>> = (
	props,
) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 256 256"
		fill="#000000"
		height="192"
		width="192"
		{...props}
	>
		<rect width="256" height="256" fill="none" />
		<line
			stroke-linejoin="round"
			stroke-linecap="round"
			stroke-width="16"
			stroke="#000000"
			y1="128"
			x2="192"
			y2="128"
			x1="64"
		/>
		<line
			stroke-linejoin="round"
			stroke-linecap="round"
			stroke-width="16"
			stroke="#000000"
			x2="232"
			x1="24"
			y1="80"
			y2="80"
		/>
		<line
			stroke-linejoin="round"
			stroke-linecap="round"
			stroke-width="16"
			stroke="#000000"
			x1="104"
			y1="176"
			x2="152"
			y2="176"
		/>
	</svg>
);
