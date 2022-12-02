import type { Component, JSX } from "solid-js";

export const Spinner: Component<JSX.HTMLAttributes<HTMLDivElement>> = (
	props,
) => (
	<div class="lds-roller" {...props}>
		<div />
		<div />
		<div />
		<div />
		<div />
		<div />
		<div />
		<div />
	</div>
);
