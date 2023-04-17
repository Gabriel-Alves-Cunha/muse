import { forwardRef } from "react";

export const Button = forwardRef<HTMLButtonElement, Props>(
	({ variant, ...props }, forwardedRef) => (
		<button data-variant={variant} data-button ref={forwardedRef} {...props} />
	),
);

Button.displayName = "Button";

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Types:

interface Props
	extends React.DetailedHTMLProps<
		React.ButtonHTMLAttributes<HTMLButtonElement>,
		HTMLButtonElement
	> {
	readonly variant: "large" | "medium" | "input" | "circle";
}
