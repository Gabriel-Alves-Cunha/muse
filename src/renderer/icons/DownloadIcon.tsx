import type { Component, JSX } from "solid-js";

export const DownloadIcon: Component<JSX.SvgSVGAttributes<SVGSVGElement>> = (
	props,
) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		height="24"
		width="24"
		{...props}
	>
		<path fill="none" d="M0 0h24v24H0z" />
		<path d="M3 19h18v2H3v-2zM13 9h7l-8 8-8-8h7V1h2v8z" />
	</svg>
);