export const CircleIconButton = (
	{ className = "", variant = "small", ...props }: Props,
) => (
	<button
		className={`circle-icon-button circle-icon-button-${variant} ${className}`}
		{...props}
	/>
);

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	readonly variant?: "small" | "large";
}
