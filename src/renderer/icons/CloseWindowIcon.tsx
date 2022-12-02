import type { Component, JSX } from "solid-js";

export const CloseWindowIcon: Component<JSX.SvgSVGAttributes<SVGSVGElement>> = (
	props,
) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 16 16"
		fill="currentColor"
		height="16"
		width="16"
		{...props}
	>
		<path
			fill-rule="evenodd"
			clip-rule="evenodd"
			d="M8 8.707l3.646 3.647.708-.707L8.707 8l3.647-3.646-.707-.708L8 7.293 4.354 3.646l-.707.708L7.293 8l-3.646 3.646.707.708L8 8.707z"
		/>
	</svg>
);
