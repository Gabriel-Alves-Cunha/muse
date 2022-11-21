export const MainGridContainer = ({ className = "", ...props }: Props) => (
	<div
		className={`grid-template-for-content-wrapper ${className}`}
		{...props}
	/>
);

type Props = React.BaseHTMLAttributes<HTMLDivElement>;
