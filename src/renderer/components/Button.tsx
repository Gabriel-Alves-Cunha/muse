import type { Component, JSX } from "solid-js";

export const Button: Component<ButtonProps> = (props) => (
	<button class={`button ${props.variant} ${props.class ?? ""}`} {...props} />
);

interface ButtonProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
	variant: "large" | "medium" | "input" | "circle";
}
