export const CircleIconButton = ({ variant = "small", ...props }: Props) => (
	<button data-circle-icon-button data-variant={variant} {...props} />
);

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	readonly variant?: "small" | "large";
}
