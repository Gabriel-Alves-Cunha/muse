import { forwardRef } from "react";

export const Button = forwardRef(function Button(
	{ className = "", variant, ...props }: Props,
	forwardedRef: React.Ref<HTMLButtonElement>,
) {
	return (
		<button
			className={`button ${variant} ${className}`}
			ref={forwardedRef}
			{...props}
		/>
	);
});

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
