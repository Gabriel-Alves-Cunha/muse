import type { Component, JSX } from "solid-js";

export const ButtonOfGroup: Component<ButtonOfGroupProps> = (props) => (
	<button
		class={`grouped-button ${props.class ?? ""} `}
		type="button"
		{...props}
	/>
);

type ButtonOfGroupProps = JSX.ButtonHTMLAttributes<HTMLButtonElement>;
