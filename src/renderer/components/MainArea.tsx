export const MainArea = ({ className = "", ...props }: Props) => (
	<main className={`grid-area-main ${className}`} {...props} />
);

type Props = React.BaseHTMLAttributes<HTMLButtonElement>;
