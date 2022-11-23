export const ButtonOfGroup = ({
	className = "",
	...props
}: ButtonOfGroupProps) => (
	<button className={`grouped-button ${className} `} {...props} />
);

type ButtonOfGroupProps = React.ButtonHTMLAttributes<HTMLButtonElement>;
