export const Right = ({ ...props }: Props) => (
	<p
		className={"flex justify-center items-center pl-4"}
		{...props}
	/>
);

type Props = React.BaseHTMLAttributes<HTMLDivElement>;
