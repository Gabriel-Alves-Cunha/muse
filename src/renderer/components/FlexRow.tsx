export const FlexRow = ({ className, ...props }: Props) => (
	<div className={`flex justify-end gap-5 mt-4 ${className}`} {...props} />
);

type Props = React.BaseHTMLAttributes<HTMLDivElement>;
