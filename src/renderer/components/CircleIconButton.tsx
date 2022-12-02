import type { Component, JSX } from "solid-js";

export const CircleIconButton: Component<ButtonProps> = (props) => (
	<button
		class={`circle-icon-button ${props.variant ?? "small"} ${
			props.class ?? ""
		}`}
		{...props}
	/>
);

interface ButtonProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
	readonly variant?: "small" | "large";
}
