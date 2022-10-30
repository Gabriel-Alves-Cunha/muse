export const Header = ({ className, ...props }: Props) => (
	<header
		className={"relative flex justify-between items-center h-14 gap-4 mb-[5%] mt-3 " +
			className}
		{...props}
	/>
);

type Props = React.BaseHTMLAttributes<HTMLDivElement>;
