export const ButtonOfGroup = ({
	className = "",
	...props
}: ButtonOfGroupProps) => (
	<button
		className={`relative flex justify-center items-center bg-button-hover border-none px-5 h-9 transition-colors ease-linear cursor-pointer active:scale-95 first:rounded-l-xl last:rounded-r-xl only:rounded-full ${className}`}
		{...props}
	/>
);

type ButtonOfGroupProps = React.ButtonHTMLAttributes<HTMLButtonElement>;
