import type { Component, JSX } from "solid-js";

export const Loading: Component<JSX.HTMLAttributes<HTMLDivElement>> = (
	props,
) => (
	<div
		class={`-6 h-6 border-2 border-solid border-transparent border-t-active rounded-full animate-spin ${
			props.class ?? ""
		}`}
		{...props}
	/>
);
