export const MainArea = ({ className = "", ...props }: Props) => (
	<main
		className={`grid-area-main relative flex flex-col px-[5%] py-3 ${className}`}
		{...props}
	/>
);

type Props = React.BaseHTMLAttributes<HTMLButtonElement>;
