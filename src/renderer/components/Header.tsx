import type { Component, JSX } from "solid-js";

export const Header: Component<JSX.HTMLAttributes<HTMLElement>> = (props) => (
	<header
		class={`relative flex justify-start items-center h-14 gap-4 mb-[5%] ${
			props.class ?? ""
		}`}
		{...props}
	/>
);
