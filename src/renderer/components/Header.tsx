export const Header = (props: Props): JSX.Element => (
	<header data-main-area-header {...props} />
);

type Props = React.BaseHTMLAttributes<HTMLHeadingElement>;
