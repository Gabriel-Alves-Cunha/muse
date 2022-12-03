import type { Component, JSX } from "solid-js";

export const Separator: Component<ButtonProps> = (props) => (
	<div class={`h-[1px] w-[80%] bg-gray-400 ${props.class ?? ""}`} {...props} />
);

type ButtonProps = JSX.HTMLAttributes<HTMLDivElement>;
