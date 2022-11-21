export const CircleIconButton = ({
	variant = "small",
	className = "",
	...props
}: Props) => (
	<button className={`circle-icon-button ${variant} ${className}`} {...props} />
);

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	readonly variant?: "small" | "large";
}
