import { forwardRef } from "react";

export const Button = forwardRef(function Button(
	{ className = "", variant, ...props }: Props,
	forwardedRef: React.Ref<HTMLButtonElement>,
) {
	return (
		<button
			className={`button button-${variant} ${className}`}
			{...props}
			ref={forwardedRef}
		/>
	);
});

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Types:

interface Props extends React.BaseHTMLAttributes<HTMLButtonElement> {
	readonly variant: "large" | "medium" | "input";
}
