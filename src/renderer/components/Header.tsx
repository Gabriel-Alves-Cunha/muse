export const Header = ({ className, ...props }: Props) => (
	<header
		className={
			`relative flex justify-start items-center h-14 gap-4 mb-[5%] ${className}`
		}
		{...props}
	/>
);

type Props = React.BaseHTMLAttributes<HTMLHeadElement>;
