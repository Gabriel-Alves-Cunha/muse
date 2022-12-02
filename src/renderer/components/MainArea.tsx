import type { Component, JSX } from "solid-js";

export const MainArea: Component<JSX.HTMLAttributes<HTMLElement>> = (props) => (
	<main
		class={`grid-area-main relative flex flex-col px-[5%] py-3 ${
			props.class ?? ""
		}`}
		{...props}
	/>
);
