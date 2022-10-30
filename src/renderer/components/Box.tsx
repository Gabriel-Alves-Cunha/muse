export const Box = ({ className, ...props }: Props) => (
	<div
		className={"flex justify-center items-center mt-8 " + className}
		{...props}
	/>
);

type Props = React.BaseHTMLAttributes<HTMLDivElement>;
