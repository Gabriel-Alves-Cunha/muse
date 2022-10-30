export const ButtonOfGroup = (
	{ className = "", ...props }: ButtonOfGroupProps,
) => (
	<button
		className={"relative flex justify-center items-center bg-button border-none px-5 h-10 transition-colors ease-in-out duration-200 cursor-pointer active:scale-95 " +
			className}
		{...props}
	/>
);

type ButtonOfGroupProps = React.ButtonHTMLAttributes<HTMLButtonElement>;
