import type { Component, JSX } from "solid-js";

export const MainGridContainer: Component<JSX.HTMLAttributes<HTMLDivElement>> =
	(props) => (
		<div
			class={`grid-template-for-content-wrapper ${props.class ?? ""}`}
			{...props}
		/>
	);
