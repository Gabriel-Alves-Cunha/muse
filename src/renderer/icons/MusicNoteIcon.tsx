import type { Component, JSX } from "solid-js";

export const MusicNoteIcon: Component<JSX.SvgSVGAttributes<SVGSVGElement>> = (
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
		<path d="M12 13.535V3h8v3h-6v11a4 4 0 1 1-2-3.465z" />
	</svg>
);
