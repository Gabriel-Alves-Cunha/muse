import type { Component, JSX } from "solid-js";

export const RightSlot: Component<Props> = (props) => (
	<div
		class="absolute right-0 flex justify-end items-center gap-4 last:pr-4 text-alternative tracking-wider"
		{...props}
	/>
);

type Props = JSX.HTMLAttributes<HTMLDivElement>;
