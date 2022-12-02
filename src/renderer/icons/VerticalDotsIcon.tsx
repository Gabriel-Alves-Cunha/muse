import type { Component, JSX } from "solid-js";

export const VerticalDotsIcon: Component<JSX.SvgSVGAttributes<SVGSVGElement>> =
	(props) => (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			stroke="currentColor"
			viewBox="0 0 24 24"
			class="w-6 h-6"
			fill="none"
			{...props}
		>
			<path
				d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
				stroke-linejoin="round"
				stroke-linecap="round"
				stroke-width="2"
			/>
		</svg>
	);
