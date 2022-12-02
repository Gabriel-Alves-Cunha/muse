import type { Component, JSX } from "solid-js";

export const FlexRow: Component<JSX.HTMLAttributes<HTMLDivElement>> = (
	props,
) => (
	<div class={`flex justify-end gap-5 mt-6 ${props.class ?? ""}`} {...props} />
);
