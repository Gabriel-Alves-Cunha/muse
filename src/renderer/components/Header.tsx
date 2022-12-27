export const Header = ({ className = "", ...props }: Props) => (
	<header className={`main-area-header ${className}`} {...props} />
);

type Props = React.BaseHTMLAttributes<HTMLHeadElement>;
