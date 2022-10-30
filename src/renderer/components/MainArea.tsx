export const MainArea = ({ className = "", ...props }: Props) => (
	<main
		className={"grid-area-main relative inline-block self-stretch w-full h-full p-[5%] pt-0 main-area " +
			className}
		{...props}
	/>
);

type Props = React.BaseHTMLAttributes<HTMLButtonElement>;
