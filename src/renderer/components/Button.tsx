import { forwardRef } from "react";

export const Button = forwardRef<HTMLButtonElement, Props>(
	({ variant, ...props }, forwardedRef) => (
		<button
			data-variant={variant}
			ref={forwardedRef}
			type="button"
			data-button
			{...props}
		/>
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
