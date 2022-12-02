import type { Component, JSX } from "solid-js";

export const ShuffleOnIcon: Component<JSX.SvgSVGAttributes<SVGSVGElement>> = (
	props,
) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		height="24"
		width="24"
		{...props}
	>
		<path d="M5 46q-1.2 0-2.1-.9Q2 44.2 2 43V4.95q0-1.15.9-2.075.9-.925 2.1-.925h38.05q1.15 0 2.075.925.925.925.925 2.075V43q0 1.2-.925 2.1-.925.9-2.075.9Zm24.1-5.5h11.45V29.05h-3v6.35l-9.3-9.2-2.1 2.15 9.2 9.15H29.1Zm-19.45 0 27.9-27.9v6.3h3V7.45H29.1v3h6.35l-27.9 27.9ZM19.8 21.8l2.15-2.15L9.7 7.45 7.55 9.6Z" />
	</svg>
);
