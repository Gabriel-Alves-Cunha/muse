export const Main = ({ className = "", ...props }: Props) => (
	<main
		className={"main " + className}
		{...props}
	/>
);

type Props = React.BaseHTMLAttributes<HTMLButtonElement>;
